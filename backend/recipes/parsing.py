"""Heuristic free-form ingredient parser.

Deterministic v1 (regex/line-based) behind a pure-function seam so an
LLM-backed implementation could later replace the body without changing the
request/response contract used by ParseIngredientsView.
"""

import re
from decimal import ROUND_HALF_UP, Decimal

_HEADER_ONLY_RE = re.compile(r"^(base|mix-?ins?)\s*:?\s*$", re.IGNORECASE)
_PREFIX_WITH_CONTENT_RE = re.compile(r"^(mix-?ins?|base)\s*:\s*(.+)$", re.IGNORECASE)
_BULLET_RE = re.compile(r"^[-*•]\s*")

_UNICODE_FRACTIONS = {
    "¼": "0.25",
    "½": "0.5",
    "¾": "0.75",
    "⅓": "0.3333",
    "⅔": "0.6667",
    "⅛": "0.125",
    "⅜": "0.375",
    "⅝": "0.625",
    "⅞": "0.875",
}

_WORD_NUMBERS = {
    "a": "1",
    "an": "1",
    "one": "1",
    "two": "2",
    "three": "3",
    "four": "4",
    "five": "5",
    "six": "6",
    "seven": "7",
    "eight": "8",
    "nine": "9",
    "ten": "10",
    "eleven": "11",
    "twelve": "12",
}

_UNIT_ALIASES = {
    "cup": "cup",
    "cups": "cup",
    "tbsp": "tbsp",
    "tablespoon": "tbsp",
    "tablespoons": "tbsp",
    "tsp": "tsp",
    "teaspoon": "tsp",
    "teaspoons": "tsp",
    "oz": "oz",
    "ounce": "oz",
    "ounces": "oz",
    "ml": "ml",
    "milliliter": "ml",
    "milliliters": "ml",
    "l": "l",
    "liter": "l",
    "liters": "l",
    "pint": "pint",
    "pints": "pint",
    "quart": "quart",
    "quarts": "quart",
    "gallon": "gallon",
    "gallons": "gallon",
    "g": "g",
    "gram": "g",
    "grams": "g",
    "kg": "kg",
    "kilogram": "kg",
    "kilograms": "kg",
    "lb": "lb",
    "lbs": "lb",
    "pound": "lb",
    "pounds": "lb",
    "scoop": "scoop",
    "scoops": "scoop",
    "whole": "whole",
    "slice": "slice",
    "slices": "slice",
    "clove": "clove",
    "cloves": "clove",
    "can": "can",
    "cans": "can",
    "packet": "packet",
    "packets": "packet",
    "stick": "stick",
    "sticks": "stick",
    "bar": "bar",
    "bars": "bar",
    # Vague / approximate units (stored on `unit`, often without a precise qty)
    "handful": "handful",
    "handfuls": "handful",
    "pinch": "pinch",
    "pinches": "pinch",
    "dash": "dash",
    "dashes": "dash",
    "splash": "splash",
    "splashes": "splash",
    "drizzle": "drizzle",
    "drizzles": "drizzle",
    "sprinkle": "sprinkle",
    "sprinkles": "sprinkle",
    "squeeze": "squeeze",
    "squeezes": "squeeze",
    "bunch": "bunch",
    "bunches": "bunch",
}

_VAGUE_UNITS = {
    "handful",
    "pinch",
    "dash",
    "splash",
    "drizzle",
    "sprinkle",
    "squeeze",
    "bunch",
}

# "cup and a half", "cups and a quarter", etc. — protect before splitting on "and"
_AND_AMOUNT_RE = re.compile(
    r"\band\s+(?:a\s+)?(half|quarter|third|⅔|⅓|½|¼)\b",
    re.IGNORECASE,
)

_OF_RE = re.compile(r"^of\s+(.+)$", re.IGNORECASE)

_MIXED_NUMBER_RE = re.compile(r"^(\d+)\s+(\d+)/(\d+)\b\s*(.*)$")
_FRACTION_RE = re.compile(r"^(\d+)/(\d+)\b\s*(.*)$")
_DECIMAL_RE = re.compile(r"^(\d+(?:\.\d+)?)\b\s*(.*)$")
_WORD_NUMBER_RE = re.compile(
    r"^(" + "|".join(_WORD_NUMBERS.keys()) + r")\b\s*(.*)$",
    re.IGNORECASE,
)


def parse_ingredients_text(text: str) -> tuple[list[dict], list[str]]:
    ingredients: list[dict] = []
    warnings: list[str] = []
    current_section = "base"
    sort_order = 0

    for raw_line in text.splitlines():
        line = _BULLET_RE.sub("", raw_line.strip()).strip()
        if not line:
            continue

        if _HEADER_ONLY_RE.match(line):
            current_section = _normalize_section(_HEADER_ONLY_RE.match(line).group(1))
            continue

        prefix_match = _PREFIX_WITH_CONTENT_RE.match(line)
        if prefix_match:
            current_section = _normalize_section(prefix_match.group(1))
            content = prefix_match.group(2)
        else:
            content = line

        for item_text in _split_items(content):
            ingredient, warning = _parse_item(item_text, current_section, sort_order)
            if ingredient is not None:
                ingredients.append(ingredient)
                sort_order += 1
            if warning is not None:
                warnings.append(warning)

    return ingredients, warnings


def _normalize_section(word: str) -> str:
    return "mix_in" if word.lower().startswith("mix") else "base"


