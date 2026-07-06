import { useEffect, useMemo, useState } from "react";
import Navbar from "./components/Navbar";
import BookingSection from "./sections/BookingSection";
import DashboardSection from "./sections/DashboardSection";
import DestinationsSection from "./sections/DestinationsSection";
import FooterSection from "./sections/FooterSection";
import HeroSection from "./sections/HeroSection";
import MemoriesSection from "./sections/MemoriesSection";
import ReviewsSection from "./sections/ReviewsSection";

const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL?.trim()) || "/api";
const ADMIN_PATH = "/admin";
const PUBLIC_SITE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_PUBLIC_SITE_URL?.trim()) ||
  (window.location.port === "8000"
    ? `${window.location.protocol}//${window.location.hostname}:5173`
    : window.location.origin);
const IMAGE_BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_IMAGE_BASE_URL?.trim()) || PUBLIC_SITE_URL;
const currencies = ["USD", "ERN", "EUR", "GBP"];
let lastTrackedPath = null;

const packageBasePricesUsd = {
  asmara: 0,
  massawa: 0,
  keren: 0,
};

const fallbackDestinations = [
  {
    id: "asmara",
    name: "Asmara",
    region: "Central Eritrea",
    description:
      "A modernist capital with palm-lined boulevards, Italian-era architecture, and an easy cafe rhythm.",
    image_url: "/images/destinations/asmara.webp",
    highlights: ["Fiat Tagliero", "Cinema Impero", "boulevard cafes", "art deco walks"],
    travel_time: "2-3 days"
  },
  {
    id: "massawa",
    name: "Massawa",
    region: "Red Sea Coast",
    description:
      "A sunlit port city of coral-stone buildings, island breezes, and unforgettable Red Sea views.",
    image_url: "/images/destinations/massawa.webp",
    highlights: ["Island promenade", "Ottoman quarter", "snorkeling", "sea sunsets"],
    travel_time: "2 days"
  },
  {
    id: "keren",
    name: "Keren",
    region: "Anseba",
    description:
      "A vibrant market town framed by rugged hills, camel caravans, and living Eritrean traditions.",
    image_url: "/images/destinations/keren.webp",
    highlights: ["Camel market", "Mariam Dearit", "mountain scenery", "local crafts"],
    travel_time: "1-2 days"
  }
];

const additionalFallbackPackages = [];

const fallbackMemories = [
  {
    id: "memory-1",
    title: "Morning Walk in Asmara",
    location: "Asmara",
    description:
      "Golden light across art deco facades, coffee aromas, and calm streets make the city unforgettable.",
    image_url: "/images/memories/one.webp"
  },
  {
    id: "memory-3",
    title: "Mountain Market Day",
    location: "Keren",
    description:
      "Colorful textiles, lively stalls, and community spirit create a deeply local travel experience.",
    image_url: "/images/memories/two.webp"
  },
  
  {
    id: "memory-2",
    title: "Red Sea Escape",
    location: "Massawa",
    description:
      "Historic piers, turquoise water, and warm sea air turn every afternoon into a postcard memory.",
    image_url: "/images/memories/three.webp"
  }
];

const fallbackReviews = [
  {
    id: "review-1",
    name: "Liya",
    origin_country: "Ethiopia",
    title: "Warm hosting and easy planning",
    rating: 5,
    trip_type: "city",
    trip_type_label: "City Break",
    comment: "The planning felt calm from the first message, and our Asmara days were well paced and welcoming.",
    created_at: ""
  },
  {
    id: "review-2",
    name: "Samir",
    origin_country: "Sudan",
    title: "Beautiful coast itinerary",
    rating: 5,
    trip_type: "coast",
    trip_type_label: "Coastal Escape",
    comment: "Massawa was the highlight for us. We appreciated the clear timing, local tips, and thoughtful recommendations.",
    created_at: ""
  },
  {
    id: "review-3",
    name: "Marta",
    origin_country: "Italy",
    title: "Great for family travel",
    rating: 4,
    trip_type: "family",
    trip_type_label: "Family Trip",
    comment: "Our family booking was straightforward, and the team helped us balance city stops with a slower pace for the children.",
    created_at: ""
  }
];

