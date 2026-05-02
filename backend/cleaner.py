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

    # 1. Беремо тільки основний контент
    article = soup.select_one("#article")
    if not article:
        article = soup  # fallback

    # 2. Видаляємо непотрібне
    for tag in article(["script", "style", "noscript", "img", "svg"]):
        tag.decompose()

    # 3. Видаляємо службові елементи (якорі, span-и стилів)
    for tag in article.find_all(["a", "span"]):
        # залишаємо текст, але прибираємо сам тег
        tag.unwrap()

    # 4. Видаляємо таблиці (герб, шапка)
    for table in article.find_all("table"):
        table.decompose()

    # 5. Витягуємо текст тільки з абзаців
    paragraphs = article.find_all("p")

    lines = []
    for p in paragraphs:
        text = p.get_text(" ", strip=True)

        # чистка
        text = re.sub(r"\s+", " ", text)

        if not text:
            continue

        # фільтр сміття
        if len(text) < 3:
            continue
        if text.lower().startswith(("друкувати", "допомога")):
            continue

        lines.append(text)

    # 6. Пост-обробка
    result = "\n".join(lines)

    # прибираємо артефакти типу "8 - 1"
    result = re.sub(r"\s*-\s*", "-", result)

    # нормалізація переносів
    result = re.sub(r"\n{2,}", "\n\n", result)

    return result



if __name__ == "__main__":
    with open("law.html", "r", encoding="utf-8") as f:
        html = f.read()

    result = clean_law_html(html)

    with open("clean_law.txt", "w", encoding="utf-8") as f:
        f.write(result)

    print("Done → clean_law.txt")