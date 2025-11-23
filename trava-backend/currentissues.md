# TRAVA BACKEND: CRITICAL PROBLEMS & SOLUTIONS (2-Week Sprint)

## PROBLEM #1: No Persistence (Data Lost on Restart)
**Severity:** 🔴 CRITICAL | **Impact:** Can't scale, no learning, no user tracking

**Code Reference:**
- `app/routers/itinerary.py:18` - `itinerary_store = {}` (in-memory dict)
- `app/config.py:20-22` - Redis configured but never used
- `app/main.py:87-101` - No database initialization

**Problems:**
1. Itineraries lost on server restart
2. Can't identify returning users
3. No feedback mechanism
4. Single instance only (can't scale horizontally)

**Theoretical Solution:**
```
Tier 1: PostgreSQL (persistent)
├─ users (id, email, preferences)
├─ itineraries (id, user_id, destination, data)
├─ recommendations (id, city, category, tags, location)
└─ user_feedback (id, user_id, itinerary_id, rating)

Tier 2: Redis (cache)
├─ recommendations by city (TTL: 1 hour)
├─ user profiles (TTL: 24 hours)
└─ generated itineraries (TTL: 7 days)

Architecture: Request → Redis (fast) → PostgreSQL (persistent) → External APIs
```

---

## PROBLEM #2: Naive Scoring Algorithm (No Personalization)
**Severity:** 🔴 CRITICAL | **Impact:** All users get same recommendations

**Code Reference:**
- `app/utils/scoring.py:21-38` - Linear 0-100 scoring
- `app/utils/scoring.py:40-54` - Tag matching is exact-match only
- `app/utils/scoring.py:56-58` - Rating is linear (no confidence weighting)
- `app/utils/scoring.py:60-77` - Budget scoring penalizes cheap options

**Problems:**
1. Tag matching: "casual" ≠ "relaxed" (no semantic understanding)
2. Rating: 1 review with 5 stars = 1000 reviews with 5 stars
3. Budget: Penalizes finding cheaper options
4. No collaborative filtering (doesn't learn from other users)
5. No content-based filtering (doesn't understand item similarity)
6. No temporal dynamics (ignores time of day, weather, season)

**Theoretical Solution:**
```
Ensemble Model:
├─ Collaborative Filtering (40% weight)
│  ├─ Find similar users
│  ├─ Aggregate their ratings
│  └─ Predict user's rating
├─ Content-Based Filtering (40% weight)
│  ├─ Embed recommendations in vector space
│  ├─ Embed user preferences
│  └─ Compute cosine similarity
└─ Contextual Factors (20% weight)
   ├─ Time of day (breakfast vs dinner)
   ├─ Weather (indoor vs outdoor)
   ├─ Travel time (prefer nearby)
   └─ Day of week (weekday vs weekend)

Final Score = 0.4 * collab + 0.4 * content + 0.2 * context
```

---

## PROBLEM #3: Simplistic Scheduling (No Optimization)
**Severity:** 🔴 CRITICAL | **Impact:** Inefficient itineraries, excessive travel time

**Code Reference:**
- `app/utils/scheduling.py:46-90` - Greedy scheduling
- `app/utils/scheduling.py:107-135` - Hard-coded time blocks
- `app/utils/scheduling.py:218-231` - Greedy selection (picks first that fits)
- `app/utils/scheduling.py:289-306` - Travel time calculated but not optimized
- `app/utils/scheduling.py:337-372` - Clustering exists but never called

**Problems:**
1. Greedy algorithm (not globally optimal)
2. Hard-coded time blocks (doesn't adapt to preferences)
3. Opening hours not validated (schedules closed restaurants)
4. Travel time ignored in scheduling (can result in 2+ hours travel/day)
5. Geographic clustering unused (could reduce travel 30-40%)
6. No multi-day optimization
7. No constraint satisfaction

**Theoretical Solution:**
```
Constraint Satisfaction + TSP Optimization:

Step 1: Filter by constraints
├─ Opening hours
├─ Travel time
├─ Accessibility
└─ Dietary restrictions

Step 2: Geographic clustering
├─ Group nearby recommendations (< 5km)
├─ Create clusters for each day
└─ Minimize inter-cluster travel

Step 3: Traveling Salesman Problem (TSP)
├─ Small instances (< 20): Exact solver (branch-and-bound)
├─ Large instances: Genetic algorithm
└─ Fast approximation: Nearest neighbor + 2-opt

Step 4: Time allocation
├─ Respect opening hours
├─ Respect estimated duration
├─ Add travel time
└─ Respect daily hours

Step 5: Category balancing
├─ Distribute across days
├─ Prevent clustering
└─ Respect pace constraints
```

---

## PROBLEM #4: Limited Data (Only 20 Recommendations)
**Severity:** 🔴 CRITICAL | **Impact:** Can't personalize, can't filter

**Code Reference:**
- `app/data/seeded_recommendations.json:1-328` - Rome: 12, Paris: 5, Tokyo: 3 (Total: 20)
- `app/services/data_source.py:120-339` - GooglePlacesDataSource incomplete
- `app/config.py:18` - API key configured but not validated

**Problems:**
1. Only 20 items total (should be 100K+)
2. Can't personalize with small dataset
3. Google Places API not used in production
4. No real-time data
5. No data refresh pipeline

**Theoretical Solution:**
```
Multi-Source Data Pipeline:

Primary Sources:
├─ Google Places API (50K+ places/city)
├─ Yelp API (20K+ restaurants/city)
└─ TripAdvisor API (10K+ attractions/city)

Secondary Sources:
├─ OpenWeather API (weather-based recommendations)
├─ Eventbrite API (events)
└─ Wikipedia API (cultural info)

Pipeline:
├─ Fetch from APIs (daily)
├─ Normalize schema
├─ Deduplicate
├─ Enrich with additional data
├─ Store in PostgreSQL
├─ Index for search
└─ Cache in Redis
```

---

## PROBLEM #5: No User Learning or Feedback Loop
**Severity:** 🟠 HIGH | **Impact:** Can't improve, can't measure success

**Code Reference:**
- `app/routers/itinerary.py:106-149` - Refinement endpoint not implemented (returns original)
- `app/models/schemas.py:212-226` - RefineAction defined but not used
- No user feedback table
- No rating mechanism
- No analytics tracking

**Problems:**
1. No user profiles
2. No feedback mechanism
3. Refinement endpoint not implemented
4. No analytics
5. No A/B testing

**Theoretical Solution:**
```
Feedback Loop + User Learning:

Step 1: Collect feedback
├─ User rates itinerary (1-5 stars)
├─ User rates individual recommendations
├─ User provides text feedback
└─ Track user behavior (clicks, time spent)

Step 2: Store in database
├─ user_feedback table
├─ recommendation_ratings table
├─ user_behavior table
└─ user_preferences_history table

Step 3: Analyze feedback
├─ Aggregate ratings by recommendation
├─ Identify popular/unpopular items
└─ Identify user preference patterns

Step 4: Update user profile
├─ Adjust preference weights
├─ Learn liked/disliked categories
├─ Learn budget preferences
└─ Learn pace preferences

Step 5: Retrain models (offline)
├─ Collaborative filtering
├─ Content-based filtering
├─ Ensemble weights
└─ Deploy updated models
```

---

## PROBLEM #6: Missing Production Features
**Severity:** 🟠 HIGH | **Impact:** Can't scale, can't monitor, can't secure

**Code Reference:**
- `app/config.py:20-22` - Redis configured but never used
- `app/main.py:1-130` - No authentication, no rate limiting
- `app/routers/itinerary.py:21-62` - No caching of results

**Problems:**
1. No authentication (no JWT tokens)
2. No rate limiting
3. No caching (Redis configured but unused)
4. No circuit breaker for external APIs
5. No request deduplication
6. No monitoring/alerting
7. No performance metrics

**Theoretical Solution:**
```
Production Features:

1. Authentication
├─ JWT tokens
├─ User identification
├─ Session management
└─ OAuth2 integration

2. Caching
├─ Redis for recommendations
├─ Redis for user profiles
├─ Redis for itineraries
└─ Cache invalidation strategy

3. Rate Limiting
├─ Per-user rate limits
├─ Per-IP rate limits
├─ Sliding window algorithm
└─ Return 429 when exceeded

4. Circuit Breaker
├─ Monitor external API failures
├─ Fall back to cached data
├─ Exponential backoff
└─ Auto-recovery

5. Monitoring
├─ Prometheus metrics
├─ Grafana dashboards
├─ ELK log aggregation
└─ Alerting rules
```

---

## PRIORITY RANKING FOR 2-WEEK SPRINT

### Week 1: Foundation
1. **Problem #1** - Add PostgreSQL + Redis (enables everything)
2. **Problem #4** - Integrate Google Places API (real data)
3. **Problem #6** - Add authentication + caching

### Week 2: Algorithms
4. **Problem #2** - Improve scoring (collaborative + content filtering)
5. **Problem #3** - Optimize scheduling (TSP solver)
6. **Problem #5** - Implement feedback loop

---

## IMPLEMENTATION STRATEGY

**Week 1 Deliverables:**
- PostgreSQL schema + migrations
- Redis caching layer
- JWT authentication
- Google Places API integration
- 50K+ recommendations per city

**Week 2 Deliverables:**
- Ensemble scoring model
- TSP-based scheduler
- Feedback collection endpoint
- User profile learning
- Performance monitoring

**Presentation Ready:**
- Live demo with real data
- Performance metrics
- User satisfaction scores
- Scalability demonstration
```