const fallbackHomeData = {
  hero: {
    title: "Discover Eritrea With Confidence",
    subtitle: "Plan memorable cultural, coastal, and city adventures with a simple and welcoming guide.",
    kicker: "Explore East Africa's hidden coastal jewel",
    primary_button: "Start Planning",
    secondary_button: "View Tour Packages",
    image_url: "/images/hero/hero.jpg"
  },
  social_links: [
    { name: "WhatsApp", href: "https://wa.me/2911123456", detail: "+291 1 123 456", icon: "whatsapp" },
    { name: "Instagram", href: "https://instagram.com/lovelyeritrea", detail: "@lovelyeritrea", icon: "instagram" },
    { name: "Facebook", href: "https://facebook.com/lovelyeritrea", detail: "Lovely Eritrea", icon: "facebook" }
  ],
  destinations: fallbackDestinations,
  memories: fallbackMemories,
  stats: { destinations: 3, bookings: 0, visitors: 0 }
};

function normalizeImageUrl(imageUrl) {
  if (!imageUrl) {
    return imageUrl;
  }

  try {
    const parsed = new URL(imageUrl, window.location.origin);
    if (parsed.pathname.startsWith("/images/") || parsed.pathname.startsWith("/media/")) {
      return `${IMAGE_BASE_URL}${parsed.pathname}`;
    }
    return parsed.toString();
  } catch {
    return imageUrl;
  }
}

function normalizeDestination(item) {
  const packageId = item.id || item.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-") || crypto.randomUUID();
  return {
    ...item,
    id: packageId,
    image_url: normalizeImageUrl(item.image_url),
    gallery_images: (item.gallery_images || []).map(normalizeImageUrl),
    price_usd: item.price_usd ?? packageBasePricesUsd[packageId] ?? 150
  };
}

function ensurePackageCatalog(items) {
  const unique = new Map();
  [...items, ...additionalFallbackPackages].forEach((item) => {
    const normalized = normalizeDestination(item);
    if (!unique.has(normalized.id)) {
      unique.set(normalized.id, normalized);
    }
  });
  return Array.from(unique.values());
}

function normalizeMemory(item) {
  return {
    ...item,
    image_url: normalizeImageUrl(item.image_url)
  };
}

function normalizeHomeData(data) {
  const source = data || fallbackHomeData;
  const sourceDestinations = source.destinations || fallbackDestinations;
  const normalizedDestinations =
    source === fallbackHomeData ? ensurePackageCatalog(sourceDestinations) : sourceDestinations.map(normalizeDestination);

  return {
    ...source,
    hero: {
      ...fallbackHomeData.hero,
      ...source.hero,
      image_url: normalizeImageUrl(source.hero?.image_url || fallbackHomeData.hero.image_url)
    },
    destinations: normalizedDestinations,
    memories: (source.memories || fallbackMemories).map(normalizeMemory),
    social_links: source.social_links || fallbackHomeData.social_links
  };
}

function normalizeReview(review) {
  return {
    ...review,
    rating: Number(review.rating) || 5,
    trip_type_label: review.trip_type_label || "Custom Itinerary"
  };
}

function extractApiError(payload, fallbackMessage) {
  if (!payload || typeof payload !== "object") {
    return fallbackMessage;
  }

  if (typeof payload.detail === "string" && payload.detail.trim()) {
    return payload.detail;
  }

  if (Array.isArray(payload.non_field_errors) && payload.non_field_errors[0]) {
    return payload.non_field_errors[0];
  }

  const firstFieldError = Object.values(payload).find((value) => Array.isArray(value) && value[0]);
  if (firstFieldError) {
    return firstFieldError[0];
  }

  const firstStringError = Object.values(payload).find((value) => typeof value === "string" && value.trim());
  if (firstStringError) {
    return firstStringError;
  }

  return fallbackMessage;
}

