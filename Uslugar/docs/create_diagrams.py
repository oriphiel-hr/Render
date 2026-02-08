# -*- coding: utf-8 -*-
"""Create simple flowchart/diagram PNGs for the Word document."""
from pathlib import Path
try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    Image = ImageDraw = ImageFont = None

BASE = Path(__file__).parent
DIAGRAMS_DIR = BASE / "doc_diagrams"
# Colors (R, G, B)
BLUE = (66, 133, 244)
LIGHT_BLUE = (232, 240, 254)
GRAY = (100, 100, 100)
WHITE = (255, 255, 255)
DARK = (32, 33, 36)
GREEN = (52, 168, 83)
ORANGE = (251, 188, 5)

def get_font(size=14):
    try:
        return ImageFont.truetype("arial.ttf", size)
    except Exception:
        try:
            return ImageFont.truetype("C:/Windows/Fonts/arial.ttf", size)
        except Exception:
            return ImageFont.load_default()

def draw_box(draw, xy, text, font, fill=LIGHT_BLUE, outline=BLUE, padding=10):
    """Draw rounded rect and text; return (x0,y0,x1,y1)."""
    if hasattr(draw, 'textbbox'):
        b = draw.textbbox((0, 0), text, font=font)
        tw, th = b[2] - b[0], b[3] - b[1]
    else:
        tw, th = draw.textsize(text, font=font)
    w, h = tw + padding * 2, th + padding * 2
    x0, y0 = xy
    x1, y1 = x0 + w, y0 + h
    draw.rounded_rectangle([x0, y0, x1, y1], radius=6, fill=fill, outline=outline, width=2)
    draw.text((x0 + padding, y0 + padding), text, font=font, fill=DARK)
    return (x0, y0, x1, y1)

