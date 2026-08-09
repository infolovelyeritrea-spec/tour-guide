import { useEffect, useMemo, useState } from "react";

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

function PackageCard({
  item,
  currency,
  priceLabel,
  addToCartLabel,
  removeFromCartLabel,
  isSelected,
  isGalleryActive,
  onTogglePackage,
  onShowGallery,
  t
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
        aria-label={t.galleryViewAriaLabelTemplate.replace("{name}", item.name)}
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
          <span className="package-gallery-pill">{t.galleryViewLabel}</span>
        </div>
      </button>
      <div className="tour-card-body package-card-body">
        <div className="card-topline">
          <h3>{item.name}</h3>
          <span className="package-region-pill">{item.region}</span>
        </div>
        <p className="tour-price">{priceLabel}: {formatPrice(currency, item.price_usd ?? 150)}</p>
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
  eyebrow,
  lead,
  items,
  currency,
  priceLabel,
  addToCartLabel,
  removeFromCartLabel,
  viewMoreLabel,
  viewLessLabel,
  selectedPackageIds,
  onTogglePackage,
  t
}) {
  const [showAllPackages, setShowAllPackages] = useState(false);
  const [activeGalleryId, setActiveGalleryId] = useState(null);

  const itemsWithGallery = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        galleryImages: item.gallery_images?.length ? item.gallery_images : [item.image_url]
      })),
    [items]
  );

  const visibleItems = itemsWithGallery.slice(0, 3);
  const extendedItems = itemsWithGallery.slice(3);
  const hasMorePackages = extendedItems.length > 0;
  const activeGalleryPackage = itemsWithGallery.find((item) => item.id === activeGalleryId) || null;

  useEffect(() => {
    if (!activeGalleryPackage) {
      return;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setActiveGalleryId(null);
      }
    };

    document.body.classList.add("has-gallery-modal");
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.classList.remove("has-gallery-modal");
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeGalleryPackage]);

  const handleShowGallery = (packageId) => {
    setActiveGalleryId(packageId);
  };

  const handleCloseGallery = () => {
    setActiveGalleryId(null);
  };

  return (
    <section className="content-section packages-section" id={id}>
      <div className="section-heading packages-heading">
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        <p className="muted package-lead">
          {lead}
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
            t={t}
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
              t={t}
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
        <div className="package-gallery-modal" role="dialog" aria-modal="true" aria-labelledby="package-gallery-title">
          <button
            type="button"
            className="package-gallery-backdrop"
            onClick={handleCloseGallery}
            aria-label={t.galleryCloseAriaLabel}
          />
          <div className="package-gallery-dialog">
            <button
              type="button"
              className="package-gallery-close"
              onClick={handleCloseGallery}
              aria-label={t.galleryCloseAriaLabel}
            >
              {"\u00d7"}
            </button>
            <div className="package-gallery-showcase">
              <div className="package-gallery-copy">
                <p className="eyebrow">{t.galleryEyebrow}</p>
                <h3 id="package-gallery-title">{activeGalleryPackage.name}</h3>
                <p>
                  {activeGalleryPackage.description}
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
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default DestinationsSection;

