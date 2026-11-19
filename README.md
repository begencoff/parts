# AwtoŞaýlar — zapçast dükany (Django + React)

Sahypa indi doly onlaýn dükan: sebet, halanlarym, sargyt, arzanladyş, süzgüçler.
Backend — Django (admin panel we API). Frontend — React (Vite), `frontend/` bukjasynda.

## Täze mümkinçilikler

**Müşderi üçin (React sahypa)**
- Gözleg: ýazan wagtyňyz harytlar we kategoriýalar çykýar, soňky gözlegler ýatda saklanýar
- **Meniň maşynym**: maşynyňy saýla → laýyk zapçastlar "Siziň maşynyňyza laýyk" diýip bellenýär, katalogda bir basyşda süzülýär
- Esasy sahypa: banner, kategoriýalar, **Günüň arzanladyşy** (sanaýjy sagat bilen), Täze gelenler, Soňky seredenler, aşak aýlananda ýüklenýän harytlar
- Katalog: kategoriýa, maşyn, baha aralygy, arzanladyş, ammarda bar, täze — süzgüçler; tertiplemek; tor/sanaw görnüşi; telefonda süzgüç paneli
- Haryt sahypasy: surat galereýasy (ulaltmak bilen), arzanladyş %, tygşytlaýan pul, sany, "Sebede goş", "Häzir satyn al", halanlarym, paýlaş, meňzeş harytlar
- Sebet: saýlap sargyt etmek (Trendyol ýaly), sanyny üýtgetmek, jemi we tygşytlanan pul
- Sargyt: ady, telefon, eltip bermek ýa-da dükandan almak, salgy, bellik → sargyt admin panele düşýär
- Çalt görmek penjiresi, bildirişler, telefon üçin aşaky menýu

**Admin panel (/panel/)**
- **Sargytlar**: täze sargytlaryň sany menýuda görünýär, ýagdaýyny üýtgetmek (Täze → Tassyklandy → Ýolda → Tabşyryldy / Ýatyryldy)
- Zapçast formunda: **köne baha** (arzanladyş üçin), **ammarda bar**, **goşmaça suratlar** (galereýa)

## Işletmek

```bash
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate          # täze meýdanlar üçin hökman
python manage.py createsuperuser  # eger admin ulanyjy ýok bolsa
python manage.py runserver
```

- Sahypa: http://127.0.0.1:8000/
- Admin panel: http://127.0.0.1:8000/panel/

React eýýäm gurlan (`static/app/`), şonuň üçin Node.js gerek däl — diňe Django işletseňiz bolýar.

### Dizaýny barlamak üçin synag harytlary

```bash
python manage.py demo_harytlar        # 16 sany synag haryt goşýar
python manage.py demo_harytlar --poz  # olary pozýar
```

## Frontendi üýtgetmek (React)

Node.js 18+ gerek.

```bash
cd frontend
npm install
npm run dev      # http://localhost:5173  (Django 8000-de işläp durmaly)
npm run build    # taýýar faýllar ../static/app/ bukja ýazylýar
```

- Sahypalar: `frontend/src/pages/` · Bölekler: `frontend/src/components/` · Reňkler: `frontend/src/styles.css` başyndaky `--primary`, `--hot`, `--tape`
- API: `catalog/api.py` (`/api/site/`, `/api/parts/`, `/api/parts/<id>/`, `/api/suggest/`, `/api/orders/`)

## PostgreSQL

```bash
export DB_NAME=awtobolek DB_USER=postgres DB_PASSWORD=parol DB_HOST=localhost DB_PORT=5432
python manage.py migrate
```

## Production üçin

- `DEBUG=0`, `SECRET_KEY=...`, `ALLOWED_HOSTS=siziň-domen.com`
- `cd frontend && npm run build` (frontendi üýtgeden bolsaňyz), soň `python manage.py collectstatic`
- `/media/` we `/static/` faýllaryny nginx bilen beriň (gunicorn + nginx)
