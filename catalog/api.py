"""React frontend üçin JSON API (goşmaça kitaphana gerek däl)."""
import json
import re
from decimal import Decimal, InvalidOperation

from django.core.paginator import Paginator
from django.db import transaction
from django.db.models import Count, ExpressionWrapper, F, FloatField, Max, Min, Q
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_POST

from .models import Category, Order, OrderItem, Part, SiteSettings

SORTS = {
    "": ("-created_at", "-id"),
    "new": ("-created_at", "-id"),
    "cheap": ("price", "-id"),
    "expensive": ("-price", "-id"),
    "discount": ("-old_price", "-id"),  # aşakda düzedilýär
}


def _num(v):
    return float(v) if v is not None else None


def _abs(request, f):
    return f.url if f else None


def part_dict(request, p, full=False):
    d = {
        "id": p.id,
        "name": p.name,
        "price": _num(p.price),
        "old_price": _num(p.old_price) if p.discount_percent else None,
        "discount": p.discount_percent,
        "image": _abs(request, p.image),
        "car": p.car,
        "category": {"id": p.category_id, "name": p.category.name} if p.category_id else None,
        "in_stock": p.in_stock,
        "is_new": p.is_new,
        "created_at": p.created_at.isoformat(),
    }
    if full:
        d["description"] = p.description
        d["images"] = [_abs(request, p.image)] + [_abs(request, i.image) for i in p.images.all()]
    return d


def filtered_parts(params):
    qs = Part.objects.select_related("category")
    q = params.get("q", "").strip()
    if q:
        for word in q.split():
            qs = qs.filter(
                Q(name__icontains=word) | Q(car__icontains=word)
                | Q(description__icontains=word) | Q(category__name__icontains=word)
            )
    cats = [int(c) for c in params.get("cat", "").split(",") if c.isdigit()]
    if cats:
        qs = qs.filter(category_id__in=cats)
    cars = [c for c in params.get("car", "").split("|") if c]
    if cars:
        cq = Q()
        for c in cars:
            cq |= Q(car__iexact=c)
        qs = qs.filter(cq)
    for key, lookup in (("min", "price__gte"), ("max", "price__lte")):
        try:
            if params.get(key):
                qs = qs.filter(**{lookup: Decimal(params[key])})
        except InvalidOperation:
            pass
    if params.get("sale") == "1":
        qs = qs.filter(old_price__gt=F("price"))
    if params.get("stock") == "1":
        qs = qs.filter(in_stock=True)
    if params.get("new") == "1":
        from datetime import timedelta
        from django.utils import timezone
        qs = qs.filter(created_at__gte=timezone.now() - timedelta(days=14))
    ids = [int(i) for i in params.get("ids", "").split(",") if i.isdigit()]
    if ids:
        qs = qs.filter(id__in=ids)

    sort = params.get("sort", "")
    if sort == "discount":
        qs = qs.annotate(_d=ExpressionWrapper(
            (F("old_price") - F("price")) * 1.0 / F("old_price"), output_field=FloatField())).order_by(
            F("_d").desc(nulls_last=True), "-id")
    else:
        qs = qs.order_by(*SORTS.get(sort, SORTS[""]))
    return qs


@require_GET
def site_info(request):
    s = SiteSettings.load()
    cats = Category.objects.annotate(n=Count("parts")).values("id", "name", "n")
    cars = (Part.objects.exclude(car="").values("car").annotate(n=Count("id")).order_by("-n", "car")[:40])
    pr = Part.objects.aggregate(min=Min("price"), max=Max("price"))
    return JsonResponse({
        "site_name": s.site_name,
        "phone": s.phone,
        "tel": re.sub(r"[^\d+]", "", s.phone or ""),
        "email": s.email,
        "address": s.address,
        "categories": list(cats),
        "cars": [{"name": c["car"], "n": c["n"]} for c in cars],
        "price_range": {"min": _num(pr["min"]) or 0, "max": _num(pr["max"]) or 0},
        "total": Part.objects.count(),
        "sale_count": Part.objects.filter(old_price__gt=F("price")).count(),
    })


