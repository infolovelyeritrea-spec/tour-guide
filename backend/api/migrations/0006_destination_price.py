from django.db import migrations, models


PACKAGE_PRICES_USD = {
    "Asmara": 180,
    "Massawa": 240,
    "Keren": 160,
    "Dahlak Islands": 320,
    "Senafe Highlands": 210,
    "Gash-Barka Discovery": 260,
}


def set_existing_package_prices(apps, schema_editor):
    Destination = apps.get_model("api", "Destination")
    for name, price_usd in PACKAGE_PRICES_USD.items():
        Destination.objects.filter(name=name).update(price_usd=price_usd)


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0005_sitecontent_uploads"),
    ]

    operations = [
        migrations.AddField(
            model_name="destination",
            name="price_usd",
            field=models.PositiveIntegerField(default=150, help_text="Base price per traveler in USD."),
        ),
        migrations.RunPython(set_existing_package_prices, migrations.RunPython.noop),
    ]
