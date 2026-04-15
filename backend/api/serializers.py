from datetime import date

from rest_framework import serializers

from .models import Booking, Destination, Memory, Review


class DestinationSerializer(serializers.ModelSerializer):
    highlights = serializers.SerializerMethodField()

    class Meta:
        model = Destination
        fields = [
            "id",
            "name",
            "region",
            "description",
            "image_url",
            "highlights",
            "travel_time",
        ]

    def get_highlights(self, obj):
        return [item.strip() for item in obj.highlights.split(",") if item.strip()]


class MemorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Memory
        fields = ["id", "title", "location", "description", "image_url"]


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
