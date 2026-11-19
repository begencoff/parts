import re

from django.db import DatabaseError

from .models import Category, Order, SiteSettings


def site(request):
    """Sahypanyň ady, habarlaşmak maglumatlary we kategoriýalar ähli şablonlarda elýeterli."""
    try:
        s = SiteSettings.load()
        data = {
            "SITE_NAME": s.site_name,
            "CONTACT_PHONE": s.phone,
            "CONTACT_EMAIL": s.email,
            "CONTACT_ADDRESS": s.address,
            "CATEGORIES": list(Category.objects.all()),
            "NEW_ORDERS": Order.objects.filter(status="new").count()
            if getattr(request, "user", None) and request.user.is_staff else 0,
        }
    except DatabaseError:          # migrate entek edilmedik bolsa
        data = {"SITE_NAME": "AwtoŞaýlar", "CONTACT_PHONE": "", "CONTACT_EMAIL": "",
                "CONTACT_ADDRESS": "", "CATEGORIES": [], "NEW_ORDERS": 0}
    data["CONTACT_TEL"] = re.sub(r"[^\d+]", "", data["CONTACT_PHONE"] or "")
    return data
