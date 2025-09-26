# dummy_db.py

# This dictionary simulates our Firestore database.
# The keys are "restaurant_id"s.
# The value is the menu for that restaurant.

DUMMY_MENU_DB = {
    "bobs-bistro-11234": {
        "restaurant_name": "Bob's Bistro",
        "categories": {
            "Appetizers": [
                {
                    "name": "Calamari",
                    "price": 14,
                    "description": "Crispy fried calamari served with a zesty marinara sauce."
                },
                {
                    "name": "Bruschetta",
                    "price": 12,
                    "description": "Toasted bread with fresh tomatoes, garlic,steaks, basil, and olive oil."
                }
            ],
            "Main Courses": [
                {
                    "name": "Steak Frites",
                    "price": 32,
                    "description": "8oz sirloin steak, medium-rare, with a side of crispy french fries."
                },
                {
                    "name": "Mushroom Pasta Steak",
                    "price": 24,
                    "description": "Creamy pasta with a mix of wild mushrooms and parmesan cheese. (Vegetarian)"
                }
            ]
        }
    },
    "marias-trattoria-5678": {
        # We can add another restaurant here later
    }
}