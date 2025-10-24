import tkinter as tk
from tkinter import ttk

class SwipeInterface:
    def __init__(self, parent, data_manager, country, trip_days, completion_callback):
        self.parent = parent
        self.data_manager = data_manager
        self.country = country
        self.trip_days = trip_days
        self.completion_callback = completion_callback

        self.current_category = None
        self.current_items = []
        self.current_index = 0
        self.selected_items = {
            'cities': [],
            'food': [],
            'lodging': []
        }

        self.setup_interface()

    def setup_interface(self):
        # Main card frame with modern styling
        self.card_frame = tk.Frame(self.parent, bg='#16213e', relief='flat', bd=0)
        self.card_frame.pack(expand=True, fill='both', padx=50, pady=30)

        # Header section
        header_frame = tk.Frame(self.card_frame, bg='#16213e')
        header_frame.pack(fill='x', pady=(20, 0))

        self.category_label = tk.Label(
            header_frame,
            text="",
            font=('Helvetica', 20, 'bold'),
            fg='#3282b8',
            bg='#16213e'
        )
        self.category_label.pack(pady=(10, 5))

        self.progress_label = tk.Label(
            header_frame,
            text="",
            font=('Helvetica', 14),
            fg='#bbe1fa',
            bg='#16213e'
        )
        self.progress_label.pack(pady=(0, 20))

        # Card content with shadow effect
        self.card_content = tk.Frame(self.card_frame, bg='#0f4c75', relief='flat', bd=2)
        self.card_content.pack(expand=True, fill='both', padx=20, pady=20)

        # Item content
        content_frame = tk.Frame(self.card_content, bg='#0f4c75')
        content_frame.pack(expand=True, fill='both', padx=40, pady=40)

        self.item_title = tk.Label(
            content_frame,
            text="",
            font=('Helvetica', 24, 'bold'),
            fg='white',
            bg='#0f4c75',
            wraplength=500,
            justify='center'
        )
        self.item_title.pack(expand=True, pady=(20, 10))

        self.item_description = tk.Label(
            content_frame,
            text="",
            font=('Helvetica', 14),
            fg='#bbe1fa',
            bg='#0f4c75',
            wraplength=500,
            justify='center'
        )
        self.item_description.pack(expand=True, pady=(10, 20))

        # Button frame
        button_frame = tk.Frame(self.card_frame, bg='#16213e')
        button_frame.pack(pady=(0, 30))

        # Pass button
        self.reject_button = tk.Button(
            button_frame,
            text="👎 Pass",
            command=self.reject_item,
            font=('Helvetica', 16, 'bold'),
            bg='#e74c3c',
            fg='white',
            relief='flat',
            bd=0,
            padx=40,
            pady=15,
            cursor='hand2',
            width=12
        )
        self.reject_button.pack(side='left', padx=(0, 30))

        # Accept button
        self.accept_button = tk.Button(
            button_frame,
            text="👍 Add to Trip",
            command=self.accept_item,
            font=('Helvetica', 16, 'bold'),
            bg='#27ae60',
            fg='white',
            relief='flat',
            bd=0,
            padx=40,
            pady=15,
            cursor='hand2',
            width=12
        )
        self.accept_button.pack(side='right', padx=(30, 0))

        # Add hover effects
        self.add_button_hover_effects(self.reject_button, '#e74c3c', '#c0392b')
        self.add_button_hover_effects(self.accept_button, '#27ae60', '#219a52')

        # Keyboard instructions
        instructions_frame = tk.Frame(self.card_frame, bg='#16213e')
        instructions_frame.pack(pady=(0, 20))

        instructions_label = tk.Label(
            instructions_frame,
            text="🎮 Use ← → arrow keys or A/D keys to swipe",
            font=('Helvetica', 12),
            fg='#7f8c8d',
            bg='#16213e'
        )
        instructions_label.pack()

        self.bind_keys()

    def add_button_hover_effects(self, button, normal_color, hover_color):
        def on_enter(e):
            button.configure(bg=hover_color)

        def on_leave(e):
            button.configure(bg=normal_color)

        button.bind('<Enter>', on_enter)
        button.bind('<Leave>', on_leave)

    def bind_keys(self):
        self.parent.focus_set()
        self.parent.bind('<Left>', lambda e: self.reject_item())
        self.parent.bind('<Right>', lambda e: self.accept_item())
        self.parent.bind('<Key-a>', lambda e: self.reject_item())
        self.parent.bind('<Key-d>', lambda e: self.accept_item())
        self.parent.bind('<Key-A>', lambda e: self.reject_item())
        self.parent.bind('<Key-D>', lambda e: self.accept_item())

    def start_city_selection(self):
        self.current_category = 'cities'
        self.current_items = self.data_manager.get_cities(self.country)
        self.current_index = 0
        self.show_current_item()

    def start_food_selection(self):
        self.current_category = 'food'
        self.current_items = self.data_manager.get_food_options(self.country)
        self.current_index = 0
        self.show_current_item()

    def start_lodging_selection(self):
        self.current_category = 'lodging'
        self.current_items = self.data_manager.get_lodging_options(self.country)
        self.current_index = 0
        self.show_current_item()

    def show_current_item(self):
        if self.current_index >= len(self.current_items):
            self.move_to_next_category()
            return

        item = self.current_items[self.current_index]

        # Category icons
        category_icons = {
            'cities': '🏙️',
            'food': '🍽️',
            'lodging': '🏨'
        }

        icon = category_icons.get(self.current_category, '📍')
        category_text = f"{icon} Select {self.current_category.capitalize()}"

        self.category_label.config(text=category_text)
        self.progress_label.config(
            text=f"Card {self.current_index + 1} of {len(self.current_items)} • {len(self.selected_items[self.current_category])} selected"
        )

        self.item_title.config(text=item['name'])
        self.item_description.config(text=item['description'])

        # Add swipe animation effect
        self.animate_card_entrance()

    def animate_card_entrance(self):
        """Simple animation effect for card entrance."""
        self.card_content.configure(bg='#1a5490')
        self.parent.after(100, lambda: self.card_content.configure(bg='#0f4c75'))

    def accept_item(self):
        if self.current_index < len(self.current_items):
            item = self.current_items[self.current_index]
            self.selected_items[self.current_category].append(item['name'])

            # Visual feedback for acceptance
            self.card_content.configure(bg='#27ae60')
            self.parent.after(150, self.next_item)
        else:
            self.next_item()

    def reject_item(self):
        # Visual feedback for rejection
        self.card_content.configure(bg='#e74c3c')
        self.parent.after(150, self.next_item)

    def next_item(self):
        self.current_index += 1
        self.show_current_item()

    def move_to_next_category(self):
        if self.current_category == 'cities':
            # Check if user selected enough cities for the trip
            if len(self.selected_items['cities']) == 0:
                self.show_selection_warning('cities')
                return
            self.start_food_selection()
        elif self.current_category == 'food':
            # Check if user selected some food options
            if len(self.selected_items['food']) == 0:
                self.show_selection_warning('food')
                return
            self.start_lodging_selection()
        else:
            # Check if user selected lodging
            if len(self.selected_items['lodging']) == 0:
                self.show_selection_warning('lodging')
                return
            self.completion_callback(self.selected_items)

    def show_selection_warning(self, category):
        """Show warning if no items selected in a category."""
        # Create warning popup
        warning_frame = tk.Frame(self.card_content, bg='#f39c12', relief='flat')
        warning_frame.place(relx=0.5, rely=0.5, anchor='center', relwidth=0.8, relheight=0.6)

        warning_label = tk.Label(
            warning_frame,
            text=f"⚠️ No {category} selected!\nSelect at least one item to continue your {self.trip_days}-day trip.",
            font=('Helvetica', 16, 'bold'),
            fg='white',
            bg='#f39c12',
            justify='center'
        )
        warning_label.pack(expand=True)

        retry_button = tk.Button(
            warning_frame,
            text="Try Again",
            command=lambda: self.hide_warning(warning_frame),
            font=('Helvetica', 12, 'bold'),
            bg='white',
            fg='#f39c12',
            relief='flat',
            bd=0,
            padx=20,
            pady=8
        )
        retry_button.pack(pady=(0, 20))

    def hide_warning(self, warning_frame):
        """Hide warning and reset to beginning of current category."""
        warning_frame.destroy()
        self.current_index = 0
        self.show_current_item()