from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("catalog", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="part",
            name="description",
            field=models.TextField(blank=True, verbose_name="Düşündiriş (hökman däl)"),
        ),
    ]
