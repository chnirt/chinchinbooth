"""Generate the WebP variants used by the frame picker and strip preview."""

from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import json
import re
import subprocess


ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
CATALOG = ROOT / "src/constants/assets.ts"
OUTPUT = PUBLIC / "frame-assets"
MANIFEST = ROOT / "src/constants/frame-assets.json"


def optimize(url):
    source = PUBLIC / url.lstrip("/")
    target = (OUTPUT / url.lstrip("/")).with_suffix(".webp")
    target.parent.mkdir(parents=True, exist_ok=True)
    thumbnail = target.with_suffix(".thumb.webp")
    for destination, height, quality in [(target, 1800, 90), (thumbnail, 360, 76)]:
        subprocess.run(
            [
                "cwebp", "-quiet", "-q", str(quality), "-alpha_q", "100",
                "-resize", "0", str(height), "-resize_mode", "down_only",
                str(source), "-o", str(destination),
            ],
            check=True,
        )
    return source.stat().st_size, target.stat().st_size, thumbnail.stat().st_size


def main():
    active_catalog = "\n".join(
        line for line in CATALOG.read_text().splitlines()
        if not line.lstrip().startswith("//")
    )
    urls = sorted(set(re.findall(
        r'(?:overlayUrl|backgroundUrl): "(/[^"]+\.png)"', active_catalog
    )))
    with ThreadPoolExecutor(max_workers=8) as pool:
        sizes = list(pool.map(optimize, urls))
    MANIFEST.write_text(json.dumps(urls, indent=2) + "\n")
    original, preview, thumbnails = map(sum, zip(*sizes))
    print(f"{len(urls)} layers: PNG {original:,} B, preview {preview:,} B, thumbnails {thumbnails:,} B")


if __name__ == "__main__":
    main()
