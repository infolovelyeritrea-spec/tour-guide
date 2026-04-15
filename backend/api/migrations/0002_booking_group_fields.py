from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="booking",
            name="origin_country",
            field=models.CharField(default="", max_length=120),
        ),
        migrations.AddField(
            model_name="booking",
            name="group_size",
            field=models.PositiveIntegerField(default=1),
        ),
        migrations.AddField(
            model_name="booking",
            name="adults",
            field=models.PositiveIntegerField(default=1),
        ),
        migrations.AddField(
            model_name="booking",
            name="children",
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AddField(
            model_name="booking",
            name="infants",
            field=models.PositiveIntegerField(default=0),
        ),
    ]