"""Menu options and plans for Brü, matching the pitch deck (slides 7-9).

All money is stored in cents (integers) to avoid floating-point rounding errors.
Change the numbers here to adjust the menu or prices; nothing else needs to change.
"""

OPTIONS = {
    "base": ["Cold brew", "Espresso"],
    "milk": ["Dairy", "Oat", "Almond", "None"],
    "sweetness": ["Unsweetened", "Light", "Regular", "Extra"],
    "flavor": ["Vanilla", "Caramel", "Mocha", "Hazelnut", "Unflavored"],
    "frequency": ["Weekly", "Biweekly", "Monthly"],
}

# Plans from slide 9: "The 12", "The 24" (most popular), "The 36"
PLANS = {
    12: {"name": "The 12", "price_cents": 4200, "popular": False},
    24: {"name": "The 24", "price_cents": 7800, "popular": True},
    36: {"name": "The 36", "price_cents": 10800, "popular": False},
}
QUANTITIES = list(PLANS)

CAFE_LATTE_CENTS = 560  # "Up to 46% less than a daily $5.60 café latte"
NAME_ON_CAN_MAX = 14    # "One can with your name on it"

RECIPE_FIELDS = ["base", "milk", "sweetness", "flavor"]


def validate_recipe(recipe):
    """Return an error message, or None if the recipe is valid."""
    for field in RECIPE_FIELDS:
        if recipe.get(field) not in OPTIONS[field]:
            return f"Invalid {field}. Choose one of: {', '.join(OPTIONS[field])}"
    return None


def validate_quantity(quantity):
    if quantity not in PLANS:
        return f"Invalid plan. Choose one of: {QUANTITIES} cans"
    return None


def clean_name(name):
    """Name printed on the can: optional, trimmed, max NAME_ON_CAN_MAX characters."""
    name = (name or "").strip()
    if len(name) > NAME_ON_CAN_MAX:
        return None, f"Name on can must be {NAME_ON_CAN_MAX} characters or fewer"
    return name, None


def plan_price(quantity):
    """Price of one pack (plan) in cents."""
    return PLANS[quantity]["price_cents"]


def per_can(quantity):
    """Price per can in cents for a plan."""
    return round(plan_price(quantity) / quantity)


def menu():
    """Everything the frontend needs to draw the 'Build your Brü' page."""
    return {
        "options": OPTIONS,
        "plans": [
            {"cans": q, **p, "per_can_cents": per_can(q),
             "savings_vs_cafe_percent": round(100 * (1 - per_can(q) / CAFE_LATTE_CENTS))}
            for q, p in PLANS.items()
        ],
        "name_on_can_max": NAME_ON_CAN_MAX,
    }
