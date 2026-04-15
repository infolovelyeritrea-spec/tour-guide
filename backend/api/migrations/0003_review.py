from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0002_booking_group_fields"),
    ]

    operations = [
        migrations.CreateModel(
            name="Review",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=120)),
                ("origin_country", models.CharField(blank=True, max_length=120)),
                ("title", models.CharField(max_length=160)),
                ("rating", models.PositiveSmallIntegerField(default=5)),
                (
                    "trip_type",
                    models.CharField(
                        choices=[
                            ("city", "City Break"),
                            ("coast", "Coastal Escape"),
                            ("culture", "Culture Tour"),
                            ("family", "Family Trip"),
                            ("custom", "Custom Itinerary"),
                        ],
                        default="custom",
                        max_length=24,
                    ),
                ),
                ("comment", models.TextField()),
                ("approved", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={
                "ordering": ["-created_at"],
            },
        ),
    ]
