import { useEffect, useMemo, useRef, useState } from "react";

const currencyConfig = {
  USD: { symbol: "$", rate: 1, decimals: 0 },
  EUR: { symbol: "EUR ", rate: 0.92, decimals: 0 },
  GBP: { symbol: "GBP ", rate: 0.79, decimals: 0 },
  ERN: { symbol: "Nfk ", rate: 15, decimals: 0 }
};

const packageGalleryFolders = ["one", "two", "three", "four", "five", "six", "seven"];
const packageGalleryFiles = {
  one: ["gallery1.webp", "gallery2.webp", "gallery3.webp", "gallery4.webp", "gallery5.webp", "gallery6.webp"],
  two: ["gallery31.webp", "gallery32.webp", "gallery33.webp", "gallery34.webp", "gallery35.webp", "gallery36.webp"],
  three: ["gallery52.webp", "gallery53.webp", "gallery54.webp", "gallery55.webp", "gallery56.webp", "gallery57.webp"],
  four: ["gallery109.webp", "gallery110.webp", "gallery111.webp", "gallery112.webp", "gallery113.webp", "gallery114.webp"],
  five: ["gallery137.webp", "gallery138.webp", "gallery139.webp", "gallery140.webp", "gallery141.webp", "gallery142.webp"],
  six: ["gallery171.webp", "gallery172.webp", "gallery173.webp", "gallery176.webp", "gallery177.webp", "gallery178.webp"],
  seven: ["gallery201.webp", "gallery202.webp", "gallery203.webp", "gallery204.webp", "gallery205.webp", "gallery206.webp"]
};

function formatPrice(currency, amountUsd) {
  const config = currencyConfig[currency] || currencyConfig.USD;
  const amount = amountUsd * config.rate;
  return `${config.symbol}${amount.toFixed(config.decimals)}`;
}

function PackageCard({
  item,
  currency,
  priceLabel,
  addToCartLabel,
  removeFromCartLabel,
  isSelected,
  isGalleryActive,
  onTogglePackage,
  onShowGallery
}) {
  const previewImages = item.galleryImages?.slice(0, 4) || [item.image_url];
  const mainImage = previewImages[0] || item.image_url;
  const thumbnailImages = previewImages.slice(1, 4);

  return (
    <article className="tour-card package-card" key={item.id}>
      <button
        type="button"
        className={`package-image-button${isGalleryActive ? " is-active" : ""}`}
        onClick={() => onShowGallery(item.id)}
        aria-label={`View ${item.name} gallery`}
      >
        <div className="package-image-mosaic">
          <div className="package-image-main">
            <img src={mainImage} alt={item.name} />
          </div>
          <div className="package-image-thumbs">
            {thumbnailImages.map((imageUrl, index) => (
              <div className="package-image-thumb" key={imageUrl}>
                <img src={imageUrl} alt={`${item.name} preview ${index + 2}`} />
              </div>
            ))}
          </div>
          <span className="package-duration-badge">{item.travel_time}</span>
          <span className="package-gallery-pill">View gallery</span>
        </div>
      </button>
      <div className="tour-card-body package-card-body">
        <div className="card-topline">
          <h3>{item.name}</h3>
          <span className="package-region-pill">{item.region}</span>
        </div>
        <p className="tour-price">{priceLabel}: {formatPrice(currency, item.price_usd || 150)}</p>
        <p>{item.description}</p>
        <div className="tag-row">
          {item.highlights?.map((highlight) => (
            <span key={highlight}>{highlight}</span>
          ))}
        </div>
        <button
          type="button"
          className={`package-cart-button${isSelected ? " is-selected" : ""}`}
          onClick={() => onTogglePackage(item.id)}
        >
          {isSelected ? removeFromCartLabel : addToCartLabel}
        </button>
      </div>
    </article>
  );
}

