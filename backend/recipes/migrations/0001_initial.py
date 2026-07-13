import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="Recipe",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("title", models.CharField(max_length=200)),
                ("slug", models.SlugField(blank=True, max_length=220, unique=True)),
                ("instructions", models.TextField()),
                (
                    "program",
                    models.CharField(
                        blank=True,
                        choices=[
                            ("ice_cream", "Ice Cream"),
                            ("lite_ice_cream", "Lite Ice Cream"),
                            ("sorbet", "Sorbet"),
                            ("gelato", "Gelato"),
                            ("smoothie_bowl", "Smoothie Bowl"),
                            ("milkshake", "Milkshake"),
                            ("mix_in", "Mix-in"),
                            ("frozen_yogurt", "Frozen Yogurt"),
                            ("italian_ice", "Italian Ice"),
                        ],
                        max_length=20,
                    ),
                ),
                ("is_published", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "ordering": ["-created_at"],
            },
        ),
        migrations.CreateModel(
            name="Tag",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("slug", models.SlugField(max_length=50, unique=True)),
                ("label", models.CharField(max_length=50)),
            ],
            options={
                "ordering": ["label"],
            },
        ),
        migrations.CreateModel(
            name="RecipeIngredient",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "section",
                    models.CharField(
                        choices=[("base", "Base"), ("mix_in", "Mix-in")],
                        default="base",
                        max_length=10,
                    ),
                ),
                ("name", models.CharField(max_length=200)),
                (
                    "quantity",
                    models.DecimalField(
                        blank=True, decimal_places=2, max_digits=8, null=True
                    ),
                ),
                ("unit", models.CharField(blank=True, max_length=50)),
                ("prep_note", models.CharField(blank=True, max_length=200)),
                ("sort_order", models.PositiveSmallIntegerField(default=0)),
                (
                    "recipe",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="ingredients",
                        to="recipes.recipe",
                    ),
                ),
            ],
            options={
                "ordering": ["sort_order", "id"],
            },
        ),
        migrations.CreateModel(
            name="RecipeImage",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("image", models.ImageField(upload_to="recipes/")),
                ("sort_order", models.PositiveSmallIntegerField(default=0)),
                (
                    "recipe",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="images",
                        to="recipes.recipe",
                    ),
                ),
            ],
            options={
                "ordering": ["sort_order", "id"],
            },
        ),
        migrations.AddField(
            model_name="recipe",
            name="created_by",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="recipes",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AddField(
            model_name="recipe",
            name="tags",
            field=models.ManyToManyField(
                blank=True, related_name="recipes", to="recipes.tag"
            ),
        ),
        migrations.AddIndex(
            model_name="recipe",
            index=models.Index(
                fields=["is_published", "-created_at"],
                name="recipes_rec_is_publ_b5a4f1_idx",
            ),
        ),
        migrations.AddIndex(
            model_name="recipeingredient",
            index=models.Index(
                fields=["name"],
                name="recipes_rec_name_60ba64_idx",
            ),
        ),
    ]
