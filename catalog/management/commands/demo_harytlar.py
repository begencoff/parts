"""Dizaýny barlamak üçin synag harytlaryny goşýar:  python manage.py demo_harytlar
Pozmak üçin:  python manage.py demo_harytlar --poz
"""
import io
import random
from decimal import Decimal

from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand

from catalog.models import Category, Part

DEMO_TAG = "[demo]"

DATA = {
    "Tormoz ulgamy": [("Tormoz kolodkasy, öň", 280), ("Tormoz diski 280 mm", 520), ("Tormoz suwuklygy DOT-4", 95)],
    "Hereketlendiriji": [("Ýag süzgüji", 65), ("Howa süzgüji", 80), ("Remen GRM toplumy", 890), ("Ot alyş şemi (4 sany)", 240)],
    "Asma ulgamy": [("Amortizator, öň sag", 760), ("Stabilizator dyrmagy", 150), ("Şarowoý opora", 210)],
    "Elektrik": [("Akkumulýator 60 Ah", 1350), ("Generator", 2400), ("Fara lampasy H4", 45)],
    "Kuzow": [("Gapdal aýna, çep", 390), ("Öň bufer", 1650), ("Aýna süpürgiji (jübüt)", 120)],
}
CARS = ["Toyota Camry", "Toyota Corolla", "Lexus RX", "Hyundai Elantra", "Kia Rio", "Toyota Land Cruiser"]
COLORS = [(28, 78, 143), (232, 67, 46), (19, 120, 90), (120, 70, 160), (200, 120, 20), (40, 40, 50)]


def make_image(text, color):
    from PIL import Image, ImageDraw
    w, h = 800, 800
    img = Image.new("RGB", (w, h), (244, 246, 250))
    d = ImageDraw.Draw(img)
    cx, cy = w // 2, h // 2
    d.ellipse((cx - 230, cy - 230, cx + 230, cy + 230), fill=color)
    d.ellipse((cx - 150, cy - 150, cx + 150, cy + 150), outline=(255, 255, 255), width=14)
    d.ellipse((cx - 50, cy - 50, cx + 50, cy + 50), fill=(255, 255, 255))
    buf = io.BytesIO()
    img.save(buf, "JPEG", quality=85)
    return ContentFile(buf.getvalue())


class Command(BaseCommand):
    help = "Synag (demo) harytlaryny goşýar ýa-da pozýar"

    def add_arguments(self, parser):
        parser.add_argument("--poz", action="store_true", help="Demo harytlary poz")

    def handle(self, *args, **opts):
        if opts["poz"]:
            n = 0
            for p in Part.objects.filter(description__startswith=DEMO_TAG):
                p.delete()
                n += 1
            Category.objects.filter(name__in=DATA.keys(), parts__isnull=True).delete()
            self.stdout.write(self.style.SUCCESS(f"{n} demo haryt pozuldy"))
            return

        rnd = random.Random(7)
        n = 0
        for ci, (cat_name, items) in enumerate(DATA.items()):
            cat, _ = Category.objects.get_or_create(name=cat_name)
            for name, price in items:
                car = rnd.choice(CARS)
                old = Decimal(price) * Decimal(rnd.choice([1.15, 1.25, 1.4])) if rnd.random() < .45 else None
                p = Part(
                    name=f"{name} — {car}", category=cat, car=car, price=Decimal(price),
                    old_price=old.quantize(Decimal("1")) if old else None,
                    in_stock=rnd.random() > .12,
                    description=f"{DEMO_TAG} Asyl hil. {car} üçin laýyk. Kepillik 6 aý.",
                )
                p.image.save(f"demo_{ci}_{n}.jpg", make_image(name, COLORS[(ci + n) % len(COLORS)]), save=False)
                p.save()
                n += 1
        self.stdout.write(self.style.SUCCESS(f"{n} demo haryt goşuldy"))
