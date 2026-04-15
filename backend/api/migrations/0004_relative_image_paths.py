from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0003_review"),
    ]

    operations = [
        migrations.AlterField(
            model_name="destination",
            name="image_url",
            field=models.CharField(
                help_text="Use a relative path like /images/destinations/asmara.jpg",
                max_length=255,
            ),
        ),
        migrations.AlterField(
            model_name="memory",
            name="image_url",
            field=models.CharField(
                help_text="Use a relative path like /images/memories/one.jpg",
                max_length=255,
            ),
        ),
    ]
