"""Seed a few test recipes so the frontend feed has content.

Temporary dev helper — safe to delete once real data exists.
Run: python manage.py seed_recipes
Clear: python manage.py seed_recipes --clear
"""

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from recipes.models import Recipe, RecipeIngredient, Tag

User = get_user_model()

SEED_USERNAME = "testchef"

TAGS = {
    "high-protein": "High Protein",
    "vegan": "Vegan",
    "chocolate": "Chocolate",
    "fruity": "Fruity",
}

RECIPES = [
    {
        "title": "Almond Vanilla Protein Ice Cream",
        "program": Recipe.Program.LITE_ICE_CREAM,
        "special_prep": (
            "Blend base until smooth. Freeze 24h. Spin on Lite Ice Cream. "
            "Add mix-ins, re-spin."
        ),
        "tags": ["high-protein"],
        "ingredients": [
            ("base", "almond milk", "1.5", "cup", ""),
            ("base", "vanilla protein powder", "1", "scoop", ""),
            ("base", "banana", "1", "whole", ""),
            ("mix_in", "toasted almonds", "2", "tbsp", "toasted & cooled"),
        ],
    },
    {
        "title": "Chocolate Peanut Butter Greek Yogurt",
        "program": Recipe.Program.LITE_ICE_CREAM,
        "special_prep": (
            "Whisk base smooth. Freeze 24h. Spin on Lite Ice Cream. "
            "Add peanut butter cups, re-spin."
        ),
        "tags": ["high-protein", "chocolate"],
        "ingredients": [
            ("base", "plain greek yogurt", "1.5", "cup", ""),
            ("base", "cocoa powder", "2", "tbsp", ""),
            ("base", "maple syrup", "2", "tbsp", ""),
            ("mix_in", "peanut butter cups", "3", "whole", "chopped"),
        ],
    },
    {
        "title": "Strawberry Sorbet",
        "program": Recipe.Program.SORBET,
        "special_prep": "Blend all. Freeze 24h. Spin on Sorbet. Re-spin if crumbly.",
        "tags": ["vegan", "fruity"],
        "ingredients": [
            ("base", "frozen strawberries", "2", "cup", ""),
            ("base", "water", "0.5", "cup", ""),
            ("base", "sugar", "3", "tbsp", ""),
        ],
    },
    {
        "title": "Cookies & Cream Dream",
        "program": Recipe.Program.ICE_CREAM,
        "special_prep": (
            "Blend base. Freeze 24h. Spin on Ice Cream. Add crushed cookies, re-spin."
        ),
        "tags": ["chocolate"],
        "ingredients": [
            ("base", "whole milk", "1", "cup", ""),
            ("base", "heavy cream", "0.5", "cup", ""),
            ("base", "sugar", "3", "tbsp", ""),
            ("mix_in", "chocolate sandwich cookies", "4", "whole", "crushed"),
        ],
    },
]


class Command(BaseCommand):
    help = "Seed test recipes for local development."

    def add_arguments(self, parser):
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Remove seeded test data instead of creating it.",
        )

    def handle(self, *args, **options):
        if options["clear"]:
            self._clear()
            return

        user, created = User.objects.get_or_create(
            username=SEED_USERNAME,
            defaults={"email": "testchef@example.com"},
        )
        if created:
            user.set_password("testpass123")
            user.save()
            self.stdout.write(f"Created user '{SEED_USERNAME}'")

        tag_objs = {}
        for slug, label in TAGS.items():
            tag, _ = Tag.objects.get_or_create(slug=slug, defaults={"label": label})
            tag_objs[slug] = tag

        for data in RECIPES:
            if Recipe.objects.filter(title=data["title"], created_by=user).exists():
                self.stdout.write(f"Skipped (exists): {data['title']}")
                continue

            recipe = Recipe.objects.create(
                created_by=user,
                title=data["title"],
                special_prep=data["special_prep"],
                program=data["program"],
            )
            recipe.tags.set([tag_objs[s] for s in data["tags"]])

            RecipeIngredient.objects.bulk_create(
                [
                    RecipeIngredient(
                        recipe=recipe,
                        section=section,
                        name=name,
                        quantity=quantity or None,
                        unit=unit,
                        prep_note=prep_note,
                        sort_order=i,
                    )
                    for i, (section, name, quantity, unit, prep_note) in enumerate(
                        data["ingredients"]
                    )
                ]
            )
            self.stdout.write(self.style.SUCCESS(f"Created: {data['title']}"))

        self.stdout.write(self.style.SUCCESS("Done seeding."))

    def _clear(self):
        deleted, _ = Recipe.objects.filter(created_by__username=SEED_USERNAME).delete()
        Tag.objects.filter(slug__in=TAGS.keys()).delete()
        User.objects.filter(username=SEED_USERNAME).delete()
        self.stdout.write(self.style.WARNING(f"Cleared seed data ({deleted} objects)."))
