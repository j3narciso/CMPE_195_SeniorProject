Here's the complete updated README.md content - copy and paste this to replace your current README:

```markdown
# Trava AI - Travel Recommendation Backend

Production-grade FastAPI backend for generating personalized multi-day travel itineraries using an intelligent recommendation engine.

## Features

- **Intelligent Scoring Algorithm** - Multi-factor recommendation scoring based on user preferences
- **Smart Scheduling** - Geographic clustering and time-optimized daily itineraries
- **Edge Case Handling** - Graceful degradation for all scenarios
- **High Performance** - Sub-2-second itinerary generation
- **Comprehensive Testing** - Full test coverage including edge cases
- **Production-Ready** - Structured logging, error handling, and monitoring

## Quick Start (Backend Only)

### Prerequisites

- Python 3.11+
- pip or conda

### Installation

```bash
# Clone repository
git clone <repo-url>
cd trava-backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment template
cp .env.example .env
```

### Running the Server

```bash
# Development mode (with auto-reload)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Production mode
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

API will be available at:
- **API**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Running Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_endpoints.py

# Run with verbose output
pytest -v
```

---

## Full Stack Setup (Backend + Frontend)

### Prerequisites

- Python 3.11+
- Node.js 18+ and npm
- Git

### Step 1: Clone Repository

```bash
git clone <repo-url>
cd CMPE_195_SeniorProject
```

### Step 2: Setup Backend

```bash
# Navigate to backend directory
cd trava-backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Verify .env has correct CORS origins
# Should include: http://localhost:5173 (frontend dev server)
```

### Step 3: Setup Frontend

```bash
# Navigate to frontend directory (from project root)
cd trava-frontend

# Install dependencies
npm install

# Verify .env or create one if needed
# Frontend should connect to: http://localhost:8000
```

### Step 4: Run Both Services

**Terminal 1 - Backend:**
```bash
cd trava-backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd trava-frontend
npm run dev
```

### Step 5: Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

---

## Configuration

### Backend Environment Variables ([.env](cci:7://file:///Users/gautamchintalapati/CMPE_195_SeniorProject/trava-backend/.env:0:0-0:0))

```bash
# Environment
ENVIRONMENT=development

# API Keys (for future use)
GOOGLE_PLACES_API_KEY=your_key_here

# Redis (optional, for caching)
REDIS_URL=redis://localhost:6379/0

