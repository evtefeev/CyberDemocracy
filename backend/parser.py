import re
import json


# -----------------------------
# HELPERS
# -----------------------------

def clean(t):
    return re.sub(r"\s+", " ", t).strip()


def preprocess(text: str) -> str:
    # 1. Видалити {...}
    text = re.sub(r"\{.*?\}", "", text)

    # 2. Вирізати ПОГОДЖЕНО
    text = re.sub(
        r"ПОГОДЖЕНО:?.*?(?=ЗАТВЕРДЖЕНО|$)",
        "",
        text,
        flags=re.DOTALL
    )

    # 3. Вирізати ЗАТВЕРДЖЕНО
    text = re.sub(
        r"ЗАТВЕРДЖЕНО.*?(?=\n\s*\n|Розділ\s+[IVXLC]+|Стаття\s+\d+|$)",
        "",
        text,
        flags=re.DOTALL
    )

    # 4. Видалити Додатки
    text = re.sub(
        r"Додаток\s*\d+.*?(?=\n\s*\n|Розділ\s+[IVXLC]+|Стаття\s+\d+|$)",
        "",
        text,
        flags=re.DOTALL
    )

    # 5. Об'єднати заголовок розділу
    text = re.sub(
        r"(Розділ\s+[IVXLC]+)\n([А-ЯІЇЄҐ\s]+)",
        r"\1 \2",
        text
    )

    return text.strip()


def is_section(line):
    return re.match(r"Розділ\s+[IVXLC]+", line)


def is_article(line):
    return re.match(r"Стаття\s+\d+", line)


def is_transition_point(line):
    return re.match(r"^\d+(-\d+)?\.", line)


def is_item(line):
    return re.match(r"^\d+\)", line)

def is_date(text):
    return bool(re.search(r"\b\d{2}\.\d{2}\.\d{4}\b", text))

def is_valid_point(match, text):
    start = match.start()

    # дивимось вперед
    tail = text[start:start+20]

    # якщо це дата → пропускаємо
    if re.match(r"\d{1,2}\.\d{1,2}\.\d{4}", tail):
        return False

    return True

# -----------------------------
# DETECTOR
# -----------------------------

def detect_document_type(text: str) -> str:
    text_lower = text.lower()[:500]

    if "закон україни" in text_lower:
        return "law"

    if "наказ" in text_lower and "міністер" in text_lower:
        return "order"

    if "постанова" in text_lower:
        return "resolution"

    if "кодекс україни" in text_lower:
        return "code"

    return "structured"

def extract_order_meta(text: str):
    meta = {}

    # орган (перший блок caps)
    org_match = re.search(r"^[А-ЯІЇЄҐ\s\"«»]+", text)
    if org_match:
        meta["authority"] = clean(org_match.group(0))

    # тип документа
    if "НАКАЗ" in text:
        meta["document_type"] = "order"

    # дата
    date_match = re.search(r"\d{2}\.\d{2}\.\d{4}", text)
    if date_match:
        meta["date"] = date_match.group(0)

    # номер
    num_match = re.search(r"№\s*\d+", text)
    if num_match:
        meta["number"] = num_match.group(0)

    # реєстрація в Мін'юсті
    reg_match = re.search(
        r"Зареєстровано.*?№\s*\d+/\d+",
        text,
        re.DOTALL
    )
    if reg_match:
        meta["registration"] = clean(reg_match.group(0))

    # назва (рядок після реєстрації або перед "Відповідно")
    title_match = re.search(
        r"Про\s+.+?(?=\n\n|Відповідно)",
        text,
        re.DOTALL
    )
    if title_match:
        meta["title"] = clean(title_match.group(0))

    # підписант
    signer_match = re.search(r"\n([А-ЯІЇЄҐ]\.[А-ЯІЇЄҐ]\.\s*[А-Яа-яІЇЄҐ\-]+)", text)
    if signer_match:
        meta["signer"] = signer_match.group(1)

    return meta

def extract_meta_blocks(text: str):
    meta = {}

    # -------------------------
    # ПОГОДЖЕНО
    # -------------------------
    agreed_match = re.search(
        r"ПОГОДЖЕНО:?(.*?)(?=ЗАТВЕРДЖЕНО|$)",
        text,
        re.DOTALL
    )

    if agreed_match:
        block = agreed_match.group(1).strip()

        lines = [clean(l) for l in block.split("\n") if l.strip()]

        if lines:
            meta["agreed_body"] = lines[0]  # орган
        if len(lines) > 1:
            meta["agreed_person"] = lines[-1]  # підпис

    # -------------------------
    # ЗАТВЕРДЖЕНО
    # -------------------------
    approved_match = re.search(
        r"ЗАТВЕРДЖЕНО(.*?)(?=\n\s*\n|Розділ\s+[IVXLC]+|Стаття\s+\d+|$)",
        text,
        re.DOTALL
    )

    if approved_match:
        block = approved_match.group(1).strip()

        # дата
        date_match = re.search(r"\d{2}\.\d{2}\.\d{4}", block)
        if date_match:
            meta["approved_date"] = date_match.group(0)

        # номер
        num_match = re.search(r"№\s*\d+", block)
        if num_match:
            meta["approved_number"] = num_match.group(0)

        # орган (перший рядок)
        lines = [clean(l) for l in block.split("\n") if l.strip()]
        if lines:
            meta["approved_body"] = lines[0]

    return meta

# -----------------------------
# PARSE ITEMS (1) 2) ...)
# -----------------------------

