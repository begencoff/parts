from django import forms

from .models import Category, Order, Part, SiteSettings


class MultipleFileInput(forms.ClearableFileInput):
    allow_multiple_selected = True


class MultipleImageField(forms.ImageField):
    def __init__(self, *args, **kwargs):
        kwargs.setdefault("widget", MultipleFileInput(attrs={"accept": "image/*", "multiple": True}))
        super().__init__(*args, **kwargs)

    def clean(self, data, initial=None):
        single = super().clean
        if isinstance(data, (list, tuple)):
            return [single(d, initial) for d in data if d]
        return [single(data, initial)] if data else []


class PartForm(forms.ModelForm):
    class Meta:
        model = Part
        fields = ["name", "category", "car", "price", "old_price", "in_stock", "image", "description"]
        widgets = {
            "name": forms.TextInput(attrs={"placeholder": "Mysal: Tormoz kolodkasy, öň"}),
            "car": forms.TextInput(attrs={"placeholder": "Mysal: Toyota Camry 2012-2017"}),
            "price": forms.NumberInput(attrs={"step": "0.01", "min": "0", "placeholder": "0.00"}),
            "old_price": forms.NumberInput(attrs={"step": "0.01", "min": "0", "placeholder": "Mysal: 450.00"}),
            "image": forms.ClearableFileInput(attrs={"accept": "image/*"}),
            "description": forms.Textarea(attrs={"rows": 5, "placeholder": "Mysal: Keramiki gatyşykly, az ses çykarýar. Öň tarap üçin."}),
        }

    extra_images = MultipleImageField(label="Goşmaça suratlar (galereýa, hökman däl)", required=False)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["category"].empty_label = "— Saýlanmady —"

    def clean(self):
        data = super().clean()
        price, old = data.get("price"), data.get("old_price")
        if old is not None and price is not None and old <= price:
            self.add_error("old_price", "Köne baha häzirki bahadan ýokary bolmaly (ýa-da boş goýuň).")
        return data


class CategoryForm(forms.ModelForm):
    class Meta:
        model = Category
        fields = ["name"]
        widgets = {"name": forms.TextInput(attrs={"placeholder": "Mysal: Tormoz ulgamy"})}


class SiteSettingsForm(forms.ModelForm):
    class Meta:
        model = SiteSettings
        fields = ["site_name", "phone", "email", "address"]
        widgets = {
            "site_name": forms.TextInput(),
            "phone": forms.TextInput(attrs={"placeholder": "+993 65 12 34 56"}),
            "email": forms.EmailInput(attrs={"placeholder": "info@siziňsahypaňyz.com"}),
            "address": forms.TextInput(attrs={"placeholder": "Aşgabat şäheri, ... köçesi, 12"}),
        }


class OrderStatusForm(forms.ModelForm):
    class Meta:
        model = Order
        fields = ["status"]
