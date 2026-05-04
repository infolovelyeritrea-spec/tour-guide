function HeroSection({ hero }) {
  return (
    <section className="hero" id="top">
      <div className="hero-image-frame">
        <div className="hero-image-wrap">
          <img src={hero?.image_url} alt="Scenic coastline and architecture in Eritrea" />
        </div>

        <div className="hero-image-overlay">
          <div className="hero-content-panel">
            <p className="hero-image-kicker">{hero?.kicker}</p>
            <h1>{hero?.title}</h1>
            <p className="hero-text">{hero?.subtitle}</p>
            <div className="hero-actions">
              <a href="#booking" className="primary-btn hero-primary-btn">
                {hero?.primary_button}
              </a>
              <a href="#destinations" className="secondary-btn hero-secondary-btn">
                <span className="hero-secondary-label">{hero?.secondary_button}</span>
                <span className="hero-secondary-arrow" aria-hidden="true">{"\u2192"}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
