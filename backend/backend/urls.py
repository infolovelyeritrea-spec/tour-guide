from django.conf import settings
from django.contrib import admin
from django.urls import include, path, re_path
from django.views.generic import TemplateView
from django.views.static import serve as serve_static

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("api.urls")),
    re_path(
        r"^media/(?P<path>.*)$",
        serve_static,
        {"document_root": settings.MEDIA_ROOT},
    ),
]

# Catch-all: hand any other path to the built React app so client-side
# routing (and hard refreshes on non-root routes) work behind one host.
urlpatterns += [
    re_path(r"^(?!static/).*$", TemplateView.as_view(template_name="index.html")),
]
