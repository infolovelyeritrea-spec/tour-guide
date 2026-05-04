from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0004_relative_image_paths"),
    ]

    operations = [
        migrations.CreateModel(
            name="SiteContent",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("hero_title", models.CharField(default="Discover Eritrea", max_length=160)),
                (
                    "hero_subtitle",
                    models.TextField(
                        default="Plan memorable cultural, coastal, and city adventures with a simple and welcoming guide."
                    ),
                ),
                ("hero_kicker", models.CharField(default="Explore East Africa's hidden coastal jewel", max_length=160)),
                ("hero_primary_button", models.CharField(default="Start Planning", max_length=80)),
                ("hero_secondary_button", models.CharField(default="View Tour Packages", max_length=80)),
                ("hero_image", models.FileField(blank=True, upload_to="site/hero/")),
                (
                    "hero_image_url",
                    models.CharField(
                        default="/images/hero/hero.jpg",
                        help_text="Fallback path or full URL. Used when no hero image file is uploaded.",
                        max_length=255,
                    ),
                ),
                ("memories_eyebrow", models.CharField(default="Recent Memories", max_length=80)),
                (
                    "memories_title",
                    models.CharField(default="Moments Travelers Love Across Eritrea", max_length=160),
                ),
                ("destinations_eyebrow", models.CharField(default="Tour Packages", max_length=80)),
                ("destinations_title", models.CharField(default="Top Tour Packages", max_length=160)),
                (
                    "destinations_lead",
                    models.TextField(
                        default=(
                            "Compare curated Eritrea experiences, add your favorites to cart, and carry them "
                            "straight into booking."
                        )
                    ),
                ),
                ("booking_title", models.CharField(default="Plan and Book Your Tour", max_length=160)),
                ("planning_title", models.CharField(default="Build your Eritrea itinerary", max_length=160)),
                (
                    "planning_text",
                    models.TextField(
                        default=(
                            "Pick the tour packages you want, review the live estimate, and complete one simple "
                            "booking form for your preferred travel dates."
                        )
                    ),
                ),
                ("reviews_title", models.CharField(default="Traveler Reviews & Comments", max_length=160)),
                (
                    "reviews_subtitle",
                    models.TextField(
                        default=(
                            "Read recent feedback from visitors, then leave your own short review to help future "
                            "travelers plan with confidence."
                        )
                    ),
                ),
                ("about_title", models.CharField(default="About Lovely Eritrea", max_length=160)),
                (
                    "about_text",
                    models.TextField(
                        default=(
                            "We help curious travelers explore Eritrea through welcoming city stays, Red Sea escapes, "
                            "and cultural day tours with clear booking support."
                        )
                    ),
                ),
                ("contact_title", models.CharField(default="Contact Information", max_length=160)),
                (
                    "contact_details",
                    models.TextField(
                        default=(
                            "Phone: +291 1 123 456\n"
                            "Email: hello@eritreatourguide.com\n"
                            "Address: Harnet Avenue, Asmara, Eritrea"
                        ),
                        help_text="One contact detail per line.",
                    ),
                ),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "verbose_name": "Site content",
                "verbose_name_plural": "Site content",
            },
        ),
        migrations.AddField(
            model_name="destination",
            name="image",
            field=models.FileField(blank=True, upload_to="destinations/"),
        ),
        migrations.AddField(
            model_name="memory",
            name="image",
            field=models.FileField(blank=True, upload_to="memories/"),
        ),
    ]
