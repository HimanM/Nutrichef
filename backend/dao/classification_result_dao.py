from ..models import ClassificationResult
from ..db import db
from datetime import datetime

class ClassificationResultDAO:
    def create_classification_result(self, user_id, predicted_food_name, nutrition_info_json, score=None, uploaded_image_url=None, classification_timestamp=None):
        """
        Creates a new classification result entry in the database.
        Committing the session is handled by the service layer.
        """
        if classification_timestamp is None:
            classification_timestamp = datetime.utcnow()

        new_result = ClassificationResult(
            UserID=user_id,
            PredictedFoodName=predicted_food_name,
            NutritionInfoJSON=nutrition_info_json,
            Score=score,
            UploadedImageURL=uploaded_image_url,
            ClassificationTimestamp=classification_timestamp
        )
        db.session.add(new_result)
        return new_result

    def get_result_by_id(self, result_id):
        """Fetches a classification result by its ResultID."""
        return ClassificationResult.query.get(result_id)

    def get_results_by_user(self, user_id, page=1, per_page=10):
        """Fetches paginated classification results for a given UserID."""
        return ClassificationResult.query.filter_by(UserID=user_id)                                     .order_by(ClassificationResult.ClassificationTimestamp.desc())                                     .paginate(page=page, per_page=per_page, error_out=False)

    def get_all_classification_scores_summary(self, page=1, per_page=20):
        """
        Retrieves a paginated list of classification results,
        focusing on Timestamp, Score, and PredictedFoodName.
        Returns only results that have a score.
        """
        query = ClassificationResult.query.with_entities(
            ClassificationResult.ClassificationTimestamp,
            ClassificationResult.Score,
            ClassificationResult.PredictedFoodName,
            ClassificationResult.ResultID
        ).filter(ClassificationResult.Score.isnot(None))         .order_by(ClassificationResult.ClassificationTimestamp.desc())

        paginated_results = query.paginate(page=page, per_page=per_page, error_out=False)

        results_data = [{
            "timestamp": item.ClassificationTimestamp.isoformat() if item.ClassificationTimestamp else None,
            "score": float(item.Score) if item.Score is not None else None,
            "predicted_food_name": item.PredictedFoodName,
            "result_id": item.ResultID
        } for item in paginated_results.items]

        return {
            "scores_summary": results_data,
            "total": paginated_results.total,
            "pages": paginated_results.pages,
            "current_page": paginated_results.page
        }
