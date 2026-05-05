import re
import json
from bs4 import BeautifulSoup


# === REGEX ===
RE_SECTION = re.compile(r"Розділ\s+[IVXLC]+", re.IGNORECASE)
RE_ARTICLE = re.compile(r"^Стаття\s+\d+")
RE_PART = re.compile(r"^\d+\.")
RE_POINT = re.compile(r"^(\d+(?:-\d+)*)\)\s*(.*)")


def clean_html(html: str):
    soup = BeautifulSoup(html, "html.parser")

    article = soup.select_one("#article") or soup

    for tag in article(["script", "style", "img", "svg"]):
        tag.decompose()

    lines = []
    for p in article.find_all("p"):
        text = p.get_text(" ", strip=True)
        if text:
            lines.append(text)

    return lines


def parse_points(lines):
    items = []
    current_item = None

    for line in lines:
        m = RE_POINT.match(line)

        if m:
            key = m.group(1)
            text = m.group(2)

            # основной пункт
            if "-" not in key:
                current_item = {
                    "id": key,
                    "text": text,
                    "subitems": []
                }
                items.append(current_item)

            # подпункт (2-1)
            else:
                parent_id = key.split("-")[0]

                sub = {
                    "id": key,
                    "text": text
                }

                parent = next((i for i in items if i["id"] == parent_id), None)

                if parent:
                    parent["subitems"].append(sub)
                else:
                    items.append({
                        "id": key,
                        "text": text,
                        "subitems": []
                    })

        else:
            if current_item:
                current_item["text"] += " " + line

    return items


def parse_law(html: str):
    lines = clean_html(html)

    result = {
        "title": None,
        "sections": []
    }

    current_section = None
    current_article = None
    current_part = None

    buffer_points = []

    for line in lines:

        # === TITLE ===
        if not result["title"] and "ЗАКОН УКРАЇНИ" not in line:
            result["title"] = line
            continue

        # === SECTION ===
        if RE_SECTION.search(line):
            current_section = {
                "title": line,
                "articles": []
            }
            result["sections"].append(current_section)
            current_article = None
            continue

        # === ARTICLE ===
        if RE_ARTICLE.match(line):
            current_article = {
                "title": line,
                "parts": []
            }

            if current_section is None:
                current_section = {"title": None, "articles": []}
                result["sections"].append(current_section)

            current_section["articles"].append(current_article)
            current_part = None
            continue

        # === PART (1., 2.) ===
        if RE_PART.match(line):
            # сохранить предыдущие points
            if current_part and buffer_points:
                current_part["points"] = parse_points(buffer_points)
                buffer_points = []

            current_part = {
                "id": line.split(".")[0],
                "text": line,
                "points": []
            }

            if current_article:
                current_article["parts"].append(current_part)

            continue

        # === POINT OR SUBPOINT ===
        if RE_POINT.match(line):
            buffer_points.append(line)
            continue

        # === CONTINUATION ===
        if buffer_points:
            buffer_points[-1] += " " + line
            continue

        if current_part:
            current_part["text"] += " " + line

    # финальный flush
    if current_part and buffer_points:
        current_part["points"] = parse_points(buffer_points)

    return result


# === RUN ===
if __name__ == "__main__":
    with open("backend/temp.html", encoding="utf-8") as f:
        html = f.read()

    data = parse_law(html)

    with open("output.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print("Done -> output.json")