# CORS - Must include frontend URL
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# Logging
LOG_LEVEL=INFO
```

### Frontend Configuration

Check `trava-frontend/.env` or create one:
```
VITE_API_URL=http://localhost:8000
```

---

## API Endpoints

### Generate Itinerary

```bash
POST /api/v1/itinerary/generate
```

Generate a personalized multi-day itinerary.

**Example Request:**

```json
{
  "destination": "Rome",
  "start_date": "2025-06-01",
  "end_date": "2025-06-03",
  "daily_start_hour": 9,
  "daily_end_hour": 22,
  "preferences": {
    "liked_tags": {
      "food": ["italian", "casual"],
      "sightseeing": ["historic"]
    },
    "disliked_tags": {},
    "budget_level": 2,
    "pace": "moderate",
    "mobility_limited": false,
    "dietary_restrictions": []
  }
}
```

**Example Response:**

```json
{
  "trip_id": "trip_abc123",
  "destination": "Rome",
  "days": [
    {
      "date": "2025-06-01",
      "items": [
        {
          "time": "9:00 AM - 11:30 AM",
          "recommendation": {
            "id": "rome_001",
            "name": "Colosseum",
            "category": "sightseeing",
            "tags": ["historic", "iconic"],
            "location": {"lat": 41.8902, "lng": 12.4924},
            "rating": 4.8,
            "price_range": 2,
            "description": "Ancient Roman amphitheater",
            "estimated_duration": 150
          },
          "notes": "Travel time: 15 min from hotel",
          "category": "sightseeing"
        }
      ]
    }
  ],
  "summary": "3-day Roman adventure focusing on historic sites",
  "total_recommendations": 24,
  "using_cached_data": false,
  "warnings": []
}
```

### Get Recommendations

```bash
GET /api/v1/recommendations?destination=Rome&category=food&limit=10
```

Retrieve paginated recommendations for browsing.

### Get Itinerary

```bash
GET /api/v1/itinerary/{trip_id}
```

Retrieve a previously generated itinerary.

### Health Check

```bash
GET /api/v1/health
```

Check API status and available cities.

---

## Architecture

```
trava-backend/
├── app/
│   ├── main.py                 # FastAPI application
│   ├── config.py               # Configuration management
│   ├── models/
│   │   └── schemas.py          # Pydantic models
│   ├── routers/
│   │   └── itinerary.py        # API routes
│   ├── services/
│   │   ├── data_source.py      # Data abstraction layer
│   │   └── recommendation_engine.py  # Core engine
│   ├── utils/
│   │   ├── scoring.py          # Scoring algorithm
│   │   ├── scheduling.py       # Scheduling logic
│   │   └── validation.py       # Input validation
│   └── data/
│       └── seeded_recommendations.json  # Mock data
├── tests/
│   ├── conftest.py             # Test fixtures
│   ├── test_endpoints.py       # API tests
│   ├── test_edge_cases.py      # Edge case tests
│   └── test_recommendation_engine.py  # Unit tests
├── requirements.txt
├── .env.example
└── README.md
```

---

## Recommendation Engine

### Scoring Algorithm

Recommendations are scored using multiple factors:

1. **Tag Matching** (40 points max)
   - +10 points per matching liked tag
   - Filtered out if matches disliked tag

2. **Rating** (25 points max)
   - Based on 0-5 star rating

3. **Budget Alignment** (20 points max)
   - Perfect match: +20
   - Within 1 level: +10
   - Over budget: penalty

4. **Feasibility** (15 points max)
   - Accessibility for mobility-limited users
   - Dietary restrictions compliance
   - Opening hours compatibility

### Scheduling Logic

1. **Time Blocks**
   - Morning (9 AM - 12 PM): Sightseeing priority
   - Midday (12 PM - 2 PM): Food priority
   - Afternoon (2 PM - 6 PM): Activities/Events
   - Evening (6 PM - 10 PM): Food/Events

2. **Geographic Clustering**
   - Groups nearby recommendations
   - Minimizes travel time
   - Adds travel time notes

3. **Category Balancing**
   - Distributes categories across days
   - Prevents category clustering

4. **Pace Compliance**
   - Slow: 4-6 items/day
   - Moderate: 6-8 items/day
   - Fast: 8-10 items/day

---

## Data Sources

### Current: Mock Data

Seeded recommendations for:
- **Rome**: 12 recommendations
- **Paris**: 5 recommendations
- **Tokyo**: 3 recommendations

### Future: Google Places API

Integration ready in [app/services/data_source.py](cci:7://file:///Users/gautamchintalapati/CMPE_195_SeniorProject/trava-backend/app/services/data_source.py:0:0-0:0):
- Real-time data fetching
- Automatic caching
- Fallback to mock data

---

## Testing

### Test Coverage

- **Endpoint Tests**: All API routes
- **Edge Cases**: Single-day trips, conflicting preferences, budget filtering
- **Unit Tests**: Scoring, scheduling, validation
- **Integration Tests**: Full itinerary generation

### Key Test Scenarios

✅ Valid itinerary generation  
✅ Invalid destination handling  
✅ Date validation  
✅ Dietary restrictions  
✅ Mobility limitations  
✅ Budget filtering  
✅ Pace variations  
✅ Conflicting preferences  
✅ Single-day trips  
✅ Maximum trip length  

---

## Performance

- **Itinerary Generation**: < 2 seconds (typical)
- **Recommendations Query**: < 500ms
- **Concurrent Requests**: 100+ simultaneous

---

## Error Handling

All errors return consistent JSON format:

```json
{
  "detail": "Human-readable error message"
}
```

### HTTP Status Codes

- `200` - Success
- `400` - Bad Request (invalid input)
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

---

## Logging

Structured JSON logging with:
- Request/response logging
- Performance metrics
- Error tracking
- User pattern analysis

---

## Troubleshooting

### Backend won't start

**Error: `ModuleNotFoundError: No module named 'app'`**
- Ensure you're in the [trava-backend](cci:7://file:///Users/gautamchintalapati/CMPE_195_SeniorProject/trava-backend:0:0-0:0) directory
- Verify virtual environment is activated
- Run `pip install -r requirements.txt` again

**Error: `Port 8000 already in use`**
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :8000   # Windows
```

### Frontend can't connect to backend

**Error: `CORS error` or `Failed to fetch`**
- Verify backend is running on `http://localhost:8000`
- Check [.env](cci:7://file:///Users/gautamchintalapati/CMPE_195_SeniorProject/trava-backend/.env:0:0-0:0) has `CORS_ORIGINS=http://localhost:5173`
- Restart backend after changing [.env](cci:7://file:///Users/gautamchintalapati/CMPE_195_SeniorProject/trava-backend/.env:0:0-0:0)

**Error: `Cannot find module` in frontend**
```bash
cd trava-frontend
npm install
npm run dev
```

### Tests failing

```bash
# Run tests with verbose output
pytest -v

# Run specific test
pytest tests/test_endpoints.py::test_valid_itinerary_generation -v

# Check test coverage
pytest --cov=app --cov-report=html
```

---

## Future Enhancements

- [ ] Google Places API integration
- [ ] Redis caching layer
- [ ] User authentication (JWT)
- [ ] Itinerary persistence (PostgreSQL)
- [ ] Real-time availability checking
- [ ] Weather-based recommendations
- [ ] Collaborative filtering
- [ ] Booking integration
- [ ] Rate limiting
- [ ] WebSocket support for real-time updates

---

## Contributing

1. Create feature branch
2. Make changes
3. Add tests
4. Run test suite
5. Submit pull request

---

## License

MIT License

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review API documentation at http://localhost:8000/docs
3. Check logs for error messages
4. Open a GitHub issue with error details
```

Copy this entire content and replace your current README.md file. This version includes:

✅ Backend-only setup  
✅ Full stack (backend + frontend) setup  
✅ Configuration for both services  
✅ Complete API endpoint examples  
✅ Troubleshooting section  
✅ Clear instructions for team members to clone and run everything