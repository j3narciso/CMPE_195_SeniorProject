"""Scoring algorithm for recommendations"""
from typing import List, Tuple, Dict
from app.models.schemas import Recommendation, UserPreferences


class RecommendationScorer:
    """Scores recommendations based on user preferences"""
    
    def __init__(self, preferences: UserPreferences):
        self.preferences = preferences
        
        # Scoring weights
        self.WEIGHT_TAG_MATCH = 10.0
        self.WEIGHT_RATING = 5.0
        self.WEIGHT_BUDGET = 20.0
        self.WEIGHT_FEASIBILITY = 15.0
        
        # Budget penalties
        self.BUDGET_PENALTY_PER_LEVEL = 5.0
    
    def calculate_score(self, recommendation: Recommendation) -> float:
        """Calculate total score for a recommendation"""
        score = 0.0
        
        # 1. Tag matching score (max 40 points - 4 tags * 10 points)
        score += self._score_tag_matching(recommendation)
        
        # 2. Rating score (max 25 points)
        score += self._score_rating(recommendation)
        
        # 3. Budget alignment (max 20 points)
        score += self._score_budget(recommendation)
        
        # 4. Feasibility (max 15 points)
        score += self._score_feasibility(recommendation)
        
        # Clamp score to 0-100 range
        return max(0.0, min(100.0, score))
    
    def _score_tag_matching(self, rec: Recommendation) -> float:
        """Score based on tag matches"""
        score = 0.0
        category = rec.category.value
        
        # Get liked tags for this category
        liked_tags = self.preferences.liked_tags.get(category, [])
        
        # Count matching tags
        rec_tags_lower = [tag.lower() for tag in rec.tags]
        for liked_tag in liked_tags:
            if liked_tag.lower() in rec_tags_lower:
                score += self.WEIGHT_TAG_MATCH
        
        return score
    
    def _score_rating(self, rec: Recommendation) -> float:
        """Score based on rating (0-5 stars)"""
        return (rec.rating / 5.0) * 25.0
    
    def _score_budget(self, rec: Recommendation) -> float:
        """Score based on budget alignment"""
        if not self.preferences.budget_level:
            return 10.0  # Neutral score if no budget preference
        
        budget_diff = abs(rec.price_range - self.preferences.budget_level)
        
        if budget_diff == 0:
            return self.WEIGHT_BUDGET  # Perfect match
        elif budget_diff == 1:
            return self.WEIGHT_BUDGET * 0.5  # Close match
        else:
            # Penalty for being over budget
            if rec.price_range > self.preferences.budget_level:
                return max(0, self.WEIGHT_BUDGET - (budget_diff * self.BUDGET_PENALTY_PER_LEVEL))
            else:
                # Less penalty for being under budget
                return max(0, self.WEIGHT_BUDGET - (budget_diff * 2))
    
    def _score_feasibility(self, rec: Recommendation) -> float:
        """Score based on feasibility constraints"""
        score = self.WEIGHT_FEASIBILITY
        
        # Check mobility constraints
        if self.preferences.mobility_limited:
            rec_tags_lower = [tag.lower() for tag in rec.tags]
            inaccessible_tags = ['hiking', 'climbing', 'stairs', 'walking_intensive']
            if any(tag in rec_tags_lower for tag in inaccessible_tags):
                score -= 10.0
        
        # Check dietary restrictions
        if rec.category.value == "food" and self.preferences.dietary_restrictions:
            rec_tags_lower = [tag.lower() for tag in rec.tags]
            for restriction in self.preferences.dietary_restrictions:
                restriction_lower = restriction.lower()
                
                # Define incompatible tags for each dietary restriction
                incompatible = {
                    'vegan': ['meat', 'dairy', 'seafood', 'fish', 'steak'],
                    'vegetarian': ['meat', 'seafood', 'fish', 'steak'],
                    'gluten_free': ['pasta', 'bread', 'pizza'],
                    'halal': ['pork', 'alcohol'],
                    'kosher': ['pork', 'shellfish']
                }
                
                if restriction_lower in incompatible:
                    for incomp_tag in incompatible[restriction_lower]:
                        if incomp_tag in rec_tags_lower:
                            score -= 5.0
        
        return max(0.0, score)
    
    def should_filter_out(self, rec: Recommendation) -> Tuple[bool, str]:
        """Determine if recommendation should be filtered out completely"""
        category = rec.category.value
        
        # Check disliked tags
        disliked_tags = self.preferences.disliked_tags.get(category, [])
        rec_tags_lower = [tag.lower() for tag in rec.tags]
        
        for disliked_tag in disliked_tags:
            if disliked_tag.lower() in rec_tags_lower:
                return True, f"Contains disliked tag: {disliked_tag}"
        
        # Filter out inaccessible options for mobility-limited users
        if self.preferences.mobility_limited:
            inaccessible_tags = ['hiking', 'climbing', 'stairs_heavy']
            for tag in inaccessible_tags:
                if tag in rec_tags_lower:
                    return True, f"Not accessible: {tag}"
        
        # Filter out dietary incompatibilities
        if rec.category.value == "food" and self.preferences.dietary_restrictions:
            for restriction in self.preferences.dietary_restrictions:
                restriction_lower = restriction.lower()
                
                strict_incompatible = {
                    'vegan': ['meat', 'dairy', 'seafood', 'steak'],
                    'vegetarian': ['meat', 'seafood', 'steak'],
                }
                
                if restriction_lower in strict_incompatible:
                    for incomp_tag in strict_incompatible[restriction_lower]:
                        if incomp_tag in rec_tags_lower:
                            return True, f"Dietary restriction: {restriction}"
        
        return False, ""


def score_recommendations(
    recommendations: List[Recommendation],
    preferences: UserPreferences
) -> List[Tuple[Recommendation, float]]:
    """
    Score and filter recommendations based on user preferences.
    Returns list of (recommendation, score) tuples sorted by score descending.
    """
    scorer = RecommendationScorer(preferences)
    scored = []
    
    for rec in recommendations:
        # Check if should be filtered out
        should_filter, reason = scorer.should_filter_out(rec)
        if should_filter:
            continue
        
        # Calculate score
        score = scorer.calculate_score(rec)
        
        # Only include if score is above minimum threshold
        if score > 0:
            scored.append((rec, score))
    
    # Sort by score descending
    scored.sort(key=lambda x: x[1], reverse=True)
    
    return scored