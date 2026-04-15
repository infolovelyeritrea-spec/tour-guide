function HeroSection({ hero }) {
  return (
    <section className="hero" id="top">
      <div className="hero-image-frame">
        <div className="hero-image-wrap">
          <img src={hero?.image_url} alt="Scenic coastline and architecture in Eritrea" />
        </div>

        <div className="hero-image-overlay">
          <div className="hero-content-panel">
            <p className="hero-image-kicker">Explore East Africa's hidden coastal jewel</p>
            <h1>{hero?.title}</h1>
            <p className="hero-text">{hero?.subtitle}</p>
            <div className="hero-actions">
              <a href="#booking" className="primary-btn hero-primary-btn">
                Start Planning
              </a>
              <a href="#destinations" className="secondary-btn hero-secondary-btn">
                <span className="hero-secondary-label">View Tour Packages</span>
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
