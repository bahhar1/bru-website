"""Brü backend: build a custom can, add it to a cart, check out into a subscription.

Not a real store: no payments, no accounts. A cart is identified by an id the
frontend keeps (for example in localStorage).

Run:  python app.py   then open http://localhost:5000/api/menu
"""

from collections import Counter
from datetime import date, timedelta

import os

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

import pricing
import storage

# The built React site (npm run build) lands in backend/static.
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")

app = Flask(__name__, static_folder=None)
CORS(app)

FREQUENCY_DAYS = {"Weekly": 7, "Biweekly": 14, "Monthly": 30}


def error(message, status=400):
    return jsonify({"error": message}), status


def body():
    return request.get_json(silent=True) or {}


def cart_with_totals(cart):
    """Add prices to every item and a cart total before sending to the frontend."""
    items = []
    total = 0
    for item in cart["items"]:
        pack_price = pricing.plan_price(item["quantity"])
        line_price = pack_price * item["packs"]
        total += line_price
        items.append({**item,
                      "plan_name": pricing.PLANS[item["quantity"]]["name"],
                      "can_price_cents": pricing.per_can(item["quantity"]),
                      "pack_price_cents": pack_price,
                      "line_price_cents": line_price})
    return {**cart, "items": items, "total_cents": total,
            "can_count": sum(i["quantity"] * i["packs"] for i in cart["items"])}


def load_cart(cart_id):
    cart = storage.get("carts", cart_id)
    if cart is None:
        return None, error("Cart not found", 404)
    return cart, None


# ---------- Menu ----------


@app.get("/api/menu")
def get_menu():
    return jsonify(pricing.menu())


@app.post("/api/price")
def preview_price():
    """Price for a plan (every recipe costs the same; the plan size sets the price)."""
    quantity = body().get("quantity", 24)
    problem = pricing.validate_quantity(quantity)
    if problem:
        return error(problem)
    return jsonify({"can_price_cents": pricing.per_can(quantity),
                    "pack_price_cents": pricing.plan_price(quantity)})


# ---------- Cart ----------

@app.post("/api/cart")
def create_cart():
    cart = storage.insert("carts", {"items": []})
    return jsonify(cart_with_totals(cart)), 201


@app.get("/api/cart/<cart_id>")
def get_cart(cart_id):
    cart, err = load_cart(cart_id)
    if err:
        return err
    return jsonify(cart_with_totals(cart))


@app.post("/api/cart/<cart_id>/items")
def add_item(cart_id):
    cart, err = load_cart(cart_id)
    if err:
        return err
    data = body()
    recipe = {field: data.get("recipe", {}).get(field) for field in pricing.RECIPE_FIELDS}
    quantity = data.get("quantity")
    name, name_problem = pricing.clean_name(data.get("name_on_can"))
    problem = pricing.validate_recipe(recipe) or pricing.validate_quantity(quantity) or name_problem
    if problem:
        return error(problem)

    # Same recipe, plan and name already in the cart? Bump the count instead of duplicating.
    for item in cart["items"]:
        if (item["recipe"] == recipe and item["quantity"] == quantity
                and item.get("name_on_can", "") == name):
            item["packs"] += 1
            break
    else:
        cart["items"].append({"id": storage.new_id(), "recipe": recipe,
                              "quantity": quantity, "name_on_can": name, "packs": 1})
    storage.replace("carts", cart)
    return jsonify(cart_with_totals(cart)), 201


@app.patch("/api/cart/<cart_id>/items/<item_id>")
def update_item(cart_id, item_id):
    """Change an item's recipe, pack size, or number of packs."""
    cart, err = load_cart(cart_id)
    if err:
        return err
    item = next((i for i in cart["items"] if i["id"] == item_id), None)
    if item is None:
        return error("Item not found", 404)

    data = body()
    if "recipe" in data:
        recipe = {field: data["recipe"].get(field, item["recipe"][field])
                  for field in pricing.RECIPE_FIELDS}
        problem = pricing.validate_recipe(recipe)
        if problem:
            return error(problem)
        item["recipe"] = recipe
    if "name_on_can" in data:
        name, problem = pricing.clean_name(data["name_on_can"])
        if problem:
            return error(problem)
        item["name_on_can"] = name
    if "quantity" in data:
        problem = pricing.validate_quantity(data["quantity"])
        if problem:
            return error(problem)
        item["quantity"] = data["quantity"]
    if "packs" in data:
        if not isinstance(data["packs"], int) or data["packs"] < 0:
            return error("packs must be a whole number, 0 or more")
        item["packs"] = data["packs"]
        if item["packs"] == 0:
            cart["items"].remove(item)

    storage.replace("carts", cart)
    return jsonify(cart_with_totals(cart))


