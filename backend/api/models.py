from django.db import models


class SiteContent(models.Model):
    hero_title = models.CharField(max_length=160, default="Discover Eritrea")
    hero_subtitle = models.TextField(
        default="Plan memorable cultural, coastal, and city adventures with a simple and welcoming guide."
    )
    hero_kicker = models.CharField(max_length=160, default="Explore East Africa's hidden coastal jewel")
    hero_primary_button = models.CharField(max_length=80, default="Start Planning")
    hero_secondary_button = models.CharField(max_length=80, default="View Tour Packages")
    hero_image = models.FileField(upload_to="site/hero/", blank=True)
    hero_image_url = models.CharField(
        max_length=255,
        default="/images/hero/hero.jpg",
        help_text="Fallback path or full URL. Used when no hero image file is uploaded.",
    )
    memories_eyebrow = models.CharField(max_length=80, default="Recent Memories")
    memories_title = models.CharField(max_length=160, default="Moments Travelers Love Across Eritrea")
    destinations_eyebrow = models.CharField(max_length=80, default="Tour Packages")
    destinations_title = models.CharField(max_length=160, default="Top Tour Packages")
    destinations_lead = models.TextField(
        default="Compare curated Eritrea experiences, add your favorites to cart, and carry them straight into booking."
    )
    booking_title = models.CharField(max_length=160, default="Plan and Book Your Tour")
    planning_title = models.CharField(max_length=160, default="Build your Eritrea itinerary")
    planning_text = models.TextField(
        default=(
            "Pick the tour packages you want, review the live estimate, and complete one simple booking form "
            "for your preferred travel dates."
        )
    )
    reviews_title = models.CharField(max_length=160, default="Traveler Reviews & Comments")
    reviews_subtitle = models.TextField(
        default=(
            "Read recent feedback from visitors, then leave your own short review to help future travelers "
            "plan with confidence."
        )
    )
    about_title = models.CharField(max_length=160, default="About Lovely Eritrea")
    about_text = models.TextField(
        default=(
            "We help curious travelers explore Eritrea through welcoming city stays, Red Sea escapes, "
            "and cultural day tours with clear booking support."
        )
    )
    contact_title = models.CharField(max_length=160, default="Contact Information")
    contact_details = models.TextField(
        default="Phone: +291 1 123 456\nEmail: hello@eritreatourguide.com\nAddress: Harnet Avenue, Asmara, Eritrea",
        help_text="One contact detail per line.",
    )
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Site content"
        verbose_name_plural = "Site content"

    def __str__(self):
        return "Site content"

    @classmethod
    def get_current(cls):
        content, _created = cls.objects.get_or_create(pk=1)
        return content

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)


class Destination(models.Model):
    name = models.CharField(max_length=120)
    region = models.CharField(max_length=120)
    description = models.TextField()
    image = models.FileField(upload_to="destinations/", blank=True)
    image_url = models.CharField(max_length=255, help_text="Use a relative path like /images/destinations/asmara.jpg")
    price_usd = models.PositiveIntegerField(default=150, help_text="Base price per traveler in USD.")
    highlights = models.TextField(help_text="Comma-separated highlight list")
    travel_time = models.CharField(max_length=80)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class DestinationGalleryImage(models.Model):
    destination = models.ForeignKey(Destination, related_name="gallery_images", on_delete=models.CASCADE)
    image = models.FileField(upload_to="destination-galleries/", blank=True)
    image_url = models.CharField(
        max_length=255,
        blank=True,
        help_text="Optional fallback path or full URL. Used when no gallery image file is uploaded.",
    )
    alt_text = models.CharField(max_length=160, blank=True)
    display_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["display_order", "id"]

    def __str__(self):
        return self.alt_text or f"{self.destination.name} gallery image"


class Memory(models.Model):
    title = models.CharField(max_length=120)
    location = models.CharField(max_length=120)
    description = models.TextField()
    image = models.FileField(upload_to="memories/", blank=True)
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
