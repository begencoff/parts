from pathlib import Path

from django.conf import settings
from django.http import HttpResponse

INDEX = Path(settings.BASE_DIR) / "static" / "app" / "index.html"

FALLBACK = """<!doctype html><meta charset="utf-8"><title>Frontend gurulmady</title>
<body style="font-family:system-ui;padding:3rem;max-width:640px">
<h1>React frontend entek gurulmady</h1>
<p><code>frontend</code> bukjasynda <code>npm install</code> we <code>npm run build</code> ediň.
Ösüş üçin: <code>npm run dev</code> → <a href="http://localhost:5173">http://localhost:5173</a></p>
<p><a href="/panel/">Admin panel</a></p></body>"""


def spa(request, *args, **kwargs):
    """React (Vite) gurlan index.html faýlyny berýär."""
    if INDEX.exists():
        return HttpResponse(INDEX.read_text(encoding="utf-8"))
    return HttpResponse(FALLBACK)
