from django.contrib.auth.views import LoginView, LogoutView
from django.urls import path

from . import views as v

urlpatterns = [
    path("", v.PanelListView.as_view(), name="panel_list"),
    path("giris/", LoginView.as_view(template_name="panel/login.html", redirect_authenticated_user=True), name="panel_login"),
    path("cyk/", LogoutView.as_view(), name="panel_logout"),
    path("taze/", v.PanelCreateView.as_view(), name="panel_create"),
    path("<int:pk>/uytget/", v.PanelUpdateView.as_view(), name="panel_update"),
    path("<int:pk>/poz/", v.PanelDeleteView.as_view(), name="panel_delete"),
    path("kategoriyalar/", v.PanelCategoryList.as_view(), name="panel_categories"),
    path("kategoriyalar/taze/", v.PanelCategoryCreate.as_view(), name="panel_category_create"),
    path("kategoriyalar/<int:pk>/uytget/", v.PanelCategoryUpdate.as_view(), name="panel_category_update"),
    path("kategoriyalar/<int:pk>/poz/", v.PanelCategoryDelete.as_view(), name="panel_category_delete"),
    path("sargytlar/", v.PanelOrderList.as_view(), name="panel_orders"),
    path("sargytlar/<int:pk>/", v.PanelOrderDetail.as_view(), name="panel_order"),
    path("sazlamalar/", v.PanelSettingsView.as_view(), name="panel_settings"),
]
