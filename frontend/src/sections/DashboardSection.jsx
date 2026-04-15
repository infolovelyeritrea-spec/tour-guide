import { useEffect, useMemo, useState } from "react";

const BOOKINGS_PER_PAGE = 6;
const PACKAGE_PRICES_USD = {
  Asmara: 180,
  Massawa: 240,
  Keren: 160,
  "Dahlak Islands": 320,
  "Senafe Highlands": 210,
  "Gash-Barka Discovery": 260
};

function formatDate(value) {
  if (!value) {
    return "Not provided";
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

function formatDateTime(value) {
  if (!value) {
    return "Not recorded";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function formatPath(path) {
  if (!path) {
    return "Unknown page";
  }

  if (path === "/") {
    return "Home";
  }

  return path
    .replace(/^\//, "")
    .split("/")
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" / ");
}

function formatStars(rating) {
  const safeRating = Math.max(0, Math.min(5, Number(rating) || 0));
  return "\u2605".repeat(safeRating) + "\u2606".repeat(5 - safeRating);
}

function formatUsd(amount) {
  return `$${Math.round(amount || 0)}`;
}

function getMonthKey(value) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}`;
}

function parseBookingPackages(extraRequests, groupSize) {
  const fallback = {
    tours: [],
    note: extraRequests || "",
    totalPrice: 0
  };

  if (!extraRequests) {
    return fallback;
  }

  const match = extraRequests.match(/Selected tour packages:\s*(.+?)(?:\.|\n|$)/i);
  if (!match) {
    return fallback;
  }

  const packageNames = match[1]
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item) => item.toLowerCase() !== "none specified");

  const tours = packageNames.map((name) => {
    const basePrice = PACKAGE_PRICES_USD[name] || 0;
    return {
      name,
      basePrice,
      totalPrice: basePrice * (groupSize || 1)
    };
  });

  const note = extraRequests
    .replace(/Selected tour packages:\s*.+?(?:\.|\n|$)/i, "")
    .replace(/^\s+|\s+$/g, "");

  return {
    tours,
    note,
    totalPrice: tours.reduce((sum, item) => sum + item.totalPrice, 0)
  };
}

function DashboardSection({
  dashboardData,
  dashboardLoading,
  loginError,
  loginForm,
  loginLoading,
  onLoginChange,
  onLogin,
  onLogout,
  publicSiteUrl
}) {
  const [bookingSort, setBookingSort] = useState("newest");
  const [bookingFilter, setBookingFilter] = useState("all");
  const [bookingSearch, setBookingSearch] = useState("");
  const [reviewSort, setReviewSort] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);

  const bookings = dashboardData?.booking_details || [];
  const popularPages = dashboardData?.popular_pages || [];
  const reviews = dashboardData?.reviews || [];
  const maxPageViews = popularPages.reduce((largest, item) => Math.max(largest, item.total || 0), 1);
  const totalTrackedPageViews = popularPages.reduce((sum, item) => sum + (item.total || 0), 0);
  const travelerMix = bookings.reduce(
    (totals, booking) => ({
      adults: totals.adults + (booking.adults || 0),
      children: totals.children + (booking.children || 0),
      infants: totals.infants + (booking.infants || 0)
    }),
    { adults: 0, children: 0, infants: 0 }
  );
  const travelerTotal = travelerMix.adults + travelerMix.children + travelerMix.infants;
  const mixRows = [
    { label: "Adults", value: travelerMix.adults, tone: "adults" },
    { label: "Children", value: travelerMix.children, tone: "children" },
    { label: "Infants", value: travelerMix.infants, tone: "infants" }
  ];
  const selectedTourRows = Object.entries(
    bookings.reduce((totals, booking) => {
      const parsedBooking = parseBookingPackages(booking.extra_requests, booking.group_size || 1);
      parsedBooking.tours.forEach((tour) => {
        totals[tour.name] = (totals[tour.name] || 0) + 1;
      });
      return totals;
    }, {})
  )
    .map(([name, total]) => ({ name, total }))
    .sort((left, right) => right.total - left.total || left.name.localeCompare(right.name))
    .slice(0, 5);
  const maxSelectedTourCount = selectedTourRows.reduce((largest, row) => Math.max(largest, row.total), 1);
  const ratingCounts = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    total: reviews.filter((review) => Number(review.rating) === rating).length
  }));
  const maxRatingCount = ratingCounts.reduce((largest, row) => Math.max(largest, row.total), 1);
  const averageRating = reviews.length
    ? (reviews.reduce((sum, review) => sum + (Number(review.rating) || 0), 0) / reviews.length).toFixed(1)
    : "0.0";

  const sortedReviews = useMemo(() => {
    return [...reviews].sort((left, right) => {
      const createdLeft = new Date(left.created_at || 0).getTime();
      const createdRight = new Date(right.created_at || 0).getTime();
      const ratingLeft = Number(left.rating) || 0;
      const ratingRight = Number(right.rating) || 0;

      switch (reviewSort) {
        case "highest":
          return ratingRight - ratingLeft || createdRight - createdLeft;
        case "lowest":
          return ratingLeft - ratingRight || createdRight - createdLeft;
        case "oldest":
          return createdLeft - createdRight;
        case "newest":
        default:
          return createdRight - createdLeft;
      }
    });
  }, [reviewSort, reviews]);

  const filteredSortedBookings = useMemo(() => {
    const today = new Date();
    const todayKey = today.toISOString().slice(0, 10);
    const currentMonthKey = getMonthKey(today);
    const normalizedSearch = bookingSearch.trim().toLowerCase();

    const filtered = bookings.filter((booking) => {
      const travelDate = booking.travel_date || "";
      const hasExtraRequests = Boolean(booking.extra_requests && booking.extra_requests.trim());
      const groupSize = booking.group_size || 0;
      const matchesFilter =
        bookingFilter === "all" ||
        (bookingFilter === "upcoming" && travelDate >= todayKey) ||
        (bookingFilter === "this_month" && getMonthKey(travelDate) === currentMonthKey) ||
        (bookingFilter === "large_groups" && groupSize >= 4) ||
        (bookingFilter === "with_requests" && hasExtraRequests);

      if (!matchesFilter) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const searchTarget = [
        booking.name,
        booking.email,
        booking.origin_country,
        booking.travel_date,
        booking.extra_requests
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchTarget.includes(normalizedSearch);
    });

    return [...filtered].sort((left, right) => {
      const createdLeft = new Date(left.created_at || 0).getTime();
      const createdRight = new Date(right.created_at || 0).getTime();
      const travelLeft = new Date(left.travel_date || 0).getTime();
      const travelRight = new Date(right.travel_date || 0).getTime();
      const groupLeft = left.group_size || 0;
      const groupRight = right.group_size || 0;
      const nameLeft = (left.name || "").toLowerCase();
      const nameRight = (right.name || "").toLowerCase();

      switch (bookingSort) {
        case "oldest":
          return createdLeft - createdRight;
        case "travel_soon":
          return travelLeft - travelRight;
        case "travel_late":
          return travelRight - travelLeft;
        case "group_high":
          return groupRight - groupLeft;
        case "group_low":
          return groupLeft - groupRight;
        case "name_az":
          return nameLeft.localeCompare(nameRight);
        case "newest":
        default:
          return createdRight - createdLeft;
      }
    });
  }, [bookingFilter, bookingSearch, bookingSort, bookings]);

  const totalBookingPages = Math.max(1, Math.ceil(filteredSortedBookings.length / BOOKINGS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalBookingPages);
  const paginatedBookings = filteredSortedBookings.slice(
    (safeCurrentPage - 1) * BOOKINGS_PER_PAGE,
    safeCurrentPage * BOOKINGS_PER_PAGE
  );
  const paginationNumbers = Array.from({ length: totalBookingPages }, (_, index) => index + 1);

  useEffect(() => {
    setCurrentPage(1);
  }, [bookingFilter, bookingSearch, bookingSort]);

  useEffect(() => {
    if (currentPage > totalBookingPages) {
      setCurrentPage(totalBookingPages);
    }
  }, [currentPage, totalBookingPages]);

  if (!dashboardData) {
    return (
      <main className="dashboard-shell">
        <div className="dashboard-topbar">
          <a href={publicSiteUrl} className="dashboard-action dashboard-action-ghost">
            Open Public Site
          </a>
        </div>

        <section className="login-shell">
          <article className="login-card dashboard-login-card">
            <p className="eyebrow">Admin Access</p>
            <h1>Admin Sign In</h1>
            <p className="hero-text dashboard-login-text">Secure dashboard access.</p>
            <form className="booking-form" onSubmit={onLogin}>
              <label>
                Username
                <input
                  name="username"
                  value={loginForm.username}
                  onChange={onLoginChange}
                  placeholder="Admin username"
                  required
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  name="password"
                  value={loginForm.password}
                  onChange={onLoginChange}
                  placeholder="Admin password"
                  required
                />
              </label>
              <button type="submit" className="primary-btn dashboard-login-btn" disabled={loginLoading || dashboardLoading}>
                {loginLoading || dashboardLoading ? "Signing in..." : "Open Dashboard"}
              </button>
              {loginError ? <p className="error-message">{loginError}</p> : null}
            </form>
          </article>
        </section>
      </main>
    );
  }

  return (
    <main className="dashboard-shell dashboard-surface">
      <div className="dashboard-topbar">
        <a href={publicSiteUrl} className="dashboard-action dashboard-action-ghost">
          Open Public Site
        </a>
        <button type="button" className="dashboard-action dashboard-action-primary" onClick={onLogout}>
          Log Out
        </button>
      </div>

      <section className="dashboard-hero dashboard-panel dashboard-hero-panel">
        <div>
          <p className="eyebrow">Admin Dashboard</p>
          <h1>Tour Guide Performance Snapshot</h1>
          <p className="hero-text dashboard-hero-copy">
            Signed in as <strong>{dashboardData.username}</strong>. Track booking demand, visitor behavior, and the pages
            drawing the most attention across the site.
          </p>
        </div>
        <div className="dashboard-status-card">
          <span className="dashboard-status-label">Report generated</span>
          <strong>{dashboardData.generated_on}</strong>
          <p>Live from the current booking and visitor records.</p>
        </div>
      </section>

      <section className="dashboard-visuals">
        <article className="dashboard-panel visual-card">
          <div className="panel-heading">
            <div>
              <p className="panel-kicker">Traffic</p>
              <h2>Popular Pages</h2>
            </div>
            <span className="panel-pill">{totalTrackedPageViews} tracked visits</span>
          </div>
          <div className="traffic-chart">
            {popularPages.length ? (
              popularPages.map((item) => (
                <div key={item.path} className="traffic-row">
                  <div className="traffic-row-copy">
                    <strong>{formatPath(item.path)}</strong>
                    <span>{item.path}</span>
                  </div>
                  <div className="traffic-bar-track">
                    <div
                      className="traffic-bar-fill"
                      style={{ width: `${Math.max(12, ((item.total || 0) / maxPageViews) * 100)}%` }}
                    />
                  </div>
                  <strong className="traffic-value">{item.total}</strong>
                </div>
              ))
            ) : (
              <p className="dashboard-empty">No visitor data yet.</p>
            )}
          </div>

          <div className="dashboard-traffic-rankings">
            <div className="panel-heading panel-heading-spaced dashboard-secondary-heading">
              <div>
                <h2>Page Rankings</h2>
              </div>
            </div>

            <div className="popular-list professional-popular-list">
              {popularPages.length ? (
                popularPages.map((item, index) => {
                  const share = totalTrackedPageViews ? Math.round(((item.total || 0) / totalTrackedPageViews) * 100) : 0;
                  return (
                    <article key={item.path} className="popular-item popular-item-professional">
                      <span className="popular-rank">{String(index + 1).padStart(2, "0")}</span>
                      <div className="popular-copy">
                        <strong>{formatPath(item.path)}</strong>
                        <span>{share}% of tracked visits</span>
                      </div>
                      <strong className="popular-total">{item.total}</strong>
                    </article>
                  );
                })
              ) : (
                <p className="dashboard-empty">No visitor data yet.</p>
              )}
            </div>
          </div>
        </article>

        <article className="dashboard-panel visual-card">
          <div className="panel-heading">
            <div>
              <p className="panel-kicker">Travelers</p>
              <h2>Booking Composition</h2>
            </div>
            <span className="panel-pill">{travelerTotal} travelers logged</span>
          </div>
          <div className="mix-chart">
            {mixRows.map((row) => (
              <div key={row.label} className="mix-row">
                <div className="mix-row-copy">
                  <span>{row.label}</span>
                  <strong>{row.value}</strong>
                </div>
                <div className="mix-bar-track">
                  <div
                    className={`mix-bar-fill mix-bar-${row.tone}`}
                    style={{ width: `${travelerTotal ? Math.max(10, (row.value / travelerTotal) * 100) : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="traveler-tour-report">
            <div className="traveler-tour-report-heading">
              <strong>Most Selected Tours</strong>
              <span>{selectedTourRows.length ? "Based on submitted bookings" : "No tour selections yet"}</span>
            </div>
            <div className="traveler-tour-report-list">
              {selectedTourRows.length ? (
                selectedTourRows.map((tour) => (
                  <div key={tour.name} className="traveler-tour-row">
                    <div className="traveler-tour-copy">
                      <span>{tour.name}</span>
                      <strong>{tour.total}</strong>
                    </div>
                    <div className="traveler-tour-track">
                      <div
                        className="traveler-tour-fill"
                        style={{ width: `${Math.max(12, (tour.total / maxSelectedTourCount) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="dashboard-empty">No selected tour data yet.</p>
              )}
            </div>
          </div>
        </article>

        <article className="dashboard-panel visual-card">
          <div className="panel-heading">
            <div>
              <p className="panel-kicker">Reviews</p>
              <h2>Ratings Summary</h2>
            </div>
            <span className="panel-pill">{reviews.length} ratings</span>
          </div>
          <div className="rating-summary-header">
            <strong>{averageRating}/5.0</strong>
            <span>Average traveler rating</span>
          </div>
          <div className="rating-summary-chart">
            {ratingCounts.map((row) => (
              <div key={row.rating} className="rating-summary-row">
                <div className="rating-summary-label">
                  <span>{row.rating} star</span>
                </div>
                <div className="rating-summary-track">
                  <div
                    className="rating-summary-fill"
                    style={{ width: `${reviews.length ? Math.max(8, (row.total / maxRatingCount) * 100) : 0}%` }}
                  />
                </div>
                <strong className="rating-summary-value">{row.total}</strong>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="dashboard-metrics">
        <article className="metric-card">
          <span>Total Visitors</span>
          <strong>{dashboardData.visitors ?? 0}</strong>
        </article>
        <article className="metric-card">
          <span>Total Bookings</span>
          <strong>{dashboardData.bookings ?? 0}</strong>
        </article>
        <article className="metric-card">
          <span>Popular Pages Tracked</span>
          <strong>{popularPages.length}</strong>
        </article>
      </section>

      <section className="dashboard-grid">
        <div className="dashboard-panel bookings-panel">
          <div className="panel-heading panel-heading-spaced">
            <div>
              <p className="panel-kicker">Bookings</p>
              <h2>Submitted Booking Details</h2>
            </div>
            <span className="panel-pill">{filteredSortedBookings.length} matching entries</span>
          </div>

          <div className="dashboard-booking-toolbar">
            <label className="dashboard-control-field dashboard-search-field">
              <span>Search</span>
              <input
                type="search"
                value={bookingSearch}
                onChange={(event) => setBookingSearch(event.target.value)}
                placeholder="Search name, email, country, or request"
              />
            </label>
            <label className="dashboard-control-field">
              <span>Sort by</span>
              <select value={bookingSort} onChange={(event) => setBookingSort(event.target.value)}>
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="travel_soon">Travel date: soonest</option>
                <option value="travel_late">Travel date: latest</option>
                <option value="group_high">Largest groups</option>
                <option value="group_low">Smallest groups</option>
                <option value="name_az">Name A-Z</option>
              </select>
            </label>
          </div>

          <div className="dashboard-filter-row" role="group" aria-label="Booking filters">
            <button
              type="button"
              className={`dashboard-filter-chip${bookingFilter === "all" ? " is-active" : ""}`}
              onClick={() => setBookingFilter("all")}
            >
              All bookings
            </button>
            <button
              type="button"
              className={`dashboard-filter-chip${bookingFilter === "upcoming" ? " is-active" : ""}`}
              onClick={() => setBookingFilter("upcoming")}
            >
              Upcoming travel
            </button>
            <button
              type="button"
              className={`dashboard-filter-chip${bookingFilter === "this_month" ? " is-active" : ""}`}
              onClick={() => setBookingFilter("this_month")}
            >
              This month
            </button>
            <button
              type="button"
              className={`dashboard-filter-chip${bookingFilter === "large_groups" ? " is-active" : ""}`}
              onClick={() => setBookingFilter("large_groups")}
            >
              Large groups
            </button>
            <button
              type="button"
              className={`dashboard-filter-chip${bookingFilter === "with_requests" ? " is-active" : ""}`}
              onClick={() => setBookingFilter("with_requests")}
            >
              With requests
            </button>
          </div>

          <div className="dashboard-booking-results-bar">
            <p>
              Showing {filteredSortedBookings.length ? (safeCurrentPage - 1) * BOOKINGS_PER_PAGE + 1 : 0}-
              {Math.min(safeCurrentPage * BOOKINGS_PER_PAGE, filteredSortedBookings.length)} of {filteredSortedBookings.length}
            </p>
            <p>Page {safeCurrentPage} of {totalBookingPages}</p>
          </div>

          <div className="booking-list">
            {paginatedBookings.length ? (
              paginatedBookings.map((booking) => {
                const bookingPackages = parseBookingPackages(booking.extra_requests, booking.group_size || 1);

                return (
                  <article key={booking.id} className="dashboard-booking-card">
                    <div className="dashboard-booking-header">
                      <div>
                        <h3>{booking.name}</h3>
                        <a className="dashboard-email-link" href={`mailto:${booking.email}`}>{booking.email}</a>
                      </div>
                      <div className="dashboard-booking-dates">
                        <span>Travel date</span>
                        <strong>{formatDate(booking.travel_date)}</strong>
                        <small>Submitted {formatDateTime(booking.created_at)}</small>
                      </div>
                    </div>

                    <div className="dashboard-booking-grid">
                      <div>
                        <span>Origin country</span>
                        <strong>{booking.origin_country || "Not provided"}</strong>
                      </div>
                      <div>
                        <span>Group size</span>
                        <strong>{booking.group_size ?? 0}</strong>
                      </div>
                      <div>
                        <span>Adults</span>
                        <strong>{booking.adults ?? 0}</strong>
                      </div>
                      <div>
                        <span>Children</span>
                        <strong>{booking.children ?? 0}</strong>
                      </div>
                      <div>
                        <span>Infants</span>
                        <strong>{booking.infants ?? 0}</strong>
                      </div>
                    </div>

                    <div className="dashboard-booking-note dashboard-booking-tour-note">
                      <span>Selected tours</span>
                      {bookingPackages.tours.length ? (
                        <>
                          <div className="dashboard-booking-tour-list">
                            {bookingPackages.tours.map((tour) => (
                              <article key={tour.name} className="dashboard-booking-tour-item">
                                <strong>{tour.name}</strong>
                                <div className="dashboard-booking-tour-prices">
                                  <span>Base {formatUsd(tour.basePrice)}</span>
                                  <span>Total {formatUsd(tour.totalPrice)}</span>
                                </div>
                              </article>
                            ))}
                          </div>
                          <div className="dashboard-booking-tour-total">
                            <span>Booking total</span>
                            <strong>{formatUsd(bookingPackages.totalPrice)}</strong>
                          </div>
                        </>
                      ) : (
                        <p>No tour packages selected.</p>
                      )}
                    </div>

                    <div className="dashboard-booking-note">
                      <span>Extra requests</span>
                      <p>{bookingPackages.note || "No extra requests submitted."}</p>
                    </div>
                  </article>
                );
              })
            ) : (
              <p className="dashboard-empty">No bookings match the current filters.</p>
            )}
          </div>

          {filteredSortedBookings.length ? (
            <div className="dashboard-pagination">
              <button
                type="button"
                className="dashboard-page-button"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={safeCurrentPage === 1}
              >
                Previous
              </button>
              <div className="dashboard-page-numbers">
                {paginationNumbers.map((pageNumber) => (
                  <button
                    key={pageNumber}
                    type="button"
                    className={`dashboard-page-button${pageNumber === safeCurrentPage ? " is-active" : ""}`}
                    onClick={() => setCurrentPage(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="dashboard-page-button"
                onClick={() => setCurrentPage((page) => Math.min(totalBookingPages, page + 1))}
                disabled={safeCurrentPage === totalBookingPages}
              >
                Next
              </button>
            </div>
          ) : null}
        </div>

        <aside className="dashboard-panel insights-panel">
          <div className="panel-heading panel-heading-spaced dashboard-secondary-heading">
            <div className="dashboard-review-heading">
              <p className="panel-kicker">Reviews</p>
              <h2>Traveler Feedback</h2>
              <div className="dashboard-review-controls" role="group" aria-label="Review sorting options">
                <button
                  type="button"
                  className={`dashboard-icon-button${reviewSort === "newest" ? " is-active" : ""}`}
                  onClick={() => setReviewSort("newest")}
                  title="Newest reviews"
                  aria-label="Newest reviews"
                >
                  {"\u25F7"}
                </button>
                <button
                  type="button"
                  className={`dashboard-icon-button${reviewSort === "highest" ? " is-active" : ""}`}
                  onClick={() => setReviewSort("highest")}
                  title="Highest rated reviews"
                  aria-label="Highest rated reviews"
                >
                  {"\u2605"}
                </button>
                <button
                  type="button"
                  className={`dashboard-icon-button${reviewSort === "lowest" ? " is-active" : ""}`}
                  onClick={() => setReviewSort("lowest")}
                  title="Lowest rated reviews"
                  aria-label="Lowest rated reviews"
                >
                  {"\u2606"}
                </button>
                <button
                  type="button"
                  className={`dashboard-icon-button${reviewSort === "oldest" ? " is-active" : ""}`}
                  onClick={() => setReviewSort("oldest")}
                  title="Oldest reviews"
                  aria-label="Oldest reviews"
                >
                  {"\u21BA"}
                </button>
              </div>
            </div>
          </div>

          <div className="dashboard-review-list">
            {sortedReviews.length ? (
              sortedReviews.map((review) => (
                <article key={review.id} className="dashboard-review-card">
                  <div className="dashboard-review-topline">
                    <strong>{review.title}</strong>
                    <span className="dashboard-review-stars">{formatStars(review.rating)}</span>
                  </div>
                  <p>{review.comment}</p>
                  <div className="dashboard-review-meta">
                    <span>{review.name}</span>
                    <span>{review.trip_type_label || review.trip_type}</span>
                    <span>{review.origin_country || "Traveler"}</span>
                    <span>{formatDate(review.created_at)}</span>
                  </div>
                </article>
              ))
            ) : (
              <p className="dashboard-empty">No reviews yet.</p>
            )}
          </div>
        </aside>
      </section>
    </main>
  );
}

export default DashboardSection;

