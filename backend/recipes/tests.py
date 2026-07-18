from decimal import Decimal

from rest_framework import status
from rest_framework.test import APITestCase

from users.models import User

from .models import Recipe, RecipeIngredient
from .parsing import parse_ingredients_text


def _ingredient(name="milk", quantity="1", unit="cup", section="base"):
    return {"section": section, "name": name, "quantity": quantity, "unit": unit}


class RecipeCreateTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="mel", email="mel@example.com", password="test-pass-123"
        )
        self.client.force_authenticate(self.user)

    def test_title_required(self):
        response = self.client.post(
            "/api/recipes/",
            {"ingredients": [_ingredient()]},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_special_prep_omitted_defaults_to_blank(self):
        response = self.client.post(
            "/api/recipes/",
            {"title": "Vanilla Pint", "ingredients": [_ingredient()]},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        recipe = Recipe.objects.get(slug=response.json()["slug"])
        self.assertEqual(recipe.special_prep, "")

    def test_program_omitted_is_allowed(self):
        response = self.client.post(
            "/api/recipes/",
            {"title": "No Program Pint", "ingredients": [_ingredient()]},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_publish_without_ingredients_fails(self):
        response = self.client.post(
            "/api/recipes/",
            {"title": "Empty Pint", "ingredients": []},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("ingredients", response.json())

    def test_draft_without_ingredients_succeeds(self):
        response = self.client.post(
            "/api/recipes/",
            {"title": "Draft Pint", "ingredients": [], "is_published": False},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_ingredients_text_round_trips(self):
        response = self.client.post(
            "/api/recipes/",
            {
                "title": "Pint With Raw Text",
                "ingredients_text": "1 cup milk",
                "ingredients": [_ingredient()],
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        detail = self.client.get(f"/api/recipes/{response.json()['slug']}/")
        self.assertEqual(detail.json()["ingredients_text"], "1 cup milk")

    def test_ingredient_quantity_unit_section_persist(self):
        response = self.client.post(
            "/api/recipes/",
            {
                "title": "Structured Pint",
                "ingredients": [
                    _ingredient("almond milk", "1.5", "cup", "base"),
                    _ingredient("chocolate chips", "2", "tbsp", "mix_in"),
                ],
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        recipe = Recipe.objects.get(slug=response.json()["slug"])
        base = recipe.ingredients.get(name="almond milk")
        self.assertEqual(base.quantity, Decimal("1.50"))
        self.assertEqual(base.unit, "cup")
        self.assertEqual(base.section, "base")
        mix_in = recipe.ingredients.get(name="chocolate chips")
        self.assertEqual(mix_in.section, "mix_in")

    def test_recipe_titled_parse_ingredients_gets_disambiguated_slug(self):
        response = self.client.post(
            "/api/recipes/",
            {"title": "Parse Ingredients", "ingredients": [_ingredient()]},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertNotEqual(response.json()["slug"], "parse-ingredients")

    def test_create_with_tag_slugs(self):
        from recipes.models import Tag

        Tag.objects.create(slug="vegan", label="Vegan")
        Tag.objects.create(slug="fruity", label="Fruity")
        response = self.client.post(
            "/api/recipes/",
            {
                "title": "Tagged Pint",
                "ingredients": [_ingredient()],
                "tag_slugs": ["vegan", "fruity"],
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        recipe = Recipe.objects.get(slug=response.json()["slug"])
        self.assertEqual(
            set(recipe.tags.values_list("slug", flat=True)),
            {"vegan", "fruity"},
        )


class TagListTests(APITestCase):
    def test_lists_tags_without_auth(self):
        from recipes.models import Tag

        Tag.objects.create(slug="vegan", label="Vegan")
        Tag.objects.create(slug="chocolate", label="Chocolate")
        response = self.client.get("/api/tags/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.json(),
            [
                {"slug": "chocolate", "label": "Chocolate"},
                {"slug": "vegan", "label": "Vegan"},
            ],
        )


class RecipeUpdateTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="mel", email="mel@example.com", password="test-pass-123"
        )
        self.client.force_authenticate(self.user)
        self.recipe = Recipe.objects.create(created_by=self.user, title="Original")
        RecipeIngredient.objects.create(recipe=self.recipe, name="milk", section="base")

    def test_patch_title_only_leaves_ingredients_untouched(self):
        response = self.client.patch(
            f"/api/recipes/{self.recipe.slug}/",
            {"title": "Updated"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(self.recipe.ingredients.count(), 1)

    def test_patch_clearing_ingredients_on_published_recipe_fails(self):
        response = self.client.patch(
            f"/api/recipes/{self.recipe.slug}/",
            {"ingredients": []},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_unpublish_with_no_ingredients_succeeds(self):
        response = self.client.patch(
            f"/api/recipes/{self.recipe.slug}/",
            {"is_published": False, "ingredients": []},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_full_put_replaces_ingredients(self):
        response = self.client.put(
            f"/api/recipes/{self.recipe.slug}/",
            {
                "title": "Original",
                "ingredients": [_ingredient("banana", "1", "whole")],
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.recipe.refresh_from_db()
        self.assertEqual(self.recipe.ingredients.count(), 1)
        self.assertEqual(self.recipe.ingredients.first().name, "banana")


class ParseIngredientsEndpointTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="mel", email="mel@example.com", password="test-pass-123"
        )

    def test_anonymous_request_is_forbidden(self):
        response = self.client.post(
            "/api/recipes/parse-ingredients/", {"text": "1 cup milk"}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_blank_text_is_rejected(self):
        self.client.force_authenticate(self.user)
        response = self.client.post(
            "/api/recipes/parse-ingredients/", {"text": "   "}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_golden_example_parses_to_three_ingredients(self):
        self.client.force_authenticate(self.user)
        response = self.client.post(
            "/api/recipes/parse-ingredients/",
            {"text": "1 cup Fairlife, 2 tbsp cocoa, handful of strawberries"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        body = response.json()
        self.assertEqual(len(body["ingredients"]), 3)
        self.assertTrue(body["warnings"])

    def test_mix_in_prefix_sets_section(self):
        self.client.force_authenticate(self.user)
        response = self.client.post(
            "/api/recipes/parse-ingredients/",
            {"text": "mix-in: crushed oreos"},
            format="json",
        )
        self.assertEqual(response.json()["ingredients"][0]["section"], "mix_in")

    def test_multiline_headers_produce_no_rows_and_correct_sections(self):
        self.client.force_authenticate(self.user)
        text = "Base:\nalmond milk, banana\nMix-ins:\nchocolate chips"
        response = self.client.post(
            "/api/recipes/parse-ingredients/", {"text": text}, format="json"
        )
        ingredients = response.json()["ingredients"]
        self.assertEqual(len(ingredients), 3)
        self.assertEqual(ingredients[0]["section"], "base")
        self.assertEqual(ingredients[-1]["section"], "mix_in")

    def test_parse_never_persists_a_recipe(self):
        self.client.force_authenticate(self.user)
        self.client.post(
            "/api/recipes/parse-ingredients/",
            {"text": "1 cup milk"},
            format="json",
        )
        self.assertEqual(Recipe.objects.count(), 0)

    def test_response_shape_matches_write_serializer_fields(self):
        self.client.force_authenticate(self.user)
        response = self.client.post(
            "/api/recipes/parse-ingredients/",
            {"text": "1 cup milk"},
            format="json",
        )
        ingredient = response.json()["ingredients"][0]
        self.assertEqual(
            set(ingredient.keys()), {"section", "name", "quantity", "unit", "sort_order"}
        )


class ParseIngredientsFunctionTests(APITestCase):
    def test_fraction_and_mixed_number(self):
        ingredients, _ = parse_ingredients_text("1/2 cup milk, 1 1/2 cups ice")
        self.assertEqual(ingredients[0]["quantity"], "0.5")
        self.assertEqual(ingredients[1]["quantity"], "1.5")

    def test_unicode_fraction(self):
        ingredients, _ = parse_ingredients_text("¾ cup yogurt")
        self.assertEqual(ingredients[0]["quantity"], "0.75")

    def test_plural_unit_normalizes(self):
        ingredients, _ = parse_ingredients_text("2 scoops protein powder")
        self.assertEqual(ingredients[0]["unit"], "scoop")

    def test_unknown_word_after_number_is_not_treated_as_unit(self):
        ingredients, _ = parse_ingredients_text("2 eggs")
        self.assertEqual(ingredients[0]["unit"], "")
        self.assertEqual(ingredients[0]["name"], "eggs")

    def test_word_number_and_handfuls(self):
        ingredients, warnings = parse_ingredients_text(
            "Two handfuls of blueberries"
        )
        self.assertEqual(len(ingredients), 1)
        self.assertEqual(ingredients[0]["quantity"], "2")
        self.assertEqual(ingredients[0]["unit"], "handful")
        self.assertEqual(ingredients[0]["name"], "blueberries")
        self.assertTrue(warnings)

    def test_cup_and_a_half_not_split_on_and(self):
        ingredients, _ = parse_ingredients_text(
            "A cup and a half of lactose-free 2% Greek yogurt"
        )
        self.assertEqual(len(ingredients), 1)
        self.assertEqual(ingredients[0]["quantity"], "1.5")
        self.assertEqual(ingredients[0]["unit"], "cup")
        self.assertEqual(
            ingredients[0]["name"], "lactose-free 2% Greek yogurt"
        )

    def test_unit_first_implied_one(self):
        ingredients, _ = parse_ingredients_text("Teaspoon of vanilla extract")
        self.assertEqual(len(ingredients), 1)
        self.assertEqual(ingredients[0]["quantity"], "1")
        self.assertEqual(ingredients[0]["unit"], "tsp")
        self.assertEqual(ingredients[0]["name"], "vanilla extract")

    def test_a_dash_of_salt(self):
        ingredients, warnings = parse_ingredients_text("A dash of salt")
        self.assertEqual(ingredients[0]["quantity"], "1")
        self.assertEqual(ingredients[0]["unit"], "dash")
        self.assertEqual(ingredients[0]["name"], "salt")
        self.assertTrue(warnings)

    def test_spoken_creami_list(self):
        text = (
            "Two handfuls of blueberries\n"
            "A cup and a half of lactose-free 2% Greek yogurt\n"
            "Teaspoon of vanilla extract\n"
            "A dash of salt"
        )
        ingredients, _ = parse_ingredients_text(text)
        self.assertEqual(
            [(i["quantity"], i["unit"], i["name"]) for i in ingredients],
            [
                ("2", "handful", "blueberries"),
                ("1.5", "cup", "lactose-free 2% Greek yogurt"),
                ("1", "tsp", "vanilla extract"),
                ("1", "dash", "salt"),
            ],
        )


class RecipeModelTests(APITestCase):
    def test_special_prep_defaults_to_blank(self):
        user = User.objects.create_user(
            username="mel", email="mel@example.com", password="test-pass-123"
        )
        recipe = Recipe.objects.create(created_by=user, title="Untitled")
        self.assertEqual(recipe.special_prep, "")

    def test_reserved_slug_is_never_assigned(self):
        user = User.objects.create_user(
            username="mel", email="mel@example.com", password="test-pass-123"
        )
        recipe = Recipe.objects.create(created_by=user, title="Parse Ingredients")
        self.assertNotEqual(recipe.slug, "parse-ingredients")
