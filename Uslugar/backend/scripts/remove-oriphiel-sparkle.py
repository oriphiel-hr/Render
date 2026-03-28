# -*- coding: utf-8 -*-
"""Ukloni mali „sparkle/romb” artefakt s Oriphiel slika (NCC + zamjena + blagi blur)."""
from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

DEFAULT_ASSETS = Path(r"C:\ORIPHIEL\output\oriphiel-ad-assets")
DEFAULT_NAMES = [
    "oglasi-iznajmljivaci.jpg",
    "oglasi-opg.jpg",
    "oglasi-tvrtke-obrti.jpg",
    "oglasi-udruge.jpg",
]

IMAGE_SUFFIXES = {".png", ".jpg", ".jpeg", ".jfif", ".webp"}


def list_all_images(assets: Path) -> list[Path]:
    """Sve slike u mapi osim backupa."""
    out: list[Path] = []
    if not assets.is_dir():
        return out
    for p in sorted(assets.iterdir()):
        if not p.is_file():
            continue
        if p.suffix.lower() not in IMAGE_SUFFIXES:
            continue
        low = p.name.lower()
        if low.endswith(".bak") or ".bak." in low or "pre-fix" in low:
            continue
        out.append(p)
    return out


def roi_ratios_for(path: Path) -> tuple[float, float, float, float]:
    """(xmin, xmax, ymin, ymax) udio širine/visine za traženje romba."""
    n = path.name.lower()
    if n == "oglasi-opg.jpg":
        return (0.62, 1.0, 0.72, 1.0)
    if n.startswith("oglasi-") and n.endswith(".jpg"):
        return (0.0, 1.0, 0.30, 1.0)
    return (0.0, 1.0, 0.12, 1.0)


def ncc_score(patch: np.ndarray, tpl: np.ndarray) -> float:
    a = patch.astype(np.float64) - patch.mean()
    b = tpl - tpl.mean()
    da = np.sqrt((a * a).sum()) + 1e-6
    db = np.sqrt((b * b).sum()) + 1e-6
    return float((a * b).sum() / (da * db))


def find_best_match(
    gray: np.ndarray,
    tpl: np.ndarray,
    coarse: int = 8,
    y_min_ratio: float = 0.0,
    y_max_ratio: float = 1.0,
    x_min_ratio: float = 0.0,
    x_max_ratio: float = 1.0,
) -> tuple[float, int, int]:
    th, tw = tpl.shape
    H, W = gray.shape
    y0 = max(0, int(H * y_min_ratio))
    y1 = min(H - th, int(H * y_max_ratio))
    x0 = max(0, int(W * x_min_ratio))
    x1 = min(W - tw, int(W * x_max_ratio))
    if y1 < y0 or x1 < x0:
        return (-1.0, 0, 0)
    best = (-1.0, x0, y0)
    for y in range(y0, y1 + 1, coarse):
        for x in range(x0, x1 + 1, coarse):
            s = ncc_score(gray[y : y + th, x : x + tw], tpl)
            if s > best[0]:
                best = (s, x, y)
    bx, by = best[1], best[2]
    r = coarse + 3
    for y in range(max(y0, by - r), min(y1, by + r + 1)):
        for x in range(max(x0, bx - r), min(x1, bx + r + 1)):
            s = ncc_score(gray[y : y + th, x : x + tw], tpl)
            if s > best[0]:
                best = (s, x, y)
    return best


def ring_median_rgb(img: Image.Image, x0: int, y0: int, x1: int, y1: int, ring: int = 6) -> tuple[int, int, int]:
    px = img.load()
    w, h = img.size
    samples: list[tuple[int, int, int]] = []
    for y in range(max(0, y0 - ring), min(h, y1 + ring)):
        for x in range(max(0, x0 - ring), min(w, x1 + ring)):
            if x0 <= x < x1 and y0 <= y < y1:
                continue
            samples.append(px[x, y][:3])
    if not samples:
        return (40, 44, 58)
    arr = np.array(samples, dtype=np.int64)
    return tuple(int(v) for v in np.median(arr, axis=0))