def _split_items(content: str) -> list[str]:
    """Split comma/semicolon/and lists without breaking 'cup and a half'."""
    placeholders: list[str] = []

    def _stash(match: re.Match) -> str:
        placeholders.append(match.group(0))
        return f"\x00{len(placeholders) - 1}\x00"

    # Protect parentheticals and "and a half"-style amount phrases.
    protected = re.sub(r"\([^)]*\)", _stash, content)
    protected = _AND_AMOUNT_RE.sub(_stash, protected)
    raw_items = re.split(r",|;|\band\b", protected, flags=re.IGNORECASE)

    def _restore(match: re.Match) -> str:
        return placeholders[int(match.group(1))]

    items = []
    for raw in raw_items:
        restored = re.sub(r"\x00(\d+)\x00", _restore, raw).strip()
        if restored:
            items.append(restored)
    return items


def _parse_item(item_text: str, section: str, sort_order: int) -> tuple[dict | None, str | None]:
    quantity, unit, rest, warning = _extract_amount(item_text)
    name = _strip_leading_of(rest).strip()
    if not name:
        return None, f'Could not parse: "{item_text}"'

    return (
        {
            "section": section,
            "name": name,
            "quantity": quantity,
            "unit": unit or "",
            "sort_order": sort_order,
        },
        warning,
    )


def _extract_amount(
    text: str,
) -> tuple[str | None, str | None, str, str | None]:
    """Return (quantity, unit, remainder, warning)."""
    s = text.strip()
    if not s:
        return None, None, s, None

    # Leading unicode fraction: "½ cup milk"
    if s[0] in _UNICODE_FRACTIONS:
        qty = Decimal(_UNICODE_FRACTIONS[s[0]])
        return _finish_after_quantity(qty, s[1:].lstrip(), text)

    # Mixed / plain fractions / decimals: "1 1/2 cups", "1/2 cup", "2 eggs"
    match = _MIXED_NUMBER_RE.match(s)
    if match:
        whole, num, den, rest = match.groups()
        qty = Decimal(whole) + Decimal(num) / Decimal(den)
        return _finish_after_quantity(qty, rest, text)

    match = _FRACTION_RE.match(s)
    if match:
        num, den, rest = match.groups()
        qty = Decimal(num) / Decimal(den)
        return _finish_after_quantity(qty, rest, text)

    match = _DECIMAL_RE.match(s)
    if match:
        num, rest = match.groups()
        qty = Decimal(num)
        return _finish_after_quantity(qty, rest, text)

    # Word number: "two handfuls of blueberries", "a cup of yogurt"
    match = _WORD_NUMBER_RE.match(s)
    if match:
        word, rest = match.groups()
        qty = Decimal(_WORD_NUMBERS[word.lower()])
        return _finish_after_quantity(qty, rest, text)

    # Unit-first with implied 1: "teaspoon of vanilla", "cup greek yogurt"
    unit, rest = _consume_unit(s)
    if unit is not None:
        qty, rest, extra = _apply_and_fraction(Decimal(1), rest)
        warning = (
            f'Approximate amount: "{text}"' if unit in _VAGUE_UNITS else None
        )
        if extra:
            # Shouldn't happen without a prior qty, but keep seam safe.
            pass
        return _decimal_str(qty), unit, rest, warning

    return None, None, s, None


def _finish_after_quantity(
    qty: Decimal,
    rest: str,
    original: str,
) -> tuple[str | None, str | None, str, str | None]:
    unit, rest = _consume_unit(rest)
    qty, rest, _ = _apply_and_fraction(qty, rest)
    warning = None
    if unit in _VAGUE_UNITS:
        warning = f'Approximate amount: "{original}"'
    return _decimal_str(qty), unit, rest, warning


def _apply_and_fraction(qty: Decimal, rest: str) -> tuple[Decimal, str, bool]:
    """Fold 'and a half/quarter/third' into the quantity."""
    match = re.match(
        r"^and\s+(?:a\s+)?(half|quarter|third|⅔|⅓|½|¼)\b\s*(.*)$",
        rest.strip(),
        re.IGNORECASE,
    )
    if not match:
        return qty, rest.strip(), False

    frac_word, after = match.groups()
    qty = qty + _fraction_word_value(frac_word)
    return qty, after.strip(), True


def _fraction_word_value(word: str) -> Decimal:
    key = word.lower()
    mapping = {
        "half": Decimal("0.5"),
        "quarter": Decimal("0.25"),
        "third": Decimal("1") / Decimal("3"),
        "½": Decimal("0.5"),
        "¼": Decimal("0.25"),
        "⅓": Decimal("1") / Decimal("3"),
        "⅔": Decimal("2") / Decimal("3"),
    }
    return mapping.get(key, Decimal("0"))


def _consume_unit(text: str) -> tuple[str | None, str]:
    s = text.strip()
    if not s:
        return None, s
    parts = s.split(None, 1)
    candidate = parts[0].rstrip(".,").lower()
    if candidate in _UNIT_ALIASES:
        rest = parts[1] if len(parts) > 1 else ""
        return _UNIT_ALIASES[candidate], rest
    return None, s


def _strip_leading_of(text: str) -> str:
    match = _OF_RE.match(text.strip())
    return match.group(1) if match else text


def _decimal_str(value: Decimal) -> str:
    quantized = value.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    text = format(quantized, "f")
    if "." in text:
        text = text.rstrip("0").rstrip(".")
    return text or "0"
