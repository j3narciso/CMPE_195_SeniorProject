import tkinter as tk
from tkinter import ttk
from swipe_interface import SwipeInterface
from data_manager import DataManager
from itinerary_planner import ItineraryPlanner

class TravelApp:
    def __init__(self, root):
        self.root = root
        self.root.title("✈️ TravelGen - AI Itinerary Planner")
        self.root.geometry("1000x700")
        self.root.configure(bg='#1a1a2e')

        # Configure modern styling
        self.setup_styles()

        self.data_manager = DataManager()
        self.selected_country = None
        self.trip_days = None
        self.itinerary = {
            'cities': [],
            'food': [],
            'lodging': []
        }
        self.daily_plan = {}

        self.setup_country_selection()

    def setup_styles(self):
        # Configure ttk styles for modern look
        style = ttk.Style()
        style.theme_use('clam')

    def setup_country_selection(self):
        self.clear_window()

        # Create gradient background
        main_frame = tk.Frame(self.root)
        main_frame.pack(expand=True, fill='both')

        # Create canvas for gradient background
        canvas = tk.Canvas(main_frame, highlightthickness=0)
        canvas.pack(expand=True, fill='both')

        # Create gradient effect
        self.create_gradient(canvas, '#1a1a2e', '#16213e', '#0f4c75')

        # Content frame
        content_frame = tk.Frame(canvas, bg='#1a1a2e')
        content_frame.place(relx=0.5, rely=0.5, anchor='center')

        # Main title with modern styling
        title_label = tk.Label(
            content_frame,
            text="✈️ TravelGen",
            font=('Helvetica', 36, 'bold'),
            fg='#3282b8',
            bg='#1a1a2e'
        )
        title_label.pack(pady=(20, 10))

        subtitle_label = tk.Label(
            content_frame,
            text="AI-Powered Itinerary Planner",
            font=('Helvetica', 16),
            fg='#bbe1fa',
            bg='#1a1a2e'
        )
        subtitle_label.pack(pady=(0, 40))

        # Country selection card
        card_frame = tk.Frame(content_frame, bg='#16213e', relief='flat', bd=0)
        card_frame.pack(pady=20, padx=40, fill='x')

        # Add shadow effect
        shadow_frame = tk.Frame(content_frame, bg='#0a0a1a', height=2)
        shadow_frame.place(in_=card_frame, x=4, y=4, relwidth=1, relheight=1)
        card_frame.lift()

        card_title = tk.Label(
            card_frame,
            text="🌍 Choose Your Destination",
            font=('Helvetica', 18, 'bold'),
            fg='white',
            bg='#16213e'
        )
        card_title.pack(pady=(20, 10))

        self.country_var = tk.StringVar()
        country_dropdown = ttk.Combobox(
            card_frame,
            textvariable=self.country_var,
            values=["🇯🇵 Japan", "🇫🇷 France", "🇺🇸 United States"],
            state="readonly",
            font=('Helvetica', 14),
            width=25
        )
        country_dropdown.pack(pady=20)

        # Trip duration selection
        duration_label = tk.Label(
            card_frame,
            text="📅 Trip Duration (days)",
            font=('Helvetica', 14, 'bold'),
            fg='white',
            bg='#16213e'
        )
        duration_label.pack(pady=(20, 10))

        self.days_var = tk.IntVar(value=7)
        days_frame = tk.Frame(card_frame, bg='#16213e')
        days_frame.pack(pady=10)

        days_scale = ttk.Scale(
            days_frame,
            from_=3,
            to=14,
            orient='horizontal',
            length=300,
            variable=self.days_var
        )
        days_scale.pack(side='left')

        self.days_label = tk.Label(
            days_frame,
            text="7 days",
            font=('Helvetica', 12, 'bold'),
            fg='#3282b8',
            bg='#16213e',
            width=8
        )
        self.days_label.pack(side='left', padx=(10, 0))

        days_scale.configure(command=self.update_days_label)

        continue_button = tk.Button(
            card_frame,
            text="🚀 Start Planning",
            command=self.on_country_selected,
            font=('Helvetica', 14, 'bold'),
            bg='#3282b8',
            fg='white',
            relief='flat',
            bd=0,
            padx=30,
            pady=12,
            cursor='hand2'
        )
        continue_button.pack(pady=(20, 30))

        # Add hover effects
        self.add_button_hover_effects(continue_button, '#3282b8', '#2980b9')

    def create_gradient(self, canvas, color1, color2, color3):
        canvas.update_idletasks()
        width = canvas.winfo_width()
        height = canvas.winfo_height()

        if width > 1 and height > 1:
            # Create gradient rectangles
            for i in range(height):
                if i < height // 2:
                    ratio = i / (height // 2)
                    r1, g1, b1 = self.hex_to_rgb(color1)
                    r2, g2, b2 = self.hex_to_rgb(color2)
                else:
                    ratio = (i - height // 2) / (height // 2)
                    r1, g1, b1 = self.hex_to_rgb(color2)
                    r2, g2, b2 = self.hex_to_rgb(color3)

                r = int(r1 + (r2 - r1) * ratio)
                g = int(g1 + (g2 - g1) * ratio)
                b = int(b1 + (b2 - b1) * ratio)

                color = f'#{r:02x}{g:02x}{b:02x}'
                canvas.create_line(0, i, width, i, fill=color, width=1)

    def hex_to_rgb(self, hex_color):
        hex_color = hex_color.lstrip('#')
        return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

    def add_button_hover_effects(self, button, normal_color, hover_color):
        def on_enter(e):
            button.configure(bg=hover_color)

        def on_leave(e):
            button.configure(bg=normal_color)

        button.bind('<Enter>', on_enter)
        button.bind('<Leave>', on_leave)

    def update_days_label(self, value):
        days = int(float(value))
        self.days_label.config(text=f"{days} days")

    def on_country_selected(self):
        if self.country_var.get():
            country_text = self.country_var.get()
            # Extract country name from emoji format
            self.selected_country = country_text.split(' ', 1)[1] if ' ' in country_text else country_text
            self.trip_days = self.days_var.get()
            self.start_preferences_selection()

    def start_preferences_selection(self):
        self.clear_window()

        main_frame = tk.Frame(self.root, bg='#1a1a2e')
        main_frame.pack(expand=True, fill='both')

        title_label = tk.Label(
            main_frame,
            text=f"🎯 Building your {self.trip_days}-day {self.selected_country} adventure",
            font=('Helvetica', 20, 'bold'),
            fg='#3282b8',
            bg='#1a1a2e'
        )
        title_label.pack(pady=20)

        self.swipe_interface = SwipeInterface(
            main_frame,
            self.data_manager,
            self.selected_country,
            self.trip_days,
            self.on_preferences_complete
        )
        self.swipe_interface.start_city_selection()

    def on_preferences_complete(self, itinerary):
        self.itinerary = itinerary
        # Generate day-by-day plan
        planner = ItineraryPlanner()
        self.daily_plan = planner.create_daily_schedule(
            self.itinerary,
            self.trip_days,
            self.selected_country
        )
        self.show_final_itinerary()

    def show_final_itinerary(self):
        self.clear_window()

        main_frame = tk.Frame(self.root, bg='#1a1a2e')
        main_frame.pack(expand=True, fill='both')

        # Header
        header_frame = tk.Frame(main_frame, bg='#16213e', height=80)
        header_frame.pack(fill='x', pady=(0, 20))
        header_frame.pack_propagate(False)

        title_label = tk.Label(
            header_frame,
            text=f"🗓️ Your {self.trip_days}-Day {self.selected_country} Adventure",
            font=('Helvetica', 24, 'bold'),
            fg='#3282b8',
            bg='#16213e'
        )
        title_label.pack(expand=True)

        # Main content with tabs
        notebook = ttk.Notebook(main_frame)
        notebook.pack(expand=True, fill='both', padx=20, pady=(0, 20))

        # Day-by-day tab
        daily_frame = tk.Frame(notebook, bg='#1a1a2e')
        notebook.add(daily_frame, text='📅 Daily Schedule')

        # Create scrollable area for daily schedule
        canvas = tk.Canvas(daily_frame, bg='#1a1a2e', highlightthickness=0)
        scrollbar = ttk.Scrollbar(daily_frame, orient="vertical", command=canvas.yview)
        scrollable_frame = tk.Frame(canvas, bg='#1a1a2e')

        scrollable_frame.bind(
            "<Configure>",
            lambda e: canvas.configure(scrollregion=canvas.bbox("all"))
        )

        canvas.create_window((0, 0), window=scrollable_frame, anchor="nw")
        canvas.configure(yscrollcommand=scrollbar.set)

        # Display daily schedule
        for day, schedule in self.daily_plan.items():
            day_frame = tk.Frame(scrollable_frame, bg='#16213e', relief='flat', bd=1)
            day_frame.pack(fill='x', padx=10, pady=10)

            day_header = tk.Label(
                day_frame,
                text=f"📍 {day}",
                font=('Helvetica', 18, 'bold'),
                fg='#3282b8',
                bg='#16213e'
            )
            day_header.pack(pady=(15, 10))

            for time_slot, activity in schedule.items():
                activity_frame = tk.Frame(day_frame, bg='#0f4c75', relief='flat')
                activity_frame.pack(fill='x', padx=15, pady=5)

                time_label = tk.Label(
                    activity_frame,
                    text=time_slot,
                    font=('Helvetica', 12, 'bold'),
                    fg='#bbe1fa',
                    bg='#0f4c75',
                    width=15,
                    anchor='w'
                )
                time_label.pack(side='left', padx=(10, 20), pady=10)

                activity_label = tk.Label(
                    activity_frame,
                    text=activity,
                    font=('Helvetica', 12),
                    fg='white',
                    bg='#0f4c75',
                    anchor='w',
                    wraplength=400
                )
                activity_label.pack(side='left', pady=10, fill='x', expand=True)

        canvas.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")

        # Overview tab
        overview_frame = tk.Frame(notebook, bg='#1a1a2e')
        notebook.add(overview_frame, text='📋 Overview')

        overview_canvas = tk.Canvas(overview_frame, bg='#1a1a2e', highlightthickness=0)
        overview_scrollbar = ttk.Scrollbar(overview_frame, orient="vertical", command=overview_canvas.yview)
        overview_scrollable = tk.Frame(overview_canvas, bg='#1a1a2e')

        overview_scrollable.bind(
            "<Configure>",
            lambda e: overview_canvas.configure(scrollregion=overview_canvas.bbox("all"))
        )

        overview_canvas.create_window((0, 0), window=overview_scrollable, anchor="nw")
        overview_canvas.configure(yscrollcommand=overview_scrollbar.set)

        # Category icons
        category_icons = {
            'cities': '🏙️',
            'food': '🍽️',
            'lodging': '🏨'
        }

        for category, items in self.itinerary.items():
            if items:
                category_frame = tk.Frame(overview_scrollable, bg='#16213e', relief='flat')
                category_frame.pack(fill='x', padx=20, pady=15)

                category_header = tk.Label(
                    category_frame,
                    text=f"{category_icons.get(category, '•')} {category.capitalize()}",
                    font=('Helvetica', 16, 'bold'),
                    fg='#3282b8',
                    bg='#16213e'
                )
                category_header.pack(pady=(15, 10))

                for item in items:
                    item_frame = tk.Frame(category_frame, bg='#0f4c75')
                    item_frame.pack(fill='x', padx=15, pady=3)

                    item_label = tk.Label(
                        item_frame,
                        text=f"✓ {item}",
                        font=('Helvetica', 12),
                        fg='white',
                        bg='#0f4c75',
                        anchor='w'
                    )
                    item_label.pack(pady=8, padx=15, fill='x')

        overview_canvas.pack(side="left", fill="both", expand=True)
        overview_scrollbar.pack(side="right", fill="y")

        # Bottom buttons
        button_frame = tk.Frame(main_frame, bg='#1a1a2e')
        button_frame.pack(fill='x', pady=20)

        restart_button = tk.Button(
            button_frame,
            text="🔄 Plan New Trip",
            command=self.setup_country_selection,
            font=('Helvetica', 12, 'bold'),
            bg='#e74c3c',
            fg='white',
            relief='flat',
            bd=0,
            padx=20,
            pady=10,
            cursor='hand2'
        )
        restart_button.pack()

        self.add_button_hover_effects(restart_button, '#e74c3c', '#c0392b')

    def clear_window(self):
        for widget in self.root.winfo_children():
            widget.destroy()