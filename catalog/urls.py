from django.urls import path, re_path

from . import api
from .spa import spa

urlpatterns = [
    # JSON API (React üçin)
    path("api/site/", api.site_info),
    path("api/parts/", api.parts_list),
    path("api/parts/<int:pk>/", api.part_detail),
    path("api/suggest/", api.suggest),
    path("api/orders/", api.create_order),

    # React sahypasy (ähli galan ýollar)
    path("", spa, name="home"),
    path("haryt/<int:pk>/", spa, name="part_detail"),
    re_path(r"^(?!api/|panel/|media/|static/).*$", spa),
]
