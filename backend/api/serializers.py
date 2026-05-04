from datetime import date

from rest_framework import serializers

from .models import Booking, Destination, Memory, Review, SiteContent


def get_file_or_fallback_url(obj, file_field_name, fallback_field_name):
    uploaded_file = getattr(obj, file_field_name, None)
    if uploaded_file:
        return uploaded_file.url
    return getattr(obj, fallback_field_name)


def normalize_optional_image_url(obj, file_field_name, fallback_field_name):
    image_url = get_file_or_fallback_url(obj, file_field_name, fallback_field_name)
    return image_url or None


class SiteContentSerializer(serializers.ModelSerializer):
    hero = serializers.SerializerMethodField()
    copy = serializers.SerializerMethodField()
    social_links = serializers.SerializerMethodField()

    class Meta:
        model = SiteContent
        fields = ["hero", "copy", "social_links"]

    def get_hero(self, obj):
        return {
            "title": obj.hero_title,
            "subtitle": obj.hero_subtitle,
            "kicker": obj.hero_kicker,
            "primary_button": obj.hero_primary_button,
            "secondary_button": obj.hero_secondary_button,
            "image_url": get_file_or_fallback_url(obj, "hero_image", "hero_image_url"),
        }

    def get_copy(self, obj):
        return {
            "destinations": obj.destinations_title,
            "destinationsEyebrow": obj.destinations_eyebrow,
            "destinationsLead": obj.destinations_lead,
            "memoriesEyebrow": obj.memories_eyebrow,
            "memoriesTitle": obj.memories_title,
            "bookingTitle": obj.booking_title,
            "planningTitle": obj.planning_title,
            "planningText": obj.planning_text,
            "reviewsTitle": obj.reviews_title,
            "reviewsSubtitle": obj.reviews_subtitle,
            "aboutTitle": obj.about_title,
            "aboutText": obj.about_text,
            "contactTitle": obj.contact_title,
            "contactDetails": [item.strip() for item in obj.contact_details.splitlines() if item.strip()],
        }

    def get_social_links(self, obj):
        links = [
            {
                "name": "WhatsApp",
                "href": obj.whatsapp_url,
                "detail": obj.whatsapp_detail,
                "icon": "whatsapp",
            },
            {
                "name": "Instagram",
                "href": obj.instagram_url,
                "detail": obj.instagram_detail,
                "icon": "instagram",
            },
            {
                "name": "Facebook",
                "href": obj.facebook_url,
                "detail": obj.facebook_detail,
                "icon": "facebook",
            },
        ]
        return [item for item in links if item["href"]]


class DestinationSerializer(serializers.ModelSerializer):
    highlights = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()
    gallery_images = serializers.SerializerMethodField()

    class Meta:
        model = Destination
        fields = [
            "id",
            "name",
            "region",
            "description",
            "image_url",
            "price_usd",
            "highlights",
            "travel_time",
            "gallery_images",
        ]

    def get_highlights(self, obj):
        return [item.strip() for item in obj.highlights.split(",") if item.strip()]

    def get_image_url(self, obj):
        return get_file_or_fallback_url(obj, "image", "image_url")

    def get_gallery_images(self, obj):
        return [
            image_url
            for image_url in (
                normalize_optional_image_url(item, "image", "image_url") for item in obj.gallery_images.all()
            )
            if image_url
        ]


class MemorySerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Memory
        fields = ["id", "title", "location", "description", "image_url"]

    def get_image_url(self, obj):
        return get_file_or_fallback_url(obj, "image", "image_url")


class ReviewSerializer(serializers.ModelSerializer):
    trip_type_label = serializers.CharField(source="get_trip_type_display", read_only=True)

    class Meta:
        model = Review
        fields = [
            "id",
            "name",
            "origin_country",
            "title",
            "rating",
            "trip_type",
            "trip_type_label",
            "comment",
            "created_at",
        ]

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value

    def validate_title(self, value):
        value = value.strip()
        if len(value) < 4:
            raise serializers.ValidationError("Review title must be at least 4 characters long.")
        return value

    def validate_comment(self, value):
        value = value.strip()
        if len(value) < 12:
            raise serializers.ValidationError("Review comment must be at least 12 characters long.")
        return value


class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = [
            "id",
            "name",
            "email",
            "origin_country",
            "group_size",
            "adults",
            "children",
            "infants",
            "travel_date",
            "extra_requests",
            "created_at",
        ]

    def validate_travel_date(self, value):
        if value < date.today():
            raise serializers.ValidationError("Travel date cannot be in the past.")
        return value

    def validate(self, attrs):
        adults = attrs.get("adults", 0)
        children = attrs.get("children", 0)
        infants = attrs.get("infants", 0)
        group_size = attrs.get("group_size", 0)

        if adults < 1:
            raise serializers.ValidationError({"adults": "At least one adult is required."})

        if group_size < 1:
            raise serializers.ValidationError({"group_size": "Group size must be at least 1."})

        if adults + children + infants != group_size:
            raise serializers.ValidationError(
                {"group_size": "Group size must equal adults + children + infants."}
            )

        return attrs