def remove_sparkle(
    path: Path,
    tpl_gray: np.ndarray,
    min_score: float = 0.52,
    margin: int = 8,
    y_min_ratio: float = 0.12,
    y_max_ratio: float = 1.0,
    x_min_ratio: float = 0.0,
    x_max_ratio: float = 1.0,
) -> bool:
    im = Image.open(path).convert("RGB")
    gray = np.array(im.convert("L"), dtype=np.float64)
    score, x, y = find_best_match(
        gray,
        tpl_gray,
        y_min_ratio=y_min_ratio,
        y_max_ratio=y_max_ratio,
        x_min_ratio=x_min_ratio,
        x_max_ratio=x_max_ratio,
    )
    th, tw = tpl_gray.shape
    if score < min_score:
        print(f"  skip {path.name}: NCC={score:.3f} < {min_score}")
        return False

    x0 = max(0, x - margin)
    y0 = max(0, y - margin)
    x1 = min(im.width, x + tw + margin)
    y1 = min(im.height, y + th + margin)
    fill = ring_median_rgb(im, x0, y0, x1, y1, ring=margin + 4)

    crop = im.crop((x0, y0, x1, y1))
    dr = ImageDraw.Draw(crop)
    cx = x - x0 + tw // 2
    cy = y - y0 + th // 2
    rx = tw // 2 + margin
    ry = th // 2 + margin
    dr.ellipse((cx - rx, cy - ry, cx + rx, cy + ry), fill=fill)
    crop = crop.filter(ImageFilter.GaussianBlur(radius=1.6))
    im.paste(crop, (x0, y0))

    suf = path.suffix.lower()
    if suf in (".jpg", ".jpeg", ".jfif"):
        im.save(path, "JPEG", quality=95, optimize=True)
    else:
        im.save(path, optimize=True)
    print(f"  OK {path.name}: NCC={score:.3f} patch=({x0},{y0})-({x1},{y1})")
    return True


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--template", type=Path, required=True, help="Crop PNG romba iz slike")
    ap.add_argument("--assets", type=Path, default=DEFAULT_ASSETS)
    ap.add_argument("--min-score", type=float, default=0.50)
    ap.add_argument(
        "--ymin-ratio",
        type=float,
        default=0.12,
        help="Donja granica traženja po Y (udio visine)",
    )
    ap.add_argument("--ymax-ratio", type=float, default=1.0, help="Gornja granica Y (udio)")
    ap.add_argument("--xmin-ratio", type=float, default=0.0, help="Lijeva granica X (udio)")
    ap.add_argument("--xmax-ratio", type=float, default=1.0, help="Desna granica X (udio)")
    ap.add_argument(
        "--quadrant",
        choices=["", "br", "bl", "tr", "tl"],
        default="",
        help="br=donji desno (0.45–1.0 x i y), ostalo slično",
    )
    ap.add_argument(
        "--all",
        action="store_true",
        help="Obrađi sve slike u --assets (png/jpg/jfif/webp), bez .bak; ROI po datoteci (roi_ratios_for)",
    )
    ap.add_argument(
        "--uniform",
        action="store_true",
        help="Uz --all: isti ROI za sve (ymin/quadrant s CLI-a), inače po datoteci",
    )
    ap.add_argument("files", nargs="*", help="Dodatne datoteke (inače četiri oglasi-*.jpg)")
    args = ap.parse_args()

    x0, x1, y0, y1 = args.xmin_ratio, args.xmax_ratio, args.ymin_ratio, args.ymax_ratio
    if args.quadrant == "br":
        x0, x1, y0, y1 = 0.42, 1.0, 0.42, 1.0
    elif args.quadrant == "bl":
        x0, x1, y0, y1 = 0.0, 0.58, 0.42, 1.0
    elif args.quadrant == "tr":
        x0, x1, y0, y1 = 0.42, 1.0, 0.0, 0.58
    elif args.quadrant == "tl":
        x0, x1, y0, y1 = 0.0, 0.58, 0.0, 0.58

    tpl = Image.open(args.template).convert("L")
    tpl_gray = np.array(tpl, dtype=np.float64)

    if args.all:
        paths = list_all_images(args.assets)
        if not paths:
            print(f"nema slika u {args.assets}")
            return
        print(f"--all: {len(paths)} datoteka")
        for p in paths:
            ax0, ax1, ay0, ay1 = (x0, x1, y0, y1) if args.uniform else roi_ratios_for(p)
            remove_sparkle(
                p,
                tpl_gray,
                min_score=args.min_score,
                y_min_ratio=ay0,
                y_max_ratio=ay1,
                x_min_ratio=ax0,
                x_max_ratio=ax1,
            )
        return

    names = args.files if args.files else DEFAULT_NAMES
    for n in names:
        p = args.assets / n if not Path(n).is_absolute() else Path(n)
        if not p.is_file():
            print(f"missing: {p}")
            continue
        remove_sparkle(
            p,
            tpl_gray,
            min_score=args.min_score,
            y_min_ratio=y0,
            y_max_ratio=y1,
            x_min_ratio=x0,
            x_max_ratio=x1,
        )


if __name__ == "__main__":
    main()
