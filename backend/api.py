from collections import defaultdict
import time

from fastapi import FastAPI, UploadFile, File
import httpx
from pydantic import BaseModel
from cleaner import clean_law_html, clean_rada_law
from parser import parse_document
from fastapi import FastAPI, Request, HTTPException, Depends
import asyncio

lock = asyncio.Lock()


app = FastAPI()


# Хранилища
last_request_time = {}
daily_requests = defaultdict(lambda: {"count": 0, "reset_time": 0})

COOLDOWN = 5  # секунд
DAILY_LIMIT = 100
DAY_SECONDS = 86400


async def rate_limiter(request: Request):
    async with lock:
        client_ip = request.client.host
        now = time.time()

        last_time = last_request_time.get(client_ip)
        if last_time and now - last_time < COOLDOWN:
            raise HTTPException(429, "Cooldown")

        last_request_time[client_ip] = now

        data = daily_requests[client_ip]

        if now > data["reset_time"]:
            data["count"] = 0
            data["reset_time"] = now + DAY_SECONDS

        if data["count"] >= DAILY_LIMIT:
            raise HTTPException(429, "Daily limit")

        data["count"] += 1


@app.post("/txt_to_json")
async def txt_to_json(file: UploadFile = File(...)):
    content = await file.read()
    text = content.decode("utf-8")

    result = parse_document(text)

    return result


class LinkRequest(BaseModel):
    link: str


@app.post("/link_to_json")
async def link_to_json(
    payload: LinkRequest,
    request: Request,
    _: None = Depends(rate_limiter)
):
    link = payload.link.split("#")[0] + "/print"
    headers = {
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9,uk;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
    }

    headers.update({
        "Referer": "https://google.com/",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
    })

    async with httpx.AsyncClient(headers=headers, follow_redirects=True, timeout=20.0) as client:
        try:
            response = await client.get(link)
            response.raise_for_status()
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                raise HTTPException(status_code=404, detail="Page not found")
            raise HTTPException(
                status_code=502, detail="Upstream request failed")

        content = response.content

    html = content.decode("utf-8")
    with open("temp.html", "w") as fil:
        fil.write(html)
    # print(html)
    # print('-'*30)
    clean_text = clean_rada_law(html)
    with open("clean_text_temp.txt", "w") as fil:
        fil.write(clean_text)
    print(clean_text)
    print('-'*30)
    result = parse_document(clean_text)
    print(result)
    print('-'*30)

    return result
