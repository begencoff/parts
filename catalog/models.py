from datetime import timedelta

from django.db import models
from django.utils import timezone


class Category(models.Model):
    name = models.CharField("Ady", max_length=60, unique=True)

    class Meta:
        ordering = ["name"]
        verbose_name = "kategoriýa"
        verbose_name_plural = "kategoriýalar"

    def __str__(self):
        return self.name


class Part(models.Model):
    name = models.CharField("Ady", max_length=200)
    category = models.ForeignKey(
        Category, verbose_name="Kategoriýa (hökman däl)", null=True, blank=True,
        on_delete=models.SET_NULL, related_name="parts",
    )
    car = models.CharField("Awtomobil / marka (hökman däl)", max_length=100, blank=True)
    price = models.DecimalField("Bahasy (manat)", max_digits=10, decimal_places=2)
    old_price = models.DecimalField(
        "Köne bahasy (arzanladyş üçin, hökman däl)", max_digits=10, decimal_places=2,
        null=True, blank=True,
        help_text="Doldursaňyz we häzirki bahadan ýokary bolsa, haryt arzanladyşda görkezilýär.",
    )
    in_stock = models.BooleanField("Ammarda bar", default=True)
    image = models.ImageField("Surat", upload_to="parts/")
    description = models.TextField("Düşündiriş (hökman däl)", blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at", "-id"]
        verbose_name = "zapçast"
        verbose_name_plural = "zapçastlar"

    def __str__(self):
        return self.name

    @property
    def discount_percent(self):
        if self.old_price and self.old_price > self.price:
            return int(round((1 - self.price / self.old_price) * 100))
        return 0

    @property
    def is_new(self):
        """Soňky 14 günde goşulan zapçastlar "Täze" belligini alýar."""
        return self.created_at >= timezone.now() - timedelta(days=14)

    def delete(self, *args, **kwargs):
        image = self.image
        super().delete(*args, **kwargs)
        if image:
            image.delete(save=False)


class SiteSettings(models.Model):
    """Sahypanyň sazlamalary (diňe bir ýazgy). Admin panelden üýtgedilýär."""

    site_name = models.CharField("Sahypanyň ady", max_length=60, default="AwtoŞaýlar")
    phone = models.CharField("Telefon belgisi", max_length=40, blank=True, default="+993 65 00 00 00")
    email = models.EmailField("E-poçta", blank=True, default="info@example.com")
    address = models.CharField(
        "Ýerleşýän ýeri (salgy)", max_length=200, blank=True,
        default="Aşgabat şäheri, köçäniň ady, jaý belgisi",
    )

    class Meta:
        verbose_name = "sazlamalar"
        verbose_name_plural = "sazlamalar"

    def __str__(self):
        return self.site_name

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj


class PartImage(models.Model):
    """Harydyň goşmaça suratlary (galereýa)."""

    part = models.ForeignKey(Part, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField("Surat", upload_to="parts/extra/")

    class Meta:
        ordering = ["id"]

    def delete(self, *args, **kwargs):
        image = self.image
        super().delete(*args, **kwargs)
        if image:
            image.delete(save=False)


class Order(models.Model):
    STATUS = [
        ("new", "Täze"),
        ("confirmed", "Tassyklandy"),
        ("shipping", "Ýolda"),
        ("done", "Tabşyryldy"),
        ("cancelled", "Ýatyryldy"),
    ]
    DELIVERY = [("delivery", "Eltip bermek"), ("pickup", "Dükandan almak")]

    name = models.CharField("Ady", max_length=120)
    phone = models.CharField("Telefon", max_length=40)
    address = models.CharField("Salgy", max_length=255, blank=True)
    note = models.TextField("Bellik", blank=True)
    delivery = models.CharField("Eltip bermek", max_length=20, choices=DELIVERY, default="delivery")
    status = models.CharField("Ýagdaýy", max_length=20, choices=STATUS, default="new")
    total = models.DecimalField("Jemi", max_digits=12, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at", "-id"]
        verbose_name = "sargyt"
        verbose_name_plural = "sargytlar"

    def __str__(self):
        return f"Sargyt #{self.pk}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    part = models.ForeignKey(Part, null=True, blank=True, on_delete=models.SET_NULL)
    name = models.CharField(max_length=200)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    qty = models.PositiveIntegerField(default=1)

    @property
    def line_total(self):
        return self.price * self.qty
