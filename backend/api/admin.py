from django.contrib import admin

from .models import Booking, Destination, Memory, Review, VisitorLog


@admin.register(Destination)
class DestinationAdmin(admin.ModelAdmin):
    list_display = ("name", "region", "travel_time", "created_at")
    search_fields = ("name", "region")


@admin.register(Memory)
class MemoryAdmin(admin.ModelAdmin):
    list_display = ("title", "location", "created_at")
    search_fields = ("title", "location")


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "travel_date", "created_at")
    search_fields = ("name", "email")
    list_filter = ("travel_date", "created_at")


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ("name", "title", "rating", "trip_type", "approved", "created_at")
    search_fields = ("name", "title", "comment", "origin_country")
    list_filter = ("rating", "trip_type", "approved", "created_at")


@admin.register(VisitorLog)
class VisitorLogAdmin(admin.ModelAdmin):
    list_display = ("path", "ip_address", "visited_at")
    list_filter = ("path", "visited_at")
