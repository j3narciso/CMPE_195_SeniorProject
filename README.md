# CMPE_195_SeniorProject
### 2025-11-23 – Google Places photos + category cleanup (Eder)

**Backend**
- Hooked `GooglePlacesDataSource` into real Google Places API.
- Added `photo_url` field to `Recommendation` schema.
- Implemented photo URL generation using `photo_reference` from Places.
- Introduced new high-level categories:
  - `stay` → maps to Google `lodging` (hotels, B&Bs, etc.)
  - `food` → maps to Google `restaurant`, `cafe`, `bakery`, `bar`
  - `activities` → maps to Google `tourist_attraction`, `museum`, `park`, etc.
- Enabled Redis caching for recommendations (per destination + category).

**Frontend**
- Activity, Food, and Hotel swipe screens now display Google photos from the backend.
- Hotel swipe screen now calls `/api/v1/recommendations?category=stay`.
- Food swipe screen calls `/api/v1/recommendations?category=food`.
- Activity swipe screen calls `/api/v1/recommendations?category=activities`.

**Known issues / TODO**
- Category filtering still a bit noisy (some restaurants show up under activities or stay).
- Food swipe screen currently only shows 1 card in some cases, even though backend returns 10 (front-end state/transform bug).
- We need to refine Google Place type filters for:
  - `stay` → only hotels/lodging
  - `food` → only food places
  - `activities` → attractions / things to do