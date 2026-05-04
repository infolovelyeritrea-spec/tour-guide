from django.contrib import admin

from .models import Booking, Destination, DestinationGalleryImage, Memory, Review, SiteContent, VisitorLog


@admin.register(SiteContent)
class SiteContentAdmin(admin.ModelAdmin):
    fieldsets = (
        (
            "Hero",
            {
                "fields": (
                    "hero_title",
                    "hero_subtitle",
                    "hero_kicker",
                    "hero_primary_button",
                    "hero_secondary_button",
                    "hero_image",
                    "hero_image_url",
                )
            },
        ),
        ("Memories", {"fields": ("memories_eyebrow", "memories_title")}),
        ("Tour packages", {"fields": ("destinations_eyebrow", "destinations_title", "destinations_lead")}),
        ("Booking", {"fields": ("booking_title", "planning_title", "planning_text")}),
        ("Reviews", {"fields": ("reviews_title", "reviews_subtitle")}),
        ("About and contact", {"fields": ("about_title", "about_text", "contact_title", "contact_details")}),
    )

    def has_add_permission(self, request):
        return not SiteContent.objects.exists()


class DestinationGalleryImageInline(admin.TabularInline):
    model = DestinationGalleryImage
    extra = 1
    fields = ("display_order", "image", "image_url", "alt_text")


@admin.register(Destination)
class DestinationAdmin(admin.ModelAdmin):
    list_display = ("name", "region", "price_usd", "travel_time", "created_at")
    search_fields = ("name", "region")
    fields = ("name", "region", "description", "image", "image_url", "price_usd", "highlights", "travel_time")
    inlines = [DestinationGalleryImageInline]


@admin.register(Memory)
class MemoryAdmin(admin.ModelAdmin):
    list_display = ("title", "location", "created_at")
    search_fields = ("title", "location")
    fields = ("title", "location", "description", "image", "image_url")


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