@require_GET
def parts_list(request):
    qs = filtered_parts(request.GET)
    try:
        size = max(1, min(60, int(request.GET.get("size", 20))))
    except ValueError:
        size = 20
    pg = Paginator(qs, size)
    page = pg.get_page(request.GET.get("page", 1))
    return JsonResponse({
        "count": pg.count,
        "page": page.number,
        "pages": pg.num_pages,
        "has_next": page.has_next(),
        "results": [part_dict(request, p) for p in page.object_list],
    })


@require_GET
def part_detail(request, pk):
    p = Part.objects.select_related("category").prefetch_related("images").filter(pk=pk).first()
    if not p:
        return JsonResponse({"error": "Tapylmady"}, status=404)
    related = Part.objects.select_related("category").exclude(pk=p.pk)
    if p.category_id:
        same = related.filter(category_id=p.category_id)
        if same.count() >= 2:
            related = same
    return JsonResponse({
        "part": part_dict(request, p, full=True),
        "related": [part_dict(request, r) for r in related[:10]],
    })


@require_GET
def suggest(request):
    q = request.GET.get("q", "").strip()
    if len(q) < 1:
        return JsonResponse({"parts": [], "categories": []})
    parts = filtered_parts({"q": q})[:6]
    cats = Category.objects.filter(name__icontains=q)[:4]
    return JsonResponse({
        "parts": [{"id": p.id, "name": p.name, "price": _num(p.price), "image": _abs(request, p.image), "car": p.car}
                  for p in parts],
        "categories": [{"id": c.id, "name": c.name} for c in cats],
    })


@csrf_exempt  # açyk sargyt formy: sessiýa/cookie ulanylmaýar
@require_POST
def create_order(request):
    try:
        data = json.loads(request.body or "{}")
    except ValueError:
        return JsonResponse({"error": "Nädogry maglumat"}, status=400)

    name = str(data.get("name", "")).strip()[:120]
    phone = str(data.get("phone", "")).strip()[:40]
    address = str(data.get("address", "")).strip()[:255]
    note = str(data.get("note", "")).strip()[:2000]
    delivery = data.get("delivery") if data.get("delivery") in ("delivery", "pickup") else "delivery"
    items = data.get("items") or []

    errors = {}
    if len(name) < 2:
        errors["name"] = "Adyňyzy ýazyň"
    if len(re.sub(r"\D", "", phone)) < 6:
        errors["phone"] = "Telefon belgiňizi dogry ýazyň"
    if delivery == "delivery" and len(address) < 4:
        errors["address"] = "Eltip bermek üçin salgyny ýazyň"
    if not isinstance(items, list) or not items:
        errors["items"] = "Sebet boş"
    if errors:
        return JsonResponse({"errors": errors}, status=400)

    wanted = {}
    for it in items[:100]:
        try:
            pid, qty = int(it["id"]), int(it.get("qty", 1))
        except (KeyError, TypeError, ValueError):
            continue
        if qty > 0:
            wanted[pid] = min(qty, 999)
    parts = {p.id: p for p in Part.objects.filter(id__in=wanted)}
    if not parts:
        return JsonResponse({"errors": {"items": "Harytlar tapylmady"}}, status=400)

    with transaction.atomic():
        order = Order.objects.create(name=name, phone=phone, address=address, note=note, delivery=delivery)
        total = Decimal(0)
        for pid, qty in wanted.items():
            p = parts.get(pid)
            if not p:
                continue
            OrderItem.objects.create(order=order, part=p, name=p.name, price=p.price, qty=qty)
            total += p.price * qty
        order.total = total
        order.save(update_fields=["total"])

    return JsonResponse({"id": order.id, "total": _num(order.total)}, status=201)
