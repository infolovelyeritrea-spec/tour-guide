from django.db import models


class Destination(models.Model):
    name = models.CharField(max_length=120)
    region = models.CharField(max_length=120)
    description = models.TextField()
    image_url = models.CharField(max_length=255, help_text="Use a relative path like /images/destinations/asmara.jpg")
    highlights = models.TextField(help_text="Comma-separated highlight list")
    travel_time = models.CharField(max_length=80)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Memory(models.Model):
    title = models.CharField(max_length=120)
    location = models.CharField(max_length=120)
    description = models.TextField()
    image_url = models.CharField(max_length=255, help_text="Use a relative path like /images/memories/one.jpg")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["title"]

    def __str__(self):
        return self.title


class Booking(models.Model):
    name = models.CharField(max_length=120)
    email = models.EmailField()
    origin_country = models.CharField(max_length=120, default="")
    group_size = models.PositiveIntegerField(default=1)
    adults = models.PositiveIntegerField(default=1)
    children = models.PositiveIntegerField(default=0)
    infants = models.PositiveIntegerField(default=0)
    travel_date = models.DateField()
    extra_requests = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} - {self.travel_date}"


class Review(models.Model):
    TRIP_TYPE_CHOICES = [
        ("city", "City Break"),
        ("coast", "Coastal Escape"),
        ("culture", "Culture Tour"),
        ("family", "Family Trip"),
        ("custom", "Custom Itinerary"),
    ]

    name = models.CharField(max_length=120)
    origin_country = models.CharField(max_length=120, blank=True)
    title = models.CharField(max_length=160)
    rating = models.PositiveSmallIntegerField(default=5)
    trip_type = models.CharField(max_length=24, choices=TRIP_TYPE_CHOICES, default="custom")
    comment = models.TextField()
    approved = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} - {self.title}"


class VisitorLog(models.Model):
    path = models.CharField(max_length=255)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    visited_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-visited_at"]

    def __str__(self):
        return f"{self.path} @ {self.visited_at:%Y-%m-%d %H:%M}"
