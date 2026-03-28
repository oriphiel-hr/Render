# -*- coding: utf-8 -*-
"""Zamijeni engleske natpise hrvatskim na Oriphiel JPG oglasima.

Samo traka teksta: pozadina = uzorak iznad retka (bez velikih ploča).
Font: ORIPHIEL_UI_FONT (.ttf) ili C:\\ORIPHIEL\\fonts\\*.ttf, inače Segoe UI.

Moraš pokretati na čistim JPG-ovima iz Oriphiel - oglasi (ne na već obrađenim).
"""
from __future__ import annotations

import os
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageStat

BASE = Path(r"C:\ORIPHIEL\output\oriphiel-ad-assets")
FONT_DIR = Path(r"C:\ORIPHIEL\fonts")

DARK_UI = (52, 56, 68)
WHITE = (255, 255, 255)


def mean_rgb(img: Image.Image, box: tuple[int, int, int, int]) -> tuple[int, int, int]:
    x0, y0, x1, y1 = box
    x0, y0 = max(0, x0), max(0, y0)
    x1, y1 = min(img.width, x1), min(img.height, y1)
    if x1 <= x0 or y1 <= y0:
        return (245, 247, 250)
    crop = img.crop((x0, y0, x1, y1))
    small = crop.resize((max(1, crop.width // 8), max(1, crop.height // 8)), Image.Resampling.LANCZOS)
    st = ImageStat.Stat(small)
    return tuple(int(c) for c in st.mean[:3])


def text_width(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.FreeTypeFont) -> int:
    if hasattr(draw, "textlength"):
        return int(draw.textlength(text, font=font))
    b = draw.textbbox((0, 0), text, font=font)
    return b[2] - b[0]


def resolve_font_path() -> str | None:
    env = os.environ.get("ORIPHIEL_UI_FONT", "").strip()
    if env and os.path.isfile(env):
        return env
    if FONT_DIR.is_dir():
        for t in sorted(FONT_DIR.glob("*.ttf")):
            return str(t)
        for t in sorted(FONT_DIR.glob("*.otf")):
            return str(t)
    for p in (
        r"C:\Windows\Fonts\segoeui.ttf",
        r"C:\Windows\Fonts\arial.ttf",
    ):
        if os.path.isfile(p):
            return p
    return None


def load_font(size: int) -> ImageFont.FreeTypeFont:
    path = resolve_font_path()
    if path:
        return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def replace_label(
    img: Image.Image,
    xy: tuple[int, int],
    hr: str,
    en: str,
    font: ImageFont.FreeTypeFont,
    *,
    ink: tuple[int, int, int] = DARK_UI,
    pad_x: int = 3,
    pad_y: int = 2,
    sample_above: int = 8,
) -> None:
    x, y = xy
    dr = ImageDraw.Draw(img)
    w = max(text_width(dr, hr, font), text_width(dr, en, font)) + pad_x * 2
    bb = dr.textbbox((x, y), hr, font=font)
    y0 = bb[1] - pad_y
    y1 = bb[3] + pad_y
    x0 = x - pad_x
    x1 = x0 + w
    x0, y0 = max(0, x0), max(0, y0)
    x1, y1 = min(img.width, x1), min(img.height, y1)
    samp = (x0, max(0, y0 - sample_above), x1, y0 + 1)
    bg = mean_rgb(img, samp)
    dr.rectangle((x0, y0, x1, y1), fill=bg)
    dr.text((x, y), hr, font=font, fill=ink)


def process_iznajmljivaci(path: Path) -> None:
    img = Image.open(path).convert("RGB")
    f, fs = load_font(22), load_font(18)
    replace_label(img, (300, 125), "Poruke gostiju", "Guest Messages", f)
    replace_label(img, (300, 165), "Vrijeme dolaska?", "Arrival Time?", fs)
    replace_label(img, (300, 195), "Hvala!", "Thank you!", fs)
    replace_label(img, (50, 595), "Raspored čišćenja", "Cleaning schedule", f, ink=WHITE)
    replace_label(img, (650, 335), "Zadatak za prijavu: čista posteljina", "Check-in Task: Clean Linens", fs)
    replace_label(img, (650, 385), "Zadatak za odjavu: završni pregled", "Check-out Task: Final Inspection", fs)
    img.save(path, "JPEG", quality=92, optimize=True)


def process_opg(path: Path) -> None:
    img = Image.open(path).convert("RGB")
    f, fs, ft = load_font(20), load_font(18), load_font(16)
    replace_label(img, (42, 210), "Narudžbe", "Orders", f, ink=WHITE)
    replace_label(img, (42, 318), "Zalihe", "Stock", f, ink=WHITE)
    replace_label(img, (660, 800), "Poticaji i dokumentacija", "Subsidies Paperwork", ft, ink=WHITE)
    replace_label(img, (530, 185), "Narudžbe", "Orders", f)
    replace_label(img, (770, 185), "Rute dostave", "Delivery Routes", fs)
    replace_label(img, (530, 448), "Inventar", "Inventory", f)
    replace_label(
        img,
        (748, 448),
        "Planiranje sezonske proizvodnje",
        "Seasonal Production Planning",
        load_font(16),
    )
    for hr, en, xo in [
        ("Sij", "Jan", 0),
        ("Ožu", "Mar", 92),
        ("Tra", "Apr", 184),
        ("Svi", "May", 276),
        ("Lip", "Jun", 368),
    ]:
        replace_label(img, (530 + xo, 590), hr, en, ft)
    replace_label(img, (780, 820), "Dostava", "Delivery", f, ink=WHITE)
    img.save(path, "JPEG", quality=92, optimize=True)


def process_tvrtke(path: Path) -> None:
    """Na laptop ekranu: naslov + četiri oznake ispod ikona (ne sidebar iz druge varijante)."""
    img = Image.open(path).convert("RGB")
    fd = load_font(17)
    fl = load_font(13)
    replace_label(img, (272, 218), "Nadzorna ploča", "Dashboard", fd)
    y = 342
    replace_label(img, (266, y), "Ponude", "Offeres", fl)
    replace_label(img, (310, y), "Računi", "Invoices", fl)
    replace_label(img, (354, y), "Projekti", "Projects", fl)
    replace_label(img, (398, y), "Radni nalozi", "Work orders", fl)
    img.save(path, "JPEG", quality=92, optimize=True)


def process_udruge(path: Path) -> None:
    """Šest oznaka ispod ikona na ekranu laptopa (1024×1024 ilustracija)."""
    img = Image.open(path).convert("RGB")
    fs, fss = load_font(14), load_font(12)
    y1, y2 = 548, 614
    a, b, c = 318, 408, 498
    replace_label(img, (a, y1), "Članovi", "Members", fs)
    replace_label(img, (b, y1), "Članarine", "Membership Plans", fs)
    replace_label(img, (c, y1), "Donacije", "Donations", fs)
    replace_label(img, (a, y2), "Događaji", "Events", fs)
    replace_label(img, (b, y2), "Raspored volontera", "Volunteer Schedule", fss)
    replace_label(img, (c, y2), "Izvještaji za donatore", "Donor Reports", fss)
    img.save(path, "JPEG", quality=92, optimize=True)


def main() -> None:
    mapping = {
        "oglasi-iznajmljivaci.jpg": process_iznajmljivaci,
        "oglasi-opg.jpg": process_opg,
        "oglasi-tvrtke-obrti.jpg": process_tvrtke,
        "oglasi-udruge.jpg": process_udruge,
    }
    for name, fn in mapping.items():
        p = BASE / name
        if p.is_file():
            fn(p)
            print("OK:", p)


if __name__ == "__main__":
    main()