function DestinationsSection({
  id,
  title,
  items,
  currency,
  priceLabel,
  addToCartLabel,
  removeFromCartLabel,
  viewMoreLabel,
  viewLessLabel,
  selectedPackageIds,
  onTogglePackage
}) {
  const [showAllPackages, setShowAllPackages] = useState(false);
  const [activeGalleryId, setActiveGalleryId] = useState(items[0]?.id || null);
  const [shouldFocusGallery, setShouldFocusGallery] = useState(false);
  const galleryRef = useRef(null);

  const itemsWithGallery = useMemo(
    () =>
      items.map((item, index) => {
        const folder = packageGalleryFolders[index];
        const galleryImages = folder
          ? (packageGalleryFiles[folder] || []).map((file) => `/images/tour-packages/${folder}/${file}`)
          : [];

        return {
          ...item,
          galleryImages
        };
      }),
    [items]
  );

  const visibleItems = itemsWithGallery.slice(0, 3);
  const extendedItems = itemsWithGallery.slice(3);
  const hasMorePackages = extendedItems.length > 0;
  const activeGalleryPackage = itemsWithGallery.find((item) => item.id === activeGalleryId) || itemsWithGallery[0] || null;

  useEffect(() => {
    if (!shouldFocusGallery || !galleryRef.current) {
      return;
    }

    galleryRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    setShouldFocusGallery(false);
  }, [activeGalleryId, shouldFocusGallery]);

  const handleShowGallery = (packageId) => {
    setActiveGalleryId(packageId);
    setShouldFocusGallery(true);
  };

  return (
    <section className="content-section packages-section" id={id}>
      <div className="section-heading packages-heading">
        <p className="eyebrow">Tour Packages</p>
        <h2>{title}</h2>
        <p className="muted package-lead">
          Compare curated Eritrea experiences, add your favorites to cart, and carry them straight into booking.
        </p>
      </div>

      <div className="card-grid package-grid">
        {visibleItems.map((item) => (
          <PackageCard
            key={item.id}
            item={item}
            currency={currency}
            priceLabel={priceLabel}
            addToCartLabel={addToCartLabel}
            removeFromCartLabel={removeFromCartLabel}
            isSelected={selectedPackageIds.includes(item.id)}
            isGalleryActive={activeGalleryPackage?.id === item.id}
            onTogglePackage={onTogglePackage}
            onShowGallery={handleShowGallery}
          />
        ))}
      </div>

      {showAllPackages && extendedItems.length ? (
        <div className="card-grid package-grid more-packages-grid">
          {extendedItems.map((item) => (
            <PackageCard
              key={item.id}
              item={item}
              currency={currency}
              priceLabel={priceLabel}
              addToCartLabel={addToCartLabel}
              removeFromCartLabel={removeFromCartLabel}
              isSelected={selectedPackageIds.includes(item.id)}
              isGalleryActive={activeGalleryPackage?.id === item.id}
              onTogglePackage={onTogglePackage}
              onShowGallery={handleShowGallery}
            />
          ))}
        </div>
      ) : null}

      {hasMorePackages ? (
        <div className="more-packages-action more-packages-action-above-gallery">
          <button
            type="button"
            className="more-packages-button"
            onClick={() => setShowAllPackages((current) => !current)}
          >
            {showAllPackages ? viewLessLabel : viewMoreLabel}
          </button>
        </div>
      ) : null}

      {activeGalleryPackage?.galleryImages?.length ? (
        <div className="package-gallery-showcase" ref={galleryRef} tabIndex="-1">
          <div className="package-gallery-copy">
            <p className="eyebrow">Package Gallery</p>
            <h3>{activeGalleryPackage.name}</h3>
            <p>
              A closer look at the atmosphere, stops, and scenery included in this tour package.
            </p>
          </div>
          <div className="package-gallery-grid">
            {activeGalleryPackage.galleryImages.map((imageUrl, index) => (
              <article key={imageUrl} className={`package-gallery-card${index === 0 ? " is-featured" : ""}`}>
                <img src={imageUrl} alt={`${activeGalleryPackage.name} gallery ${index + 1}`} />
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default DestinationsSection;

