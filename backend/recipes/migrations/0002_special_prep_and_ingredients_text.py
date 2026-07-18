from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('recipes', '0001_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='recipe',
            old_name='instructions',
            new_name='special_prep',
        ),
        migrations.AlterField(
            model_name='recipe',
            name='special_prep',
            field=models.TextField(blank=True, default=''),
        ),
        migrations.AddField(
            model_name='recipe',
            name='ingredients_text',
            field=models.TextField(blank=True, default=''),
        ),
    ]