@app.delete("/api/cart/<cart_id>/items/<item_id>")
def remove_item(cart_id, item_id):
    cart, err = load_cart(cart_id)
    if err:
        return err
    before = len(cart["items"])
    cart["items"] = [i for i in cart["items"] if i["id"] != item_id]
    if len(cart["items"]) == before:
        return error("Item not found", 404)
    storage.replace("carts", cart)
    return jsonify(cart_with_totals(cart))



# ---------- Checkout & subscriptions ----------

@app.post("/api/cart/<cart_id>/checkout")
def checkout(cart_id):
    """Turn the cart into a subscription. No payment is taken."""
    cart, err = load_cart(cart_id)
    if err:
        return err
    if not cart["items"]:
        return error("Your cart is empty")

    data = body()
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip()
    frequency = data.get("frequency")
    if not name:
        return error("Please enter your name")
    if "@" not in email:
        return error("Please enter a valid email")
    if frequency not in pricing.OPTIONS["frequency"]:
        return error(f"Invalid frequency. Choose one of: {', '.join(pricing.OPTIONS['frequency'])}")

    priced = cart_with_totals(cart)
    sub = storage.insert("subscriptions", {
        "name": name,
        "email": email,
        "frequency": frequency,
        "items": priced["items"],
        "total_per_delivery_cents": priced["total_cents"],
        "status": "active",
        "next_delivery": (date.today() + timedelta(days=3)).isoformat(),
        "created": date.today().isoformat(),
    })

    cart["items"] = []  # empty the cart after checkout
    storage.replace("carts", cart)
    return jsonify(sub), 201



@app.get("/api/subscriptions/<sub_id>")
def get_subscription(sub_id):
    sub = storage.get("subscriptions", sub_id)
    if sub is None:
        return error("Subscription not found", 404)
    return jsonify(sub)


@app.post("/api/subscriptions/<sub_id>/<action>")
def change_subscription(sub_id, action):
    """Pause, resume, skip the next delivery, or cancel."""
    sub = storage.get("subscriptions", sub_id)
    if sub is None:
        return error("Subscription not found", 404)
    if sub["status"] == "cancelled":
        return error("This subscription is cancelled")

    step = timedelta(days=FREQUENCY_DAYS[sub["frequency"]])
    if action == "pause":
        sub["status"] = "paused"
    elif action == "resume":
        sub["status"] = "active"
        sub["next_delivery"] = max(date.fromisoformat(sub["next_delivery"]),
                                   date.today() + timedelta(days=3)).isoformat()
    elif action == "skip":
        if sub["status"] != "active":
            return error("Only active subscriptions can skip a delivery")
        sub["next_delivery"] = (date.fromisoformat(sub["next_delivery"]) + step).isoformat()
    elif action == "cancel":
        sub["status"] = "cancelled"
    else:
        return error("Unknown action. Use pause, resume, skip, or cancel.", 404)

    storage.replace("subscriptions", sub)
    return jsonify(sub)


# ---------- Demo stats (the "every order gives us data" slide) ----------

@app.get("/api/stats")
def stats():
    subs = [s for s in storage.find_all("subscriptions") if s["status"] != "cancelled"]
    combos = Counter()
    by_field = {field: Counter() for field in pricing.RECIPE_FIELDS}
    cans = 0
    for sub in subs:
        for item in sub["items"]:
            count = item["quantity"] * item.get("packs", 1)
            cans += count
            r = item["recipe"]
            combos[f'{r["base"]} / {r["milk"]} / {r["sweetness"]} / {r["flavor"]}'] += count
            for field in pricing.RECIPE_FIELDS:
                by_field[field][r[field]] += count
    return jsonify({
        "active_subscriptions": len(subs),
        "cans_per_cycle": cans,
        "top_combinations": combos.most_common(5),
        "popularity": {f: dict(c.most_common()) for f, c in by_field.items()},
    })


# ---------- Website ----------

@app.get("/")
@app.get("/<path:path>")
def website(path=""):
    """Serve the React site. Unknown paths (like /build or /cart) get index.html
    so React Router can handle them."""
    if path.startswith("api/"):
        return error("Not found", 404)
    if not os.path.exists(os.path.join(STATIC_DIR, "index.html")):
        return jsonify({"message": "Brü API is running. Build the frontend to serve the site here.",
                        "try": "/api/menu"})
    if path and os.path.isfile(os.path.join(STATIC_DIR, path)):
        return send_from_directory(STATIC_DIR, path)
    return send_from_directory(STATIC_DIR, "index.html")


if __name__ == "__main__":
    app.run(debug=True, port=int(os.environ.get("PORT", 5000)))