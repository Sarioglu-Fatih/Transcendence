# Generated by Django 4.2.9 on 2024-01-14 14:03

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='token',
            field=models.CharField(default='', max_length=255),
        ),
    ]