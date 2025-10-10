import tkinter as tk
from travel_app import TravelApp

def main():
    root = tk.Tk()
    app = TravelApp(root)
    root.mainloop()

if __name__ == "__main__":
    main()