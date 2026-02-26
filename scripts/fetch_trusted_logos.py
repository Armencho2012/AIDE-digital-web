#!/usr/bin/env python3
"""Download trusted university logos into public/trusted-logos/logo-01..16.png."""

from __future__ import annotations

from pathlib import Path
import time
from urllib.parse import quote

import requests

OUTPUT_DIR = Path("public/trusted-logos")
WIKIPEDIA_FILEPATH_BASE = "https://en.wikipedia.org/wiki/Special:FilePath"
WIDTH = 420

# Ordered to match logo-01.png .. logo-16.png
FILES = [
    "Harvard_University_coat_of_arms.svg",
    "Princeton_seal.svg",
    "Coat_of_Arms_of_Columbia_University.svg",
    "Cornell_University_seal.svg",
    "Seal_of_Leland_Stanford_Junior_University.svg",
    "MIT_Seal.svg",
    "Seal_of_University_of_California,_Berkeley.svg",
    "Seal_of_the_California_Institute_of_Technology.svg",
    "University_of_Chicago_shield.svg",
    "University_of_California_logo.svg",
    "Mcgill_univ_ca_logo.png",
    "University_of_Washington_seal.svg",
    "Yale_University_Shield_1.svg",
    "University_of_Maryland_seal.svg",
    "Arms_of_University_of_Oxford.svg",
    "Coat_of_Arms_of_the_University_of_Cambridge.svg",
]


def fetch_logo(session: requests.Session, file_name: str) -> bytes:
    url = f"{WIKIPEDIA_FILEPATH_BASE}/{quote(file_name)}?width={WIDTH}"

    for attempt in range(7):
        response = session.get(url, timeout=60, allow_redirects=True)

        if response.status_code == 200 and response.headers.get("content-type", "").startswith("image/"):
            return response.content

        if response.status_code in (429, 503):
            sleep_seconds = min(2 ** attempt, 20)
            print(f"Rate limited for {file_name}. Retrying in {sleep_seconds}s...")
            time.sleep(sleep_seconds)
            continue

        raise RuntimeError(
            f"Failed to fetch {file_name}: HTTP {response.status_code} "
            f"({response.headers.get('content-type', 'unknown type')})"
        )

    raise RuntimeError(f"Failed to fetch {file_name}: exceeded retry attempts")


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    session = requests.Session()
    session.headers.update({"User-Agent": "AideTrustedLogosBot/1.0"})

    for index, file_name in enumerate(FILES, start=1):
        data = fetch_logo(session, file_name)
        out_path = OUTPUT_DIR / f"logo-{index:02}.png"
        out_path.write_bytes(data)
        print(f"Saved {out_path} <- {file_name}")
        # Gentle pacing to avoid hitting Wikimedia thumbnail rate limits.
        time.sleep(1.25)


if __name__ == "__main__":
    main()
