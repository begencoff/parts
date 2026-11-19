from django.conf import settings
from django.conf.urls.static import static
from django.urls import include, path

urlpatterns = [
    path("panel/", include("catalog.panel_urls")),
    path("", include("catalog.urls")),
]

# Ösüş wagtynda suratlary görkezmek üçin. Production-da nginx ulanyň.
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
