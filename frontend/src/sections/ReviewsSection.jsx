import { useMemo, useState } from "react";

const INITIAL_REVIEW_COUNT = 3;

function renderStars(rating) {
  const safeRating = Math.max(0, Math.min(5, Number(rating) || 0));
  return "\u2605".repeat(safeRating) + "\u2606".repeat(5 - safeRating);
}

function formatReviewDate(value) {
  if (!value) {
    return "Just now";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

function ReviewsSection({ id, title, subtitle, labels, reviews, message, onSubmit, t }) {
  const [form, setForm] = useState({
    name: "",
    origin_country: "",
    trip_type: "city",
    rating: 5,
    title: "",
    comment: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAllReviews, setShowAllReviews] = useState(false);

  const sortedReviews = useMemo(() => {
    return [...reviews].sort((left, right) => {
      const leftTime = new Date(left.created_at || 0).getTime();
      const rightTime = new Date(right.created_at || 0).getTime();
      return rightTime - leftTime;
    });
  }, [reviews]);

  const visibleReviews = showAllReviews ? sortedReviews : sortedReviews.slice(0, INITIAL_REVIEW_COUNT);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: name === "rating" ? Number(value) : value
    }));
  };

  const handleRatingSelect = (rating) => {
    setForm((current) => ({ ...current, rating }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await onSubmit(form);
      setForm({
        name: "",
        origin_country: "",
        trip_type: "city",
        rating: 5,
        title: "",
        comment: ""
      });
      setShowAllReviews(false);
    } catch (submitError) {
      setError(submitError.message || labels.submitError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="content-section reviews-section" id={id}>
      <div className="section-heading">
        <p className="eyebrow">{t.reviewsEyebrow}</p>
        <h2>{title}</h2>
        <p className="muted reviews-lead">{subtitle}</p>
      </div>

      <div className="reviews-layout reviews-layout-stacked">
        <div className="reviews-display-panel reviews-display-panel-wide">
          <div className="reviews-display-heading reviews-display-heading-wide">
            <div>
              <strong>{labels.displayTitle}</strong>
              <span>{sortedReviews.length} shared stories</span>
            </div>
          </div>
          <div className="reviews-display-list reviews-display-list-wide reviews-display-list-adminlike">
            {visibleReviews.length ? (
              visibleReviews.map((review) => (
                <article key={review.id} className="dashboard-review-card review-card-adminlike">
                  <div className="dashboard-review-topline">
                    <strong>{review.title}</strong>
                    <span className="dashboard-review-stars">{renderStars(review.rating || 0)}</span>
                  </div>
                  <p>{review.comment}</p>
                  <div className="dashboard-review-meta">
                    <span>{review.name}</span>
                    <span>{review.trip_type_label}</span>
                    <span>{review.origin_country || "Guest traveler"}</span>
                    <span>{formatReviewDate(review.created_at)}</span>
                  </div>
                </article>
              ))
            ) : (
              <p className="dashboard-empty">{t.reviewsEmptyLabel}</p>
            )}
          </div>
          {sortedReviews.length > INITIAL_REVIEW_COUNT ? (
            <div className="reviews-toggle-row">
              <button
                type="button"
                className="more-reviews-button"
                onClick={() => setShowAllReviews((current) => !current)}
              >
                {showAllReviews ? t.reviewsShowFewerLabel : t.reviewsShowMoreLabel}
              </button>
            </div>
          ) : null}
        </div>

        <form className="booking-form reviews-form reviews-form-below" onSubmit={handleSubmit}>
          <div className="reviews-form-heading">
            <strong>{labels.formTitle}</strong>
            <span>{labels.formSubtitle}</span>
          </div>
          <label>
            {labels.name}
            <input name="name" value={form.name} onChange={handleChange} placeholder={labels.name} required />
          </label>
          <label>
            {labels.origin}
            <input
              name="origin_country"
              value={form.origin_country}
              onChange={handleChange}
              placeholder={labels.origin}
            />
          </label>
          <div className="review-form-grid review-form-grid-single">
            <div className="review-rating-field">
              <span className="review-rating-label">{labels.rating}</span>
              <div className="review-rating-stars" role="radiogroup" aria-label={labels.rating}>
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    className={`review-rating-star${form.rating >= rating ? " is-active" : ""}`}
                    onClick={() => handleRatingSelect(rating)}
                    aria-label={`${rating} star${rating === 1 ? "" : "s"}`}
                    aria-pressed={form.rating === rating}
                  >
                    {"\u2605"}
                  </button>
                ))}
              </div>
              <span className="review-rating-value">{form.rating} / 5</span>
            </div>
          </div>
          <label>
            {labels.title}
            <input name="title" value={form.title} onChange={handleChange} placeholder={labels.titlePlaceholder} required />
          </label>
          <label>
            {labels.comment}
            <textarea
              name="comment"
              value={form.comment}
              onChange={handleChange}
              rows="5"
              placeholder={labels.commentPlaceholder}
              required
            />
          </label>
          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? labels.submitting : labels.submit}
          </button>
          {error ? <p className="error-message">{error}</p> : null}
          {message ? <p className="success-message">{message}</p> : null}
        </form>
      </div>
    </section>
  );
}

export default ReviewsSection;
