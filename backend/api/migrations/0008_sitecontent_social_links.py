from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0007_destination_gallery_images"),
    ]

    operations = [
        migrations.AddField(
            model_name="sitecontent",
            name="whatsapp_url",
            field=models.CharField(blank=True, default="https://wa.me/2911123456", max_length=255),
        ),
        migrations.AddField(
            model_name="sitecontent",
            name="whatsapp_detail",
            field=models.CharField(blank=True, default="+291 1 123 456", max_length=120),
        ),
        migrations.AddField(
            model_name="sitecontent",
            name="instagram_url",
            field=models.CharField(blank=True, default="https://instagram.com/lovelyeritrea", max_length=255),
        ),
        migrations.AddField(
            model_name="sitecontent",
            name="instagram_detail",
            field=models.CharField(blank=True, default="@lovelyeritrea", max_length=120),
        ),
        migrations.AddField(
            model_name="sitecontent",
            name="facebook_url",
            field=models.CharField(blank=True, default="https://facebook.com/lovelyeritrea", max_length=255),
        ),
        migrations.AddField(
            model_name="sitecontent",
            name="facebook_detail",
            field=models.CharField(blank=True, default="Lovely Eritrea", max_length=120),
        ),
    ]
