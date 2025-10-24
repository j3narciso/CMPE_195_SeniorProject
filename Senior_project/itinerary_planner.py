import random
from datetime import datetime, timedelta

class ItineraryPlanner:
    def __init__(self):
        self.time_slots = [
            "9:00 AM", "10:30 AM", "12:00 PM", "1:30 PM",
            "3:00 PM", "4:30 PM", "6:00 PM", "7:30 PM"
        ]

        # Activity templates for different times of day
        self.morning_activities = ["Visit", "Explore", "Tour", "Walk through"]
        self.afternoon_activities = ["Discover", "Experience", "Visit", "Enjoy"]
        self.evening_activities = ["Dine at", "Experience", "Enjoy dinner at", "Have dinner at"]

        # Lodging templates
        self.lodging_activities = [
            "Check into", "Stay at", "Rest at", "Overnight at"
        ]

    def create_daily_schedule(self, itinerary, num_days, country):
        """Create a detailed day-by-day schedule based on selected preferences."""
        daily_plan = {}

        cities = itinerary.get('cities', [])
        food_options = itinerary.get('food', [])
        lodging_options = itinerary.get('lodging', [])

        # Distribute activities across days
        for day in range(1, num_days + 1):
            day_name = f"Day {day}"
            daily_plan[day_name] = self.generate_daily_activities(
                cities, food_options, lodging_options, day, num_days, country
            )

        return daily_plan

    def generate_daily_activities(self, cities, food_options, lodging_options, current_day, total_days, country):
        """Generate activities for a specific day."""
        schedule = {}

        # Select primary city for the day
        if cities:
            if current_day <= len(cities):
                primary_city = cities[current_day - 1]
            else:
                primary_city = random.choice(cities)
        else:
            primary_city = self.get_default_city(country)

        # Morning activity (9:00 AM)
        morning_activity = f"{random.choice(self.morning_activities)} {primary_city}"
        if country == "Japan":
            morning_activity += " - Start with traditional morning rituals"
        elif country == "France":
            morning_activity += " - Begin with a café and croissant"
        elif country == "United States":
            morning_activity += " - Start with a classic American breakfast"

        schedule["9:00 AM"] = morning_activity

        # Mid-morning activity (10:30 AM)
        schedule["10:30 AM"] = self.get_cultural_activity(country, primary_city)

        # Lunch (12:00 PM)
        if food_options:
            lunch_food = random.choice(food_options)
            schedule["12:00 PM"] = f"Lunch: Try {lunch_food} at a local restaurant"
        else:
            schedule["12:00 PM"] = f"Lunch: Experience local cuisine in {primary_city}"

        # Afternoon activity (1:30 PM)
        schedule["1:30 PM"] = self.get_afternoon_activity(country, primary_city)

        # Late afternoon (3:00 PM)
        schedule["3:00 PM"] = self.get_exploration_activity(country, primary_city)

        # Early evening (4:30 PM)
        schedule["4:30 PM"] = self.get_leisure_activity(country, primary_city)

        # Dinner (6:00 PM)
        if food_options:
            dinner_food = random.choice([f for f in food_options if f != schedule.get("12:00 PM", "").split("Try ")[-1].split(" at")[0]])
            schedule["6:00 PM"] = f"Dinner: {random.choice(self.evening_activities)} {dinner_food}"
        else:
            schedule["6:00 PM"] = f"Dinner: Fine dining experience in {primary_city}"

        # Evening activity (7:30 PM)
        if lodging_options and (current_day == total_days or current_day % 2 == 0):
            lodging = random.choice(lodging_options)
            schedule["7:30 PM"] = f"{random.choice(self.lodging_activities)} {lodging}"
        else:
            schedule["7:30 PM"] = self.get_evening_activity(country, primary_city)

        return schedule

    def get_default_city(self, country):
        """Get default city if none selected."""
        defaults = {
            "Japan": "Tokyo",
            "France": "Paris",
            "United States": "New York City"
        }
        return defaults.get(country, "City Center")

    def get_cultural_activity(self, country, city):
        """Get culture-specific morning activities."""
        activities = {
            "Japan": [
                f"Visit traditional temples in {city}",
                f"Explore historic districts of {city}",
                f"Experience tea ceremony in {city}",
                f"Visit local shrines in {city}"
            ],
            "France": [
                f"Tour museums and galleries in {city}",
                f"Explore historic architecture in {city}",
                f"Visit local markets in {city}",
                f"Stroll through parks and gardens in {city}"
            ],
            "United States": [
                f"Visit iconic landmarks in {city}",
                f"Explore downtown area of {city}",
                f"Tour local attractions in {city}",
                f"Experience cultural sites in {city}"
            ]
        }
        return random.choice(activities.get(country, [f"Explore {city}"]))

    def get_afternoon_activity(self, country, city):
        """Get afternoon activities."""
        activities = {
            "Japan": [
                f"Shopping in modern districts of {city}",
                f"Visit traditional gardens in {city}",
                f"Explore technology centers in {city}",
                f"Experience local crafts in {city}"
            ],
            "France": [
                f"Wine tasting experience in {city}",
                f"Boutique shopping in {city}",
                f"Visit local châteaux near {city}",
                f"Explore art districts in {city}"
            ],
            "United States": [
                f"Visit entertainment districts in {city}",
                f"Explore neighborhoods of {city}",
                f"Shopping and leisure in {city}",
                f"Experience local culture in {city}"
            ]
        }
        return random.choice(activities.get(country, [f"Explore {city}"]))

    def get_exploration_activity(self, country, city):
        """Get exploration activities."""
        activities = {
            "Japan": [
                f"Discover hidden gems in {city}",
                f"Experience local train culture in {city}",
                f"Visit observation decks in {city}",
                f"Explore traditional neighborhoods in {city}"
            ],
            "France": [
                f"Riverside walks in {city}",
                f"Explore village squares in {city}",
                f"Visit local artisan shops in {city}",
                f"Experience café culture in {city}"
            ],
            "United States": [
                f"Visit scenic viewpoints in {city}",
                f"Explore waterfront areas in {city}",
                f"Experience local music scene in {city}",
                f"Visit parks and recreation areas in {city}"
            ]
        }
        return random.choice(activities.get(country, [f"Explore {city}"]))

    def get_leisure_activity(self, country, city):
        """Get leisure activities."""
        activities = {
            "Japan": [
                f"Relax at onsen (hot springs) near {city}",
                f"Experience traditional baths in {city}",
                f"Peaceful moments in zen gardens of {city}",
                f"Meditation time in {city}"
            ],
            "France": [
                f"Aperitif time at cafés in {city}",
                f"Leisurely stroll through {city}",
                f"Sunset viewing in {city}",
                f"Relax at local terraces in {city}"
            ],
            "United States": [
                f"Happy hour in {city}",
                f"Relax at local lounges in {city}",
                f"Scenic drives around {city}",
                f"Sunset watching in {city}"
            ]
        }
        return random.choice(activities.get(country, [f"Leisure time in {city}"]))

    def get_evening_activity(self, country, city):
        """Get evening activities."""
        activities = {
            "Japan": [
                f"Experience nightlife in {city}",
                f"Evening illuminations tour in {city}",
                f"Traditional entertainment in {city}",
                f"Night markets exploration in {city}"
            ],
            "France": [
                f"Evening river cruise in {city}",
                f"Theater or opera in {city}",
                f"Night walking tour of {city}",
                f"Evening wine tasting in {city}"
            ],
            "United States": [
                f"Live music venues in {city}",
                f"Evening entertainment in {city}",
                f"Night tours of {city}",
                f"Local nightlife experience in {city}"
            ]
        }
        return random.choice(activities.get(country, [f"Evening activities in {city}"]))