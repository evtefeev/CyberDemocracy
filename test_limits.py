import asyncio
import httpx

URL = "http://127.0.0.1:8001/link_to_json"

payload = {
    "link": "https://example.com"
}


async def test_cooldown():
    print("\n=== TEST: cooldown ===")

    async with httpx.AsyncClient() as client:
        r1 = await client.post(URL, json=payload)
        print(r1.status_code)

        r2 = await client.post(URL, json=payload)
        print(r2.status_code)

        await asyncio.sleep(5)

        r3 = await client.post(URL, json=payload)
        print(r3.status_code)


async def test_daily_limit():
    print("\n=== TEST: daily limit ===")

    async with httpx.AsyncClient() as client:
        for _ in range(105):
            r = await client.post(URL, json=payload)
            print(r.status_code)
            # await asyncio.sleep(5)


async def burst_test():
    print("\n=== TEST: burst ===")

    async with httpx.AsyncClient() as client:
        tasks = [client.post(URL, json=payload) for _ in range(20)]
        responses = await asyncio.gather(*tasks)

        for r in responses:
            print(r.status_code)


async def main():
    await test_cooldown()
    await test_daily_limit()
    await burst_test()


if __name__ == "__main__":
    asyncio.run(main())