def parse_items(lines, start_index):
    items = []
    i = start_index

    current = None

    while i < len(lines):
        line = lines[i].strip()

        if is_item(line):
            if current:
                items.append(current)

            num, txt = line.split(")", 1)

            current = {
                "number": num,
                "text": clean(txt)
            }

        elif is_transition_point(line):
            break

        else:
            if current:
                current["text"] += " " + clean(line)

        i += 1

    if current:
        items.append(current)

    return items, i


# -----------------------------
# PARSE STRUCTURED (перехідні)
# -----------------------------

def parse_structured_block(block: str):
    lines = block.split("\n")

    points = []
    i = 0

    current = None

    while i < len(lines):
        line = lines[i].strip()

        if not line:
            i += 1
            continue

        # пункт 1. / 16-1.
        if is_transition_point(line):
            if current:
                points.append(current)

            num, txt = line.split(".", 1)

            current = {
                "number": num,
                "text": clean(txt),
                "items": []
            }

            # перевірка підпунктів
            subitems, new_i = parse_items(lines, i + 1)
            current["items"] = subitems
            i = new_i
            continue

        else:
            if current:
                current["text"] += " " + clean(line)

        i += 1

    if current:
        points.append(current)

    return points


# -----------------------------
# PARSE ARTICLES
# -----------------------------

def parse_articles(block: str):
    articles = []

    parts = re.split(r"(Стаття\s+\d+\.?.*)", block)

    current_article = None

    for part in parts:
        part = part.strip()
        if not part:
            continue

        if is_article(part):
            current_article = {
                "title": clean(part),
                "text": ""
            }
            articles.append(current_article)
        else:
            if current_article:
                current_article["text"] += " " + clean(part)

    return articles


# -----------------------------
# MAIN PARSER (HYBRID)
# -----------------------------

def parse_law(text: str):
    result = {
        "meta": {},
        "sections": []
    }

    # META
    title = re.search(r"Конституція України", text)
    if title:
        result["meta"]["title"] = "Конституція України"

    result["meta"]["changes"] = re.findall(
        r"№\s*\d+[-–]?\w*\s+від\s+\d{2}\.\d{2}\.\d{4}",
        text
    )

    # SECTIONS
    sections = re.split(r"(Розділ\s+[IVXLC]+.*)", text)

    current_section = None

    for block in sections:
        block = block.strip()
        if not block:
            continue

        if is_section(block):
            current_section = {
                "title": clean(block),
                "articles": [],
                "points": []
            }
            result["sections"].append(current_section)
            continue

        if not current_section:
            continue

        # --- HYBRID LOGIC ---
        if "Стаття" in block:
            current_section["articles"] = parse_articles(block)
        else:
            current_section["points"] = parse_structured_block(block)

    return result

def parse_order(text: str):
    result = {
        "meta": extract_order_meta(text),
        "body": {
            "preamble": "",
            "orders": [],
            "sections": []
        }
    }

    # -------------------------
    # Розділення preamble / наказів
    # -------------------------
    parts = re.split(r"НАКАЗУЮ:", text)

    if len(parts) < 2:
        return result

    result["body"]["preamble"] = clean(parts[0])

    body = parts[1]

    lines = body.split("\n")

    i = 0
    current_order = None

    # -------------------------
    # ПУНКТИ НАКАЗУ (1. 2. 3.)
    # -------------------------
    while i < len(lines):
        line = lines[i].strip()

        if re.match(r"^\d+\.", line):
            if current_order:
                result["body"]["orders"].append(current_order)

            num, txt = line.split(".", 1)

            current_order = {
                "number": num,
                "text": clean(txt)
            }

        elif line.startswith("I.") or line.startswith("II.") or line.startswith("III."):
            break

        else:
            if current_order:
                current_order["text"] += " " + clean(line)

        i += 1

    if current_order:
        result["body"]["orders"].append(current_order)

    # -------------------------
    # ВКЛАДЕНИЙ ДОКУМЕНТ (ПОРЯДОК)
    # -------------------------
    remaining_text = "\n".join(lines[i:])

    if "I." in remaining_text:
        result["body"]["sections"] = parse_sections(remaining_text)

    return result


def parse_sections(text: str):
    sections = []

    matches = list(re.finditer(r"([IVX]+\.\s+[^\n]+)", text))

    for i, match in enumerate(matches):
        start = match.start()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)

        block = text[start:end].strip()

        title = match.group(1)

        content = block[len(title):].strip()

        sections.append({
            "title": clean(title),
            "points": parse_points(content)
        })

    return sections


def parse_points(text: str):
    points = []

    pattern = re.finditer(r"\b(\d{1,2}\.\d{1,2}\.)\s", text)

    matches = [m for m in pattern if is_valid_point(m, text)]

    for i, match in enumerate(matches):
        start = match.start()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)

        block = text[start:end].strip()

        num = match.group(1)

        text_part = block[len(match.group(1)):].strip()

        points.append({
            "number": num,
            "text": clean(text_part)
        })

    return points

# -----------------------------
# ROUTER
# -----------------------------

def parse_document(text: str):
    text = preprocess(text)

    doc_type = detect_document_type(text)

    if doc_type == "law":
        return parse_law(text)

    if doc_type == "order":
        return parse_order(text)

    return {
        "type": "structured",
        "sections": parse_structured_block(text)
    }


# -----------------------------
# RUN
# -----------------------------

if __name__ == "__main__":
    name = "nakaz.txt"
    out_name = name.split(".")[0] + ".json"
    with open(name, "r", encoding="utf-8") as f:
        text = f.read()

    parsed = parse_document(text)

    with open(out_name, "w", encoding="utf-8") as f:
        json.dump(parsed, f, ensure_ascii=False, indent=2)

    print(f"DONE -> {out_name}")