function getCookie(name) {
  const cookie = document.cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${name}=`));
  return cookie ? decodeURIComponent(cookie.slice(name.length + 1)) : "";
}

async function ensureCsrfToken() {
  await fetch(API_BASE + "/csrf/", {
    credentials: "include"
  });
  return getCookie("csrftoken");
}

const copy = {
  home: "Home",
  destinations: "Top Tour Packages",
  about: "About",
  currency: "Currency",
  priceFrom: "From",
  destinationsViewMore: "View more tour packages",
  destinationsViewLess: "Show fewer packages",
  destinationsEyebrow: "Tour Packages",
  destinationsLead:
    "Compare curated Eritrea experiences, add your favorites to cart, and carry them straight into booking.",
  memoriesEyebrow: "Recent Memories",
  memoriesTitle: "Moments Travelers Love Across Eritrea",
  addToCart: "Add to cart",
  removeFromCart: "Remove",
  bookingCartTitle: "Selected tour packages",
  bookingCartSubtitle: "Review your tour picks before sending your booking.",
  bookingCartEmpty: "No tour packages selected yet. Add packages above to see them here before booking.",
  estimatedTotal: "Estimated total",
  basePrice: "Base price",
  perTraveler: "per traveler",
  totalTravelers: "Travelers",
  packageCount: "Packages",
  planningTitle: "Build your Eritrea itinerary",
  planningText:
    "Pick the tour packages you want, review the live estimate, and complete one simple booking form for your preferred travel dates.",
  aboutTitle: "About Lovely Eritrea",
  aboutText:
    "We help curious travelers explore Eritrea through welcoming city stays, Red Sea escapes, and cultural day tours with clear booking support.",
  contactTitle: "Contact Information",
  contactDetails: [
    "Phone: +291 1 123 456",
    "Email: hello@eritreatourguide.com",
    "Address: Harnet Avenue, Asmara, Eritrea"
  ],
  bookingTitle: "Plan and Book Your Tour",
  bookingSuccess: "Your booking has been sent successfully.",
  reviewsTitle: "Traveler Reviews & Comments",
  reviewsSubtitle:
    "Read recent feedback from visitors, then leave your own short review to help future travelers plan with confidence.",
  reviewSuccess: "Your review has been shared successfully.",
  form: {
    name: "Full name",
    email: "Email address",
    origin: "Country of origin",
    groupSize: "Number of people",
    adults: "Adults",
    children: "Children",
    infants: "Infants",
    date: "Travel date",
    extra: "Extra tour requests",
    submit: "Reserve My Tour",
    groupMismatch: "Total people must equal adults + children + infants.",
    submitError: "We could not send your booking right now.",
    packageNote: "Selected packages will be included with your booking request."
  },
  reviewsForm: {
    formTitle: "Share your experience",
    formSubtitle: "A few thoughtful details help other travelers know what to expect.",
    displayTitle: "What visitors are saying",
    name: "Your name",
    origin: "Country of origin",
    tripType: "Trip type",
    rating: "Rating",
    title: "Review title",
    titlePlaceholder: "What stood out most?",
    comment: "Comment",
    commentPlaceholder: "Share a short review about the planning, guides, pacing, destinations, or overall experience.",
    submit: "Post Review",
    submitting: "Posting...",
    submitError: "We could not share your review right now."
  }
};

function App() {
  const [currency, setCurrency] = useState("USD");
  const [homeData, setHomeData] = useState(() => normalizeHomeData(fallbackHomeData));
  const [destinations, setDestinations] = useState(() => normalizeHomeData(fallbackHomeData).destinations);
  const [memories, setMemories] = useState(() => normalizeHomeData(fallbackHomeData).memories);
  const [reviews, setReviews] = useState(() => fallbackReviews.map(normalizeReview));
  const [selectedPackageIds, setSelectedPackageIds] = useState([]);
  const [bookingMessage, setBookingMessage] = useState("");
  const [bookingConfirmation, setBookingConfirmation] = useState(null);
  const [reviewMessage, setReviewMessage] = useState("");
  const [dashboardData, setDashboardData] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });

  const text = useMemo(() => ({ ...copy, ...(homeData?.copy || {}) }), [homeData]);
  const pathname = window.location.pathname;
  const isAdmin = pathname === ADMIN_PATH;

  const selectedPackages = useMemo(
    () => destinations.filter((item) => selectedPackageIds.includes(item.id)),
    [destinations, selectedPackageIds]
  );

  useEffect(() => {
    if (lastTrackedPath === pathname) {
      return;
    }

    lastTrackedPath = pathname;
    fetch(API_BASE + "/track-visitor/", {
      method: "POST",
      credentials: "omit",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname })
    }).catch(() => undefined);
  }, [pathname]);

  useEffect(() => {
    if (isAdmin) {
      return;
    }

    let cancelled = false;

    const applyHomeData = (payload) => {
      if (cancelled) {
        return;
      }

      const normalizedData = normalizeHomeData(payload);
      setHomeData(normalizedData);
      setDestinations(normalizedData.destinations);
      setMemories(normalizedData.memories);
      setSelectedPackageIds((current) => current.filter((id) => normalizedData.destinations.some((item) => item.id === id)));
    };

    fetch(API_BASE + "/home/", { credentials: "omit" })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Home data request failed");
        }

        return response.json();
      })
      .then(applyHomeData)
      .catch(() => {
        applyHomeData(fallbackHomeData);
      });

    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      return;
    }

    let cancelled = false;

    fetch(API_BASE + "/reviews/", { credentials: "omit" })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Reviews request failed");
        }

        return response.json();
      })
      .then((payload) => {
        if (!cancelled) {
          setReviews((payload || []).map(normalizeReview));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setReviews(fallbackReviews.map(normalizeReview));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  const togglePackageSelection = (packageId) => {
    setSelectedPackageIds((current) =>
      current.includes(packageId) ? current.filter((id) => id !== packageId) : [...current, packageId]
    );
  };

  const submitBooking = async (formData) => {
    setBookingMessage("");
    setBookingConfirmation(null);

    const selectedPackageSnapshot = selectedPackages.map((item) => ({
      id: item.id,
      name: item.name,
      region: item.region,
      price_usd: item.price_usd || 0,
      image_url: item.image_url
    }));
    const estimatedTotalUsd =
      selectedPackageSnapshot.reduce((sum, item) => sum + (item.price_usd || 0), 0) *
      Math.max(1, Number(formData.group_size) || 1);

    const response = await fetch(API_BASE + "/bookings/", {
      method: "POST",
      credentials: "omit",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formData,
        selected_package_ids: selectedPackageSnapshot.map((item) => item.id)
      })
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(extractApiError(payload, text.form.submitError));
    }

    const createdBooking = await response.json();
    setBookingMessage(
      createdBooking.email_sent
        ? `${text.bookingSuccess} A confirmation email has been sent to ${createdBooking.email}.`
        : `${text.bookingSuccess} We could not send the confirmation email right now, but your booking was received.`
    );
    setBookingConfirmation({
      ...createdBooking,
      selected_packages: createdBooking.selected_packages || selectedPackageSnapshot,
      estimated_total_usd: createdBooking.estimated_total_usd ?? estimatedTotalUsd
    });
    setSelectedPackageIds([]);
  };

  const submitReview = async (formData) => {
    setReviewMessage("");

    const response = await fetch(API_BASE + "/reviews/create/", {
      method: "POST",
      credentials: "omit",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(extractApiError(payload, text.reviewsForm.submitError));
    }

    const createdReview = normalizeReview(await response.json());
    setReviews((current) => [createdReview, ...current]);
    setReviewMessage(text.reviewSuccess);
  };

  const handleLoginChange = (event) => {
    const { name, value } = event.target;
    setLoginForm((current) => ({ ...current, [name]: value }));
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoginLoading(true);
    setLoginError("");

    try {
      const csrfToken = await ensureCsrfToken();
      const response = await fetch(API_BASE + "/admin-login/", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", "X-CSRFToken": csrfToken },
        body: JSON.stringify(loginForm)
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.detail || "Login failed");
      }

      const dashboardResponse = await fetch(API_BASE + "/dashboard/", {
        credentials: "include"
      });

      if (!dashboardResponse.ok) {
        throw new Error("Dashboard request failed after login");
      }

      const dashboardPayload = await dashboardResponse.json();
      setDashboardData(dashboardPayload);
      setLoginForm({ username: "", password: "" });
    } catch (error) {
      setDashboardData(null);
      setLoginError(
        error instanceof TypeError
          ? "We could not reach the admin service. Make sure the backend is running and try again."
          : error.message || "Unable to sign in."
      );
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    const csrfToken = await ensureCsrfToken();
    await fetch(API_BASE + "/admin-logout/", {
      method: "POST",
      credentials: "include",
      headers: { "X-CSRFToken": csrfToken }
    }).catch(() => undefined);

    setDashboardData(null);
    setLoginError("");
  };

  if (isAdmin) {
    return (
      <DashboardSection
        dashboardData={dashboardData}
        dashboardLoading={dashboardLoading}
        loginError={loginError}
        loginForm={loginForm}
        loginLoading={loginLoading}
        onLoginChange={handleLoginChange}
        onLogin={handleLogin}
        onLogout={handleLogout}
        publicSiteUrl={PUBLIC_SITE_URL}
      />
    );
  }

  return (
    <>
      <div className="site-header">
        <Navbar
          labels={text}
          currency={currency}
          currencies={currencies}
          onCurrencyChange={setCurrency}
          logoUrl={`${IMAGE_BASE_URL}/images/logo/logo.png`}
          socialLinks={homeData.social_links}
        />
      </div>
      <div className="page-shell">
        <HeroSection hero={homeData?.hero} />
        <MemoriesSection items={memories} eyebrow={text.memoriesEyebrow} title={text.memoriesTitle} />
        <DestinationsSection
          id="destinations"
          title={text.destinations}
          eyebrow={text.destinationsEyebrow}
          lead={text.destinationsLead}
          items={destinations}
          currency={currency}
          priceLabel={text.priceFrom}
          addToCartLabel={text.addToCart}
          removeFromCartLabel={text.removeFromCart}
          viewMoreLabel={text.destinationsViewMore}
          viewLessLabel={text.destinationsViewLess}
          selectedPackageIds={selectedPackageIds}
          onTogglePackage={togglePackageSelection}
        />
        <BookingSection
          id="booking"
          title={text.bookingTitle}
          planningTitle={text.planningTitle}
          planningText={text.planningText}
          labels={text.form}
          message={bookingMessage}
          confirmation={bookingConfirmation}
          onSubmit={submitBooking}
          selectedPackages={selectedPackages}
          currency={currency}
          cartTitle={text.bookingCartTitle}
          cartSubtitle={text.bookingCartSubtitle}
          cartEmptyLabel={text.bookingCartEmpty}
          estimatedTotalLabel={text.estimatedTotal}
          basePriceLabel={text.basePrice}
          perTravelerLabel={text.perTraveler}
          totalTravelersLabel={text.totalTravelers}
          packageCountLabel={text.packageCount}
        />
        <ReviewsSection
          id="reviews"
          title={text.reviewsTitle}
          subtitle={text.reviewsSubtitle}
          labels={text.reviewsForm}
          reviews={reviews}
          message={reviewMessage}
          onSubmit={submitReview}
        />
        <FooterSection
          id="about"
          aboutTitle={text.aboutTitle}
          aboutText={text.aboutText}
          contactTitle={text.contactTitle}
          contactDetails={text.contactDetails}
          socialLinks={homeData.social_links}
        />
      </div>
    </>
  );
}

export default App;


