# TravelGen API

Backend API for TravelGen - AI-Powered Trip Itinerary Planner

## Features

- Google Places API integration for real travel data
- Search for hotels, restaurants, and activities by destination
- RESTful API endpoints
- CORS enabled for frontend integration

## Tech Stack

- Node.js
- Express.js
- Google Maps Services
- dotenv for environment configuration

## Setup Instructions

### 1. Install Dependencies

```bash
cd trava-api
npm install
```

### 2. Get Google Places API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the following APIs:
   - Places API
   - Geocoding API
4. Go to "Credentials" and create an API key
5. (Optional but recommended) Restrict the API key to only allow Places API and Geocoding API

### 3. Configure Environment Variables

Copy the example environment file and add your API key:

```bash
cp .env.example .env
```

Edit `.env` and add your Google Places API key:

```
GOOGLE_PLACES_API_KEY=your_actual_api_key_here
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### 4. Start the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Health Check
```
GET /api/health
```
Returns server status and configuration.

### Get Hotels
```
GET /api/places/hotels?destination=Tokyo,Japan&limit=10
```

Query Parameters:
- `destination` (required): City or location name
- `radius` (optional): Search radius in meters (default: 10000)
- `limit` (optional): Maximum results to return (default: 10)

Response:
```json
{
  "success": true,
  "destination": "Tokyo, Japan",
  "count": 10,
  "data": [
    {
      "id": "ChIJ...",
      "name": "Hotel Name",
      "pricePerNight": 150,
      "priceLevel": "mid",
      "rating": 4.5,
      "description": "Address",
      "photos": ["url1", "url2"],
      "openNow": true
    }
  ]
}
```

### Get Restaurants
```
GET /api/places/restaurants?destination=Tokyo,Japan&limit=10
```

Query Parameters:
- `destination` (required): City or location name
- `radius` (optional): Search radius in meters (default: 5000)
- `limit` (optional): Maximum results to return (default: 10)

### Get Activities
```
GET /api/places/activities?destination=Tokyo,Japan&limit=10
```

Query Parameters:
- `destination` (required): City or location name
- `radius` (optional): Search radius in meters (default: 15000)
- `limit` (optional): Maximum results to return (default: 10)

### Get Place Details
```
GET /api/places/:placeId
```

Returns detailed information about a specific place.

## Project Structure

```
trava-api/
├── src/
│   ├── server.js              # Express server setup
│   ├── routes/
│   │   └── places.js          # Places API routes
│   └── services/
│       └── googlePlaces.js    # Google Places API service
├── .env                       # Environment variables (not in git)
├── .env.example              # Example environment variables
├── .gitignore
├── package.json
└── README.md
```

## Error Handling

The API returns standardized error responses:

```json
{
  "error": "Error Type",
  "message": "Detailed error message"
}
```

Common HTTP status codes:
- `200`: Success
- `400`: Bad Request (missing required parameters)
- `404`: Not Found
- `500`: Internal Server Error

## Development

### Testing API Endpoints

You can test the API using curl, Postman, or your browser:

```bash
# Health check
curl http://localhost:5000/api/health

# Get hotels in Tokyo
curl "http://localhost:5000/api/places/hotels?destination=Tokyo,Japan&limit=5"

# Get restaurants in Paris
curl "http://localhost:5000/api/places/restaurants?destination=Paris,France&limit=5"

# Get activities in New York
curl "http://localhost:5000/api/places/activities?destination=New%20York,USA&limit=5"
```

## Google Places API Pricing

Be aware of Google Places API pricing:
- Places API: $17 per 1,000 requests (monthly free tier: $200 credit)
- Geocoding API: $5 per 1,000 requests

For development, the free tier should be sufficient. Monitor usage in Google Cloud Console.

## Next Steps

- [ ] Add authentication endpoints
- [ ] Integrate AI itinerary generation
- [ ] Add database for saving user trips
- [ ] Implement caching to reduce API calls
- [ ] Add rate limiting
- [ ] Add request validation middleware
