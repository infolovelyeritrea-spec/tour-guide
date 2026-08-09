import { useState } from "react";

function Navbar({
  labels,
  currency,
  currencies,
  onCurrencyChange,
  language,
  languages,
  onLanguageChange,
  logoUrl
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen((current) => !current);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header className="navbar">
      <div className="navbar-topbar">
        <div className="brand-zone">
          <a href="#top" className="brand" aria-label={labels.homeAriaLabel} onClick={closeMenu}>
            <span className="brand-mark" aria-hidden="true">
              <img className="brand-logo" src={logoUrl} alt="" />
            </span>
            <strong className="brand-copy">Lovely Eritrea</strong>
          </a>
        </div>

        <button
          type="button"
          className="menu-toggle"
          aria-expanded={menuOpen}
          aria-label={labels.toggleNavAriaLabel}
          onClick={toggleMenu}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <div className={`navbar-stack${menuOpen ? " is-open" : ""}`}>
        <nav className="nav-links">
          <a href="#destinations" onClick={closeMenu}>{labels.navDestinations}</a>
          <a href="#reviews" onClick={closeMenu}>{labels.navReviews}</a>
          <a href="#about" onClick={closeMenu}>{labels.navAbout}</a>
        </nav>
        <div className="nav-actions">
          <label className="nav-select-field">
            <span className="visually-hidden">{labels.languageLabel}</span>
            <select
              value={language}
              onChange={(event) => onLanguageChange(event.target.value)}
              aria-label={labels.languageLabel}
            >
              {languages.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="nav-select-field">
            <span className="visually-hidden">{labels.currency}</span>
            <select
              value={currency}
              onChange={(event) => onCurrencyChange(event.target.value)}
              aria-label={labels.currency}
            >
              {currencies.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <a href="#booking" className="primary-btn nav-cta" onClick={closeMenu}>
            {labels.bookNow}
          </a>
        </div>
      </div>
    </header>
  );
}

export default Navbar;