def create_dag_diagram():
    """DAG: login -> create-job -> send-offer."""
    W, H = 520, 180
    img = Image.new("RGB", (W, H), WHITE)
    draw = ImageDraw.Draw(img)
    font = get_font(14)
    font_small = get_font(11)
    draw.text((10, 8), "Graf ovisnosti blokova (DAG) – primjer za test 4.1", font=font, fill=DARK)
    # Boxes
    b1 = draw_box(draw, (30, 50), "login", font_small)
    b2 = draw_box(draw, (200, 50), "create-job", font_small)
    b3 = draw_box(draw, (370, 50), "send-offer", font_small)
    # Arrows
    arrow_y = 50 + (b1[3] - b1[1]) // 2
    draw.line([(b1[2] + 5, arrow_y), (b2[0] - 5, arrow_y)], fill=BLUE, width=2)
    draw.line([(b2[2] + 5, arrow_y), (b3[0] - 5, arrow_y)], fill=BLUE, width=2)
    # Arrowheads
    for x in (b2[0] - 8, b3[0] - 8):
        draw.polygon([(x, arrow_y), (x - 8, arrow_y - 5), (x - 8, arrow_y + 5)], fill=BLUE)
    draw.text((W // 2 - 80, 130), "Redoslijed izvršavanja: login → create-job → send-offer", font=font_small, fill=GRAY)
    DIAGRAMS_DIR.mkdir(exist_ok=True)
    img.save(DIAGRAMS_DIR / "dag_blocks.png", "PNG")
    return DIAGRAMS_DIR / "dag_blocks.png"

def create_execution_flow_diagram():
    """Test execution flow – 9 steps."""
    W, H = 480, 520
    img = Image.new("RGB", (W, H), WHITE)
    draw = ImageDraw.Draw(img)
    font = get_font(12)
    font_small = get_font(10)
    draw.text((10, 8), "Tok izvršavanja testa (run-single)", font=font, fill=DARK)
    steps = [
        "1. Zahtjev – POST run-single",
        "2. Checkpoint – kreiranje DB checkpointa",
        "3. Mapiranje – testId → blocks",
        "4. Redoslijed – topološko sortiranje",
        "5. Izvršavanje – blok po blok",
        "6. Mailpit – za testove s emailom",
        "7. Checkpoint delta – usporedba baze",
        "8. Rollback – vraćanje baze",
        "9. Odgovor – JSON rezultati",
    ]
    y = 45
    for i, s in enumerate(steps):
        draw_box(draw, (40, y), s, font_small, fill=LIGHT_BLUE if i % 2 == 0 else WHITE, outline=GRAY)
        h = 38
        if i < len(steps) - 1:
            draw.line([(40 + 200, y + h), (40 + 200, y + h + 15)], fill=BLUE, width=2)
            draw.polygon([(40 + 200, y + h + 22), (40 + 200 - 5, y + h + 14), (40 + 200 + 5, y + h + 14)], fill=BLUE)
        y += h + 18
    DIAGRAMS_DIR.mkdir(exist_ok=True)
    img.save(DIAGRAMS_DIR / "execution_flow.png", "PNG")
    return DIAGRAMS_DIR / "execution_flow.png"

def create_hierarchy_diagram():
    """Kontejner -> blokovi -> assert."""
    W, H = 420, 200
    img = Image.new("RGB", (W, H), WHITE)
    draw = ImageDraw.Draw(img)
    font = get_font(12)
    font_small = get_font(10)
    draw.text((10, 8), "Hijerarhija: Kontejner → Blokovi → Assert", font=font, fill=DARK)
    draw_box(draw, (120, 45), "Kontejner (npr. 3.3 Postavljanje budžeta)", font_small, fill=(254, 247, 237), outline=ORANGE)
    draw_box(draw, (50, 120), "login", font_small)
    draw_box(draw, (160, 120), "create-job-with-budget", font_small)
    draw_box(draw, (330, 120), "view-job-detail", font_small)
    draw_box(draw, (140, 165), "assert: budget-visible, budget-correct-range", font_small, fill=(232, 245, 233), outline=GREEN)
    draw.line([(220, 95), (140, 118)], fill=GRAY, width=1)
    draw.line([(220, 95), (220, 118)], fill=GRAY, width=1)
    draw.line([(220, 95), (300, 118)], fill=GRAY, width=1)
    draw.line([(220, 158), (220, 172)], fill=GRAY, width=1)
    DIAGRAMS_DIR.mkdir(exist_ok=True)
    img.save(DIAGRAMS_DIR / "hierarchy.png", "PNG")
    return DIAGRAMS_DIR / "hierarchy.png"

def create_registration_flow_diagram():
    """Client – Backend – Mailpit (test 1.1)."""
    W, H = 520, 280
    img = Image.new("RGB", (W, H), WHITE)
    draw = ImageDraw.Draw(img)
    font = get_font(11)
    draw.text((10, 8), "Tok testa 1.1 (Registracija): Client ↔ Backend ↔ Mailpit", font=font, fill=DARK)
    cols = [(20, "Client"), (180, "Backend"), (340, "Mailpit")]
    for x, label in cols:
        draw.rectangle([x, 35, x + 140, 55], fill=BLUE, outline=BLUE)
        draw.text((x + 10, 38), label, font=font, fill=WHITE)
    steps = [
        (40, "POST /run-single"),
        (65, "create checkpoint"),
        (90, "runRegistrationTest"),
        (115, "Playwright: goto /register"),
        (140, "fill form, submit"),
        (165, "POST /auth/register (browser)"),
        (190, "fetch emails"),
        (215, "screenshot email"),
        (240, "click verify link"),
        (265, "checkpoint delta, rollback"),
        (290, "JSON odgovor"),
    ]
    for y, text in steps:
        draw.text((30, y), "→", font=font, fill=GRAY)
        draw.text((50, y), text, font=font, fill=DARK)
    DIAGRAMS_DIR.mkdir(exist_ok=True)
    img.save(DIAGRAMS_DIR / "registration_flow.png", "PNG")
    return DIAGRAMS_DIR / "registration_flow.png"

def create_all():
    if Image is None:
        return []
    DIAGRAMS_DIR.mkdir(exist_ok=True)
    create_dag_diagram()
    create_execution_flow_diagram()
    create_hierarchy_diagram()
    create_registration_flow_diagram()
    return list(DIAGRAMS_DIR.glob("*.png"))

if __name__ == "__main__":
    create_all()
    print("Diagrams saved to", DIAGRAMS_DIR)
