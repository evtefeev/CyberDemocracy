from collections import defaultdict
import time

from fastapi import FastAPI, UploadFile, File
import httpx
from pydantic import BaseModel
from .html_parser import parse_law
from fastapi import FastAPI, Request, HTTPException, Depends
import asyncio
from fastapi.middleware.cors import CORSMiddleware

lock = asyncio.Lock()


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # лучше заменить на фронтенд домен позже
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health():
    return {"status": "ok"}

@app.get("/")
def root():
    return {"status": "ok"}

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

   
    result = parse_law(html)
    

    return result
