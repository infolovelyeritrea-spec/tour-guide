from django.db import migrations, models
import django.db.models.deletion


DEFAULT_GALLERIES = {
    "Asmara": [
        "/images/tour-packages/one/gallery1.webp",
        "/images/tour-packages/one/gallery2.webp",
        "/images/tour-packages/one/gallery3.webp",
        "/images/tour-packages/one/gallery4.webp",
        "/images/tour-packages/one/gallery5.webp",
        "/images/tour-packages/one/gallery6.webp",
    ],
    "Massawa": [
        "/images/tour-packages/two/gallery31.webp",
        "/images/tour-packages/two/gallery32.webp",
        "/images/tour-packages/two/gallery33.webp",
        "/images/tour-packages/two/gallery34.webp",
        "/images/tour-packages/two/gallery35.webp",
        "/images/tour-packages/two/gallery36.webp",
    ],
    "Keren": [
        "/images/tour-packages/three/gallery52.webp",
        "/images/tour-packages/three/gallery53.webp",
        "/images/tour-packages/three/gallery54.webp",
        "/images/tour-packages/three/gallery55.webp",
        "/images/tour-packages/three/gallery56.webp",
        "/images/tour-packages/three/gallery57.webp",
    ],
    "Dahlak Islands": [
        "/images/tour-packages/four/gallery109.webp",
        "/images/tour-packages/four/gallery110.webp",
        "/images/tour-packages/four/gallery111.webp",
        "/images/tour-packages/four/gallery112.webp",
        "/images/tour-packages/four/gallery113.webp",
        "/images/tour-packages/four/gallery114.webp",
    ],
    "Senafe Highlands": [
        "/images/tour-packages/five/gallery137.webp",
        "/images/tour-packages/five/gallery138.webp",
        "/images/tour-packages/five/gallery139.webp",
        "/images/tour-packages/five/gallery140.webp",
        "/images/tour-packages/five/gallery141.webp",
        "/images/tour-packages/five/gallery142.webp",
    ],
    "Gash-Barka Discovery": [
        "/images/tour-packages/six/gallery171.webp",
        "/images/tour-packages/six/gallery172.webp",
        "/images/tour-packages/six/gallery173.webp",
        "/images/tour-packages/six/gallery176.webp",
        "/images/tour-packages/six/gallery177.webp",
        "/images/tour-packages/six/gallery178.webp",
    ],
}


def seed_default_galleries(apps, schema_editor):
    Destination = apps.get_model("api", "Destination")
    DestinationGalleryImage = apps.get_model("api", "DestinationGalleryImage")

    for package_name, image_urls in DEFAULT_GALLERIES.items():
        destination = Destination.objects.filter(name=package_name).first()
        if not destination:
            continue

        for index, image_url in enumerate(image_urls, start=1):
            DestinationGalleryImage.objects.get_or_create(
                destination=destination,
                image_url=image_url,
                defaults={
                    "display_order": index,
                    "alt_text": f"{package_name} gallery {index}",
                },
            )


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0006_destination_price"),
    ]

    operations = [
        migrations.CreateModel(
            name="DestinationGalleryImage",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("image", models.FileField(blank=True, upload_to="destination-galleries/")),
                (
                    "image_url",
                    models.CharField(
                        blank=True,
                        help_text="Optional fallback path or full URL. Used when no gallery image file is uploaded.",
                        max_length=255,
                    ),
                ),
                ("alt_text", models.CharField(blank=True, max_length=160)),
                ("display_order", models.PositiveIntegerField(default=0)),
                (
                    "destination",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="gallery_images",
                        to="api.destination",
                    ),
                ),
            ],
            options={
                "ordering": ["display_order", "id"],
            },
        ),
        migrations.RunPython(seed_default_galleries, migrations.RunPython.noop),
    ]
