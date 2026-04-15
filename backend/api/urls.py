from django.urls import path

from .views import (
    AdminLoginView,
    AdminLogoutView,
    BookingCreateView,
    DashboardView,
    DestinationListView,
    HomeDataView,
    MemoryListView,
    ReviewCreateView,
    ReviewListView,
    TrackVisitorView,
)

urlpatterns = [
    path("home/", HomeDataView.as_view(), name="home-data"),
    path("destinations/", DestinationListView.as_view(), name="destination-list"),
    path("memories/", MemoryListView.as_view(), name="memory-list"),
    path("reviews/", ReviewListView.as_view(), name="review-list"),
    path("reviews/create/", ReviewCreateView.as_view(), name="review-create"),
    path("bookings/", BookingCreateView.as_view(), name="booking-create"),
    path("track-visitor/", TrackVisitorView.as_view(), name="track-visitor"),
    path("dashboard/", DashboardView.as_view(), name="dashboard"),
    path("admin-login/", AdminLoginView.as_view(), name="admin-login"),
    path("admin-logout/", AdminLogoutView.as_view(), name="admin-logout"),
]
