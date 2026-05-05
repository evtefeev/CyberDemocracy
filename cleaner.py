import re
from bs4 import BeautifulSoup

def clean_law_html(html: str) -> str:
    soup = BeautifulSoup(html, "html.parser")

    # 1. Видаляємо повністю непотрібні блоки
    for tag in soup(["script", "style", "noscript", "head", "meta", "link"]):
        tag.decompose()

    # 2. Видаляємо навігаційні/службові блоки по id/class
    unwanted_selectors = [
        "#prnpanel",
        "#header",
        "#footer",
        ".navbar",
        ".breadcrumb",
        ".menu",
        ".navigation",
        ".print",
    ]

    for selector in unwanted_selectors:
        for tag in soup.select(selector):
            tag.decompose()

    # 3. Витягуємо текст
    text = soup.get_text(separator="\n")

    # 4. Чистимо рядки
    lines = []
    for line in text.splitlines():
        line = line.strip()

        # фільтр сміттєвих рядків
        if not line:
            continue
        if len(line) < 2:
            continue
        if re.match(r"^(http|www\.|©)", line):
            continue

        # прибираємо зайві пробіли
        line = re.sub(r"\s+", " ", line)

        lines.append(line)

    # 5. Об'єднуємо з нормальними переносами
    cleaned_text = "\n".join(lines)

    # 6. Додаткове прибирання артефактів типу CSS-індексів
    cleaned_text = re.sub(r"\xa0", " ", cleaned_text)
    cleaned_text = re.sub(r"\n{2,}", "\n\n", cleaned_text)

    return cleaned_text



def clean_rada_law(html: str) -> str:
    soup = BeautifulSoup(html, "html.parser")

    article = soup.select_one("#article") or soup

    for tag in article(["script", "style", "noscript", "img", "svg"]):
        tag.decompose()

    for tag in article.find_all(["a", "span"]):
        tag.unwrap()

    for table in article.find_all("table"):
        table.decompose()

    paragraphs = article.find_all("p")

    blocks = []

    for p in paragraphs:
        # ВАЖЛИВО: preserve structure inside paragraph
        text = p.get_text(separator="\n", strip=True)

        # нормалізація пробілів, але НЕ переносів між рядками
        text = re.sub(r"[ \t]+", " ", text)

        lines = [line.strip() for line in text.split("\n") if line.strip()]

        if not lines:
            continue

        block = "\n".join(lines)

        if len(block) < 3:
            continue

        if block.lower().startswith(("друкувати", "допомога")):
            continue

        blocks.append(block)

    result = "\n\n".join(blocks)

    # прибираємо подвійні пробіли
    result = re.sub(r"[ \t]+", " ", result)

    # нормалізація пустих рядків
    result = re.sub(r"\n{3,}", "\n\n", result)

    return result.strip()



if __name__ == "__main__":
    with open("law.html", "r", encoding="utf-8") as f:
        html = f.read()

    result = clean_law_html(html)

    with open("clean_law.txt", "w", encoding="utf-8") as f:
        f.write(result)

    print("Done → clean_law.txt")