from urllib.parse import urlencode

from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.db.models import Count, Q
from django.urls import reverse_lazy
from django.views.generic import CreateView, DeleteView, DetailView, ListView, UpdateView

from .forms import CategoryForm, OrderStatusForm, PartForm, SiteSettingsForm
from .models import Category, Order, Part, PartImage, SiteSettings

# (açar, görkezilýän at, tertip)
SORTS = [
    ("", "Täze", "-created_at"),
    ("cheap", "Arzan", "price"),
    ("expensive", "Gymmat", "-price"),
]


class SearchMixin:
    """?q= (gözleg), ?cat= (kategoriýa), ?sort= (tertip)."""

    def get_params(self):
        g = self.request.GET
        q = g.get("q", "").strip()
        cat = int(g["cat"]) if g.get("cat", "").isdigit() else None
        sort = g.get("sort", "")
        if sort not in {s[0] for s in SORTS}:
            sort = ""
        return q, cat, sort

    def get_queryset(self):
        q, cat, sort = self.get_params()
        qs = Part.objects.select_related("category")
        if q:
            qs = qs.filter(Q(name__icontains=q) | Q(car__icontains=q))
        if cat:
            qs = qs.filter(category_id=cat)
        order = next(s[2] for s in SORTS if s[0] == sort)
        return qs.order_by(order, "-id")

    def url_with(self, **override):
        q, cat, sort = self.get_params()
        params = {"q": q, "cat": cat, "sort": sort}
        params.update(override)
        params = {k: v for k, v in params.items() if v}
        return "?" + urlencode(params)

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        q, cat, sort = self.get_params()
        params = {k: v for k, v in {"q": q, "cat": cat, "sort": sort}.items() if v}
        ctx.update(
            q=q,
            active_cat=cat,
            active_category=Category.objects.filter(pk=cat).first() if cat else None,
            sort=sort,
            qs=urlencode(params),
            sort_links=[
                {"label": label, "url": self.url_with(sort=key), "active": key == sort}
                for key, label, _ in SORTS
            ],
        )
        return ctx


# ---------- Admin panel ----------
class StaffRequired(LoginRequiredMixin, UserPassesTestMixin):
    def test_func(self):
        return self.request.user.is_staff


class PanelListView(StaffRequired, SearchMixin, ListView):
    template_name = "panel/list.html"
    context_object_name = "parts"
    paginate_by = 20


class PartImagesMixin:
    """Goşmaça suratlary saklamak we pozmak."""

    def save_images(self, form):
        part = self.object
        ids = [int(i) for i in self.request.POST.getlist("delete_image") if i.isdigit()]
        for img in PartImage.objects.filter(part=part, id__in=ids):
            img.delete()
        for f in form.cleaned_data.get("extra_images") or []:
            PartImage.objects.create(part=part, image=f)


class PanelCreateView(StaffRequired, PartImagesMixin, CreateView):
    model = Part
    form_class = PartForm
    template_name = "panel/form.html"
    success_url = reverse_lazy("panel_list")

    def form_valid(self, form):
        resp = super().form_valid(form)
        self.save_images(form)
        messages.success(self.request, "Zapçast goşuldy.")
        return resp

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        ctx["title"] = "Täze zapçast goş"
        return ctx


class PanelUpdateView(StaffRequired, PartImagesMixin, UpdateView):
    model = Part
    form_class = PartForm
    template_name = "panel/form.html"
    success_url = reverse_lazy("panel_list")

    def form_valid(self, form):
        resp = super().form_valid(form)
        self.save_images(form)
        messages.success(self.request, "Üýtgeşmeler saklandy.")
        return resp

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        ctx["title"] = "Zapçasty üýtget"
        return ctx


class PanelDeleteView(StaffRequired, DeleteView):
    model = Part
    template_name = "panel/confirm_delete.html"
    success_url = reverse_lazy("panel_list")

    def form_valid(self, form):
        messages.success(self.request, "Zapçast pozuldy.")
        return super().form_valid(form)


# --- kategoriýalar ---
class PanelCategoryList(StaffRequired, ListView):
    template_name = "panel/category_list.html"
    context_object_name = "categories"

    def get_queryset(self):
        return Category.objects.annotate(n=Count("parts"))


class PanelCategoryCreate(StaffRequired, CreateView):
    model = Category
    form_class = CategoryForm
    template_name = "panel/form.html"
    success_url = reverse_lazy("panel_categories")

    def form_valid(self, form):
        messages.success(self.request, "Kategoriýa goşuldy.")
        return super().form_valid(form)

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        ctx.update(title="Täze kategoriýa", cancel_url=reverse_lazy("panel_categories"))
        return ctx


class PanelCategoryUpdate(StaffRequired, UpdateView):
    model = Category
    form_class = CategoryForm
    template_name = "panel/form.html"
    success_url = reverse_lazy("panel_categories")

    def form_valid(self, form):
        messages.success(self.request, "Üýtgeşmeler saklandy.")
        return super().form_valid(form)

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        ctx.update(title="Kategoriýany üýtget", cancel_url=reverse_lazy("panel_categories"))
        return ctx


class PanelCategoryDelete(StaffRequired, DeleteView):
    model = Category
    template_name = "panel/category_delete.html"
    success_url = reverse_lazy("panel_categories")

    def form_valid(self, form):
        messages.success(self.request, "Kategoriýa pozuldy.")
        return super().form_valid(form)


# --- sazlamalar ---
class PanelSettingsView(StaffRequired, UpdateView):
    form_class = SiteSettingsForm
    template_name = "panel/settings.html"
    success_url = reverse_lazy("panel_settings")

    def get_object(self, queryset=None):
        return SiteSettings.load()

    def form_valid(self, form):
        messages.success(self.request, "Sazlamalar saklandy.")
        return super().form_valid(form)


# --- sargytlar ---
class PanelOrderList(StaffRequired, ListView):
    template_name = "panel/order_list.html"
    context_object_name = "orders"
    paginate_by = 30

    def get_queryset(self):
        qs = Order.objects.annotate(n=Count("items"))
        st = self.request.GET.get("status", "")
        if st in dict(Order.STATUS):
            qs = qs.filter(status=st)
        return qs

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        ctx["statuses"] = Order.STATUS
        ctx["active_status"] = self.request.GET.get("status", "")
        ctx["qs"] = urlencode({"status": ctx["active_status"]}) if ctx["active_status"] else ""
        return ctx


class PanelOrderDetail(StaffRequired, UpdateView):
    model = Order
    form_class = OrderStatusForm
    template_name = "panel/order_detail.html"
    context_object_name = "order"

    def get_success_url(self):
        return self.request.path

    def form_valid(self, form):
        messages.success(self.request, "Sargydyň ýagdaýy üýtgedildi.")
        return super().form_valid(form)
