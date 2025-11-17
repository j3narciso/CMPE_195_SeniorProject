# TravelGen Setup Guide

Complete setup instructions for running TravelGen with Google Places API integration.

## Project Structure

```
CMPE_195_SeniorProject/
├── trava-frontend/          # React frontend application
│   ├── src/
│   │   ├── components/      # UI components (swipe screens)
│   │   ├── pages/           # Page components (routing)
│   │   ├── context/         # React context (state management)
│   │   └── services/        # API service layer
│   ├── .env                 # Frontend environment variables
│   └── package.json
│
└── trava-api/               # Node.js/Express backend API
    ├── src/
    │   ├── server.js        # Express server entry point
    │   ├── routes/          # API route handlers
    │   └── services/        # Google Places integration
    ├── .env                 # Backend environment variables
    └── package.json
```

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Google Cloud Console account
- Git

## Step 1: Get Google Places API Key

### 1.1 Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: `TravelGen` (or your preferred name)
4. Click "Create"

### 1.2 Enable Required APIs

1. In the Cloud Console, navigate to "APIs & Services" → "Library"
2. Search for and enable the following APIs:
   - **Places API** (for searching hotels, restaurants, activities)
   - **Geocoding API** (for converting location names to coordinates)

### 1.3 Create API Key

1. Navigate to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "API Key"
3. Copy the generated API key
4. **IMPORTANT**: Click "Restrict Key" to secure it:
   - Under "API restrictions", select "Restrict key"
   - Choose "Places API" and "Geocoding API"
   - Save

### 1.4 Billing Setup

Google Places API requires a billing account:
- You get $200 free credit per month
- Places API: ~$17 per 1,000 requests
- Geocoding API: ~$5 per 1,000 requests
- For development, the free tier is more than enough

## Step 2: Backend Setup

### 2.1 Install Dependencies

```bash
cd trava-api
npm install
```

### 2.2 Configure Environment Variables

The `.env` file already exists. Open it and add your Google Places API key:

```bash
# Edit trava-api/.env
GOOGLE_PLACES_API_KEY=your_actual_api_key_here
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**Replace `your_actual_api_key_here` with the API key you copied from Google Cloud Console.**

### 2.3 Start the Backend Server

```bash
# In trava-api directory
npm run dev
```

You should see:
```
🚀 TravelGen API Server started
📍 Environment: development
🌐 Server running on: http://localhost:5000
✅ Health check: http://localhost:5000/api/health
```

### 2.4 Test the Backend

Open another terminal and test:

```bash
# Health check
curl http://localhost:5000/api/health

# Test hotels endpoint (example with Tokyo)
curl "http://localhost:5000/api/places/hotels?destination=Tokyo,Japan&limit=5"

# Test restaurants
curl "http://localhost:5000/api/places/restaurants?destination=Paris,France&limit=5"

# Test activities
curl "http://localhost:5000/api/places/activities?destination=New%20York,USA&limit=5"
```

## Step 3: Frontend Setup

### 3.1 Install Dependencies

```bash
cd trava-frontend
npm install
```

### 3.2 Verify Environment Variables

The `.env` file is already configured:

```bash
# trava-frontend/.env
VITE_API_URL=http://localhost:5000/api
```

No changes needed unless you changed the backend port.

### 3.3 Start the Frontend

```bash
# In trava-frontend directory
npm run dev
```

You should see:
```
VITE v7.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### 3.4 Open the Application

1. Open your browser to `http://localhost:5173`
2. You should see the TravelGen welcome page
3. Click through the flow:
   - Welcome → Continue
   - Auth → Continue as Guest
   - Destination → Enter a city (e.g., "Tokyo", "Paris", "New York")
   - Choose dates and number of guests
   - Click "Start Planning"
   - **The app will now fetch real hotels from Google Places API!**
   - Swipe through hotels → Continue
   - Swipe through restaurants → Continue
   - Swipe through activities → Continue
   - View your itinerary

## Step 4: Verify Integration

### Check Backend Logs

When you navigate through the app, you should see API requests in the backend terminal:

```
2025-11-17T... - GET /api/places/hotels?destination=Tokyo%2C%20Japan&limit=10
2025-11-17T... - GET /api/places/restaurants?destination=Tokyo%2C%20Japan&limit=10
2025-11-17T... - GET /api/places/activities?destination=Tokyo%2C%20Japan&limit=10
```

### Check Frontend Console

Open browser DevTools (F12) → Console. You should see successful API calls and no errors.

## API Endpoints Reference

### Hotels
```
GET /api/places/hotels?destination={city}&limit={number}
```

### Restaurants
```
GET /api/places/restaurants?destination={city}&limit={number}
```

### Activities
```
GET /api/places/activities?destination={city}&limit={number}
```

### Place Details
```
GET /api/places/{placeId}
```

## Troubleshooting

### Backend Issues

**Error: "GOOGLE_PLACES_API_KEY not found"**
- Check that you added your API key to `trava-api/.env`
- Make sure the key doesn't have extra spaces or quotes
- Restart the backend server after editing `.env`

**Error: "This API project is not authorized to use this API"**
- Verify you enabled Places API and Geocoding API in Google Cloud Console
- Wait a few minutes for changes to propagate

**Error: "API key not valid"**
- Check that you copied the entire key correctly
- Verify the key restrictions allow Places API and Geocoding API

**Port 5000 already in use**
- Change PORT in `trava-api/.env` to another number (e.g., 5001)
- Update VITE_API_URL in `trava-frontend/.env` to match

### Frontend Issues

**"Failed to load hotels/restaurants/activities"**
- Make sure the backend is running on port 5000
- Check browser console for detailed error messages
- Verify CORS is not blocking requests (backend already has CORS configured)

**No results for certain destinations**
- Google Places may not have data for all locations
- Try popular cities: Tokyo, Paris, New York, London, etc.
- Check backend logs for specific Google API errors

## Development Workflow

### Running Both Services

**Terminal 1 - Backend:**
```bash
cd trava-api
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd trava-frontend
npm run dev
```

### Making Changes

- Backend changes auto-reload with nodemon
- Frontend changes hot-reload with Vite
- No need to restart servers during development

## Cost Management

### Monitor API Usage

1. Go to Google Cloud Console
2. Navigate to "APIs & Services" → "Dashboard"
3. View request counts and costs
4. Set up budget alerts if needed

### Optimize Costs

The app is already optimized:
- Limits results to 10 per endpoint
- Caches are not implemented yet (future enhancement)
- Only fetches when user navigates to swipe screens

## Next Steps

Now that Google Places is integrated, you can:

1. **Add AI Itinerary Generation** - Integrate OpenAI or Claude API
2. **Add User Authentication** - Implement login/signup with JWT
3. **Add Database** - Store user trips and preferences
4. **Add Caching** - Reduce API calls with Redis or in-memory cache
5. **Add Photos** - Display place photos from Google Places
6. **Add Filters** - Let users filter by price, rating, distance
7. **Add Maps** - Show places on a map using Google Maps

## Support

- Backend README: [trava-api/README.md](trava-api/README.md)
- Frontend README: [trava-frontend/README.md](trava-frontend/README.md)
- Google Places API Docs: https://developers.google.com/maps/documentation/places/web-service

---

**Happy Coding!** 🚀✈️
