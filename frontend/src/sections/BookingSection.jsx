import { useMemo, useState } from "react";

const currencyConfig = {
  USD: { symbol: "$", rate: 1, decimals: 0 },
  EUR: { symbol: "EUR ", rate: 0.92, decimals: 0 },
  GBP: { symbol: "GBP ", rate: 0.79, decimals: 0 },
  ERN: { symbol: "Nfk ", rate: 15, decimals: 0 }
};

function formatPrice(currency, amountUsd) {
  const config = currencyConfig[currency] || currencyConfig.USD;
  const amount = amountUsd * config.rate;
  return `${config.symbol}${amount.toFixed(config.decimals)}`;
}

function BookingSection({
  id,
  title,
  planningTitle,
  planningText,
  labels,
  message,
  confirmation,
  onSubmit,
  selectedPackages,
  currency,
  cartTitle,
  cartSubtitle,
  cartEmptyLabel,
  estimatedTotalLabel,
  basePriceLabel,
  perTravelerLabel,
  totalTravelersLabel,
  packageCountLabel,
  t
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    origin_country: "",
    adults: 1,
    children: 0,
    infants: 0,
    travel_date: "",
    extra_requests: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const minTravelDate = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  const groupSize = form.adults + form.children + form.infants;

  const basePackagesTotal = useMemo(
    () => selectedPackages.reduce((sum, item) => sum + (item.price_usd || 0), 0),
    [selectedPackages]
  );
  const estimatedTotal = basePackagesTotal * Math.max(1, groupSize);
  const confirmationPackages = confirmation?.selected_packages || [];

  const handleChange = (event) => {
    const { name, value, type } = event.target;
    const nextValue = type === "number" ? Number(value) : value;
    setForm((current) => ({ ...current, [name]: nextValue }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await onSubmit({ ...form, group_size: groupSize });
      setForm({
        name: "",
        email: "",
        origin_country: "",
        adults: 1,
        children: 0,
        infants: 0,
        travel_date: "",
        extra_requests: ""
      });
    } catch (submitError) {
      setError(submitError.message || labels.submitError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="content-section booking-section" id={id}>
      <div className="section-heading booking-heading">
        <p className="eyebrow">{t.bookingEyebrow}</p>
        <h2>{title}</h2>
        <p className="muted booking-lead">{t.bookingLead}</p>
      </div>

      <div className="booking-layout booking-layout-enhanced">
        <div className="booking-copy booking-summary-panel">
          <div className="booking-summary-intro">
            <span className="booking-summary-kicker">{t.tripPlannerKicker}</span>
            <h3>{planningTitle}</h3>
            <p>{planningText}</p>
          </div>

          <div className="booking-summary-stats">
            <article className="booking-stat-card">
              <span>{packageCountLabel}</span>
              <strong>{selectedPackages.length}</strong>
            </article>
            <article className="booking-stat-card">
              <span>{totalTravelersLabel}</span>
              <strong>{groupSize}</strong>
            </article>
            <article className="booking-stat-card booking-stat-card-accent">
              <span>{estimatedTotalLabel}</span>
              <strong>{formatPrice(currency, estimatedTotal)}</strong>
            </article>
          </div>

          <div className="booking-package-panel">
            <div className="booking-package-heading">
              <strong>{cartTitle}</strong>
              <span>{cartSubtitle}</span>
            </div>

            {selectedPackages.length ? (
              <div className="booking-package-list">
                {selectedPackages.map((item) => (
                  <article key={item.id} className="booking-package-card">
                    <img src={item.image_url} alt={item.name} />
                    <div className="booking-package-copy">
                      <strong>{item.name}</strong>
                      <span>{item.region}</span>
                      <small>
                        {basePriceLabel}: {formatPrice(currency, item.price_usd || 0)} {perTravelerLabel}
                      </small>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="booking-empty-state">
                <p>{cartEmptyLabel}</p>
              </div>
            )}
          </div>
        </div>

        <form className="booking-form booking-form-enhanced" onSubmit={handleSubmit}>
          <div className="booking-form-intro">
            <strong>{t.travelerDetailsTitle}</strong>
            <span>{labels.packageNote}</span>
          </div>
          <div className="booking-form-grid">
            <label>
              {labels.name}
              <input name="name" value={form.name} onChange={handleChange} placeholder={labels.name} required />
            </label>
            <label>
              {labels.email}
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder={labels.email}
                required
              />
            </label>
            <label>
              {labels.origin}
              <input
                name="origin_country"
                value={form.origin_country}
                onChange={handleChange}
                placeholder={labels.origin}
                required
              />
            </label>
            <label>
              {labels.date}
              <input
                type="date"
                name="travel_date"
                value={form.travel_date}
                onChange={handleChange}
                min={minTravelDate}
                required
              />
            </label>
          </div>
          <div className="traveler-panel booking-traveler-panel">
            <div className="traveler-total traveler-total-readout">
              <span>{labels.groupSize}</span>
              <strong>{groupSize}</strong>
            </div>
            <div className="traveler-grid booking-traveler-grid">
              <label>
                {labels.adults}
                <input
                  type="number"
                  name="adults"
                  value={form.adults}
                  onChange={handleChange}
                  min="1"
                  required
                />
              </label>
              <label>
                {labels.children}
                <input
                  type="number"
                  name="children"
                  value={form.children}
                  onChange={handleChange}
                  min="0"
                  required
                />
              </label>
              <label>
                {labels.infants}
                <input
                  type="number"
                  name="infants"
                  value={form.infants}
                  onChange={handleChange}
                  min="0"
                  required
                />
              </label>
            </div>
          </div>
          <label>
            {labels.extra}
            <textarea
              name="extra_requests"
              value={form.extra_requests}
              onChange={handleChange}
              rows="5"
              placeholder={labels.extra}
            />
          </label>
          <div className="booking-total-bar">
            <div>
              <span>{estimatedTotalLabel}</span>
              <strong>{formatPrice(currency, estimatedTotal)}</strong>
            </div>
            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? labels.sending : labels.submit}
            </button>
          </div>
          {error ? <p className="error-message">{error}</p> : null}
          {message ? <p className="success-message">{message}</p> : null}
          {confirmation ? (
            <article className="booking-confirmation-card">
              <div className="booking-confirmation-heading">
                <span>{t.confirmationReceivedLabel}</span>
                <strong>{t.confirmationReferenceLabel}{confirmation.id}</strong>
              </div>
              <div className="booking-confirmation-grid">
                <div>
                  <span>{t.confirmationNameLabel}</span>
                  <strong>{confirmation.name}</strong>
                </div>
                <div>
                  <span>{t.confirmationEmailLabel}</span>
                  <strong>{confirmation.email}</strong>
                </div>
                <div>
                  <span>{t.confirmationTravelDateLabel}</span>
                  <strong>{confirmation.travel_date}</strong>
                </div>
                <div>
                  <span>{t.confirmationTravelersLabel}</span>
                  <strong>{confirmation.group_size}</strong>
                </div>
                <div>
                  <span>{labels.adults}</span>
                  <strong>{confirmation.adults}</strong>
                </div>
                <div>
                  <span>{labels.children}</span>
                  <strong>{confirmation.children}</strong>
                </div>
                <div>
                  <span>{labels.infants}</span>
                  <strong>{confirmation.infants}</strong>
                </div>
                <div>
                  <span>{estimatedTotalLabel}</span>
                  <strong>{formatPrice(currency, confirmation.estimated_total_usd || 0)}</strong>
                </div>
              </div>
              <div className="booking-confirmation-packages">
                <span>{t.confirmationSelectedPackagesLabel}</span>
                {confirmationPackages.length ? (
                  <div className="booking-confirmation-package-list">
                    {confirmationPackages.map((item) => (
                      <div key={item.id || item.name} className="booking-confirmation-package">
                        <strong>{item.name}</strong>
                        <small>
                          {item.region} - {formatPrice(currency, item.price_usd || 0)} {perTravelerLabel}
                        </small>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>{t.confirmationNoPackagesLabel}</p>
                )}
              </div>
            </article>
          ) : null}
        </form>
      </div>
    </section>
  );
}

export default BookingSection;
