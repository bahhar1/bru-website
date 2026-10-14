"""Tiny JSON-file "database" that stands in for MongoDB.

Each top-level key in data.json works like a Mongo collection:
    {"carts": {...}, "subscriptions": {...}}
Documents are stored by id. When you move to MongoDB, rewrite only the
functions in this file (same names, same return values) using pymongo.
"""

import json
import os
import threading
import uuid
from copy import deepcopy

DB_FILE = os.path.join(os.path.dirname(__file__), "data.json")
COLLECTIONS = ["carts", "subscriptions"]
_lock = threading.Lock()  # Flask's dev server can handle requests in parallel


def _load():
    if not os.path.exists(DB_FILE):
        return {name: {} for name in COLLECTIONS}
    with open(DB_FILE) as f:
        data = json.load(f)
    for name in COLLECTIONS:
        data.setdefault(name, {})
    return data


def _save(data):
    with open(DB_FILE, "w") as f:
        json.dump(data, f, indent=2)


def new_id():
    return uuid.uuid4().hex[:12]


def insert(collection, doc):
    with _lock:
        data = _load()
        doc = deepcopy(doc)
        doc.setdefault("id", new_id())
        data[collection][doc["id"]] = doc
        _save(data)
        return doc


def get(collection, doc_id):
    return _load()[collection].get(doc_id)


def replace(collection, doc):
    with _lock:
        data = _load()
        data[collection][doc["id"]] = deepcopy(doc)
        _save(data)
        return doc


def find_all(collection):
    return list(_load()[collection].values())
