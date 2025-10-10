class DataManager:
    def __init__(self):
        self.travel_data = {
            'Japan': {
                'cities': [
                    {'name': 'Tokyo', 'description': 'Bustling capital with modern skyscrapers and traditional temples'},
                    {'name': 'Kyoto', 'description': 'Ancient capital famous for temples, gardens, and geishas'},
                    {'name': 'Osaka', 'description': 'Known for street food, nightlife, and Osaka Castle'},
                    {'name': 'Hiroshima', 'description': 'Historic city with Peace Memorial Park and nearby Miyajima Island'},
                    {'name': 'Nara', 'description': 'First permanent capital, famous for deer park and Todaiji Temple'}
                ],
                'food': [
                    {'name': 'Sushi', 'description': 'Fresh raw fish over seasoned rice - a Japanese classic'},
                    {'name': 'Ramen', 'description': 'Hearty noodle soup with various broths and toppings'},
                    {'name': 'Tempura', 'description': 'Lightly battered and fried vegetables and seafood'},
                    {'name': 'Yakitori', 'description': 'Grilled chicken skewers with savory sauce'},
                    {'name': 'Takoyaki', 'description': 'Octopus balls - a popular Osaka street food'},
                    {'name': 'Kaiseki', 'description': 'Traditional multi-course dinner showcasing seasonal ingredients'}
                ],
                'lodging': [
                    {'name': 'Ryokan', 'description': 'Traditional Japanese inn with tatami mats and futon beds'},
                    {'name': 'Business Hotel', 'description': 'Compact, efficient hotels perfect for solo travelers'},
                    {'name': 'Capsule Hotel', 'description': 'Ultra-modern pod-style accommodation in city centers'},
                    {'name': 'Luxury Resort', 'description': 'High-end hotels with hot springs and mountain views'},
                    {'name': 'Hostel', 'description': 'Budget-friendly shared accommodation for backpackers'}
                ]
            },
            'France': {
                'cities': [
                    {'name': 'Paris', 'description': 'City of Light with iconic landmarks like Eiffel Tower and Louvre'},
                    {'name': 'Lyon', 'description': 'Gastronomic capital with Renaissance architecture'},
                    {'name': 'Nice', 'description': 'Glamorous Mediterranean resort city on the French Riviera'},
                    {'name': 'Bordeaux', 'description': 'World-famous wine region with elegant 18th-century architecture'},
                    {'name': 'Strasbourg', 'description': 'European capital with German influences and stunning cathedral'}
                ],
                'food': [
                    {'name': 'Croissants', 'description': 'Buttery, flaky pastries perfect for breakfast'},
                    {'name': 'Coq au Vin', 'description': 'Chicken braised in wine with mushrooms and onions'},
                    {'name': 'Bouillabaisse', 'description': 'Traditional Provençal fish stew from Marseille'},
                    {'name': 'Escargot', 'description': 'Snails cooked in garlic, butter, and herbs'},
                    {'name': 'Crème Brûlée', 'description': 'Rich custard dessert with caramelized sugar top'},
                    {'name': 'French Cheese', 'description': 'From Camembert to Roquefort - endless variety to explore'}
                ],
                'lodging': [
                    {'name': 'Château Hotel', 'description': 'Stay in a real castle with luxurious amenities'},
                    {'name': 'Boutique Hotel', 'description': 'Stylish, intimate hotels in city centers'},
                    {'name': 'Countryside B&B', 'description': 'Charming bed & breakfasts in rural villages'},
                    {'name': 'Paris Apartment', 'description': 'Authentic Parisian living in a local neighborhood'},
                    {'name': 'Hostel', 'description': 'Budget accommodation in major cities'}
                ]
            },
            'United States': {
                'cities': [
                    {'name': 'New York City', 'description': 'The Big Apple - iconic skyline, Broadway, and Central Park'},
                    {'name': 'Los Angeles', 'description': 'City of Angels with Hollywood glamour and beautiful beaches'},
                    {'name': 'San Francisco', 'description': 'Golden Gate Bridge, steep hills, and vibrant neighborhoods'},
                    {'name': 'Las Vegas', 'description': 'Entertainment capital with casinos, shows, and nightlife'},
                    {'name': 'Miami', 'description': 'Art Deco architecture, pristine beaches, and Latin culture'}
                ],
                'food': [
                    {'name': 'BBQ', 'description': 'Slow-cooked meats with regional sauce variations'},
                    {'name': 'Burgers', 'description': 'All-American classic with endless topping combinations'},
                    {'name': 'Pizza', 'description': 'From New York thin crust to Chicago deep dish'},
                    {'name': 'Tacos', 'description': 'Mexican-American fusion with fresh ingredients'},
                    {'name': 'Apple Pie', 'description': 'Classic American dessert with flaky crust'},
                    {'name': 'Clam Chowder', 'description': 'Creamy soup popular in New England coastal areas'}
                ],
                'lodging': [
                    {'name': 'Luxury Resort', 'description': 'High-end hotels with spas, pools, and concierge services'},
                    {'name': 'Chain Hotel', 'description': 'Reliable, standardized accommodation across the country'},
                    {'name': 'Boutique Hotel', 'description': 'Unique, design-focused hotels in trendy neighborhoods'},
                    {'name': 'Motel', 'description': 'Budget-friendly roadside accommodation perfect for road trips'},
                    {'name': 'Airbnb', 'description': 'Stay in local homes for an authentic experience'}
                ]
            }
        }

    def get_cities(self, country):
        return self.travel_data.get(country, {}).get('cities', [])

    def get_food_options(self, country):
        return self.travel_data.get(country, {}).get('food', [])

    def get_lodging_options(self, country):
        return self.travel_data.get(country, {}).get('lodging', [])