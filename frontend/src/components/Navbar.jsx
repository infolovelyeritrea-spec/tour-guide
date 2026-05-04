import { useState } from "react";

const socialIcons = {
  whatsapp: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.52 3.48A11.8 11.8 0 0 0 12.06 0C5.57 0 .29 5.27.29 11.77c0 2.07.54 4.09 1.56 5.86L0 24l6.57-1.72a11.73 11.73 0 0 0 5.49 1.4h.01c6.49 0 11.77-5.28 11.77-11.77 0-3.14-1.22-6.08-3.32-8.43ZM12.07 21.6h-.01a9.74 9.74 0 0 1-4.96-1.36l-.36-.21-3.9 1.02 1.04-3.8-.23-.39a9.72 9.72 0 0 1-1.49-5.11c0-5.38 4.38-9.76 9.77-9.76 2.61 0 5.06 1.01 6.91 2.86a9.7 9.7 0 0 1 2.85 6.9c0 5.39-4.38 9.77-9.76 9.77Zm5.35-7.34c-.29-.14-1.74-.86-2.01-.96-.27-.1-.47-.14-.67.14-.19.29-.76.96-.93 1.15-.17.19-.34.22-.63.07-.29-.14-1.21-.45-2.31-1.44-.85-.76-1.43-1.71-1.6-2-.17-.29-.02-.45.12-.6.13-.13.29-.34.43-.51.14-.17.19-.29.29-.48.09-.19.05-.36-.02-.51-.08-.14-.67-1.61-.92-2.2-.24-.57-.48-.49-.67-.5h-.57c-.19 0-.5.07-.76.36-.27.29-1.02 1-1.02 2.44s1.05 2.84 1.19 3.03c.14.19 2.05 3.14 4.96 4.4.69.3 1.23.48 1.65.61.69.22 1.31.19 1.81.12.55-.08 1.74-.71 1.99-1.39.25-.69.25-1.28.17-1.4-.08-.12-.27-.19-.56-.33Z" />
    </svg>
  ),
  instagram: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.8A3.95 3.95 0 0 0 3.8 7.75v8.5a3.95 3.95 0 0 0 3.95 3.95h8.5a3.95 3.95 0 0 0 3.95-3.95v-8.5a3.95 3.95 0 0 0-3.95-3.95h-8.5Zm8.96 1.35a1.09 1.09 0 1 1 0 2.18 1.09 1.09 0 0 1 0-2.18ZM12 6.5A5.5 5.5 0 1 1 6.5 12 5.51 5.51 0 0 1 12 6.5Zm0 1.8A3.7 3.7 0 1 0 15.7 12 3.7 3.7 0 0 0 12 8.3Z" />
    </svg>
  ),
  facebook: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M13.5 22v-8.25h2.77l.42-3.22H13.5V8.48c0-.93.26-1.56 1.59-1.56h1.7V4.04c-.29-.04-1.29-.12-2.45-.12-2.42 0-4.08 1.48-4.08 4.19v2.42H7.5v3.22h2.76V22h3.24Z" />
    </svg>
  )
};

const fallbackSocialLinks = [
  {
    name: "WhatsApp",
    href: "https://wa.me/2911123456",
    icon: "whatsapp"
  },
  {
    name: "Instagram",
    href: "https://instagram.com/lovelyeritrea",
    icon: "instagram"
  },
  {
    name: "Facebook",
    href: "https://facebook.com/lovelyeritrea",
    icon: "facebook"
  }
];

function Navbar({ labels, currency, currencies, onCurrencyChange, logoUrl, socialLinks = fallbackSocialLinks }) {
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
          <a href="#top" className="brand" aria-label="Lovely Eritrea home" onClick={closeMenu}>
            <span className="brand-mark" aria-hidden="true">
              <img className="brand-logo" src={logoUrl} alt="" />
            </span>
            <span className="brand-copy">
              <strong>Lovely Eritrea</strong>
              <span>Coast, culture, and calm journeys</span>
            </span>
          </a>
        </div>

        <button
          type="button"
          className="menu-toggle"
          aria-expanded={menuOpen}
          aria-label="Toggle navigation"
          onClick={toggleMenu}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <div className="social-strip" aria-label="Social media links">
        {socialLinks.map((item) => (
          <a
            key={item.name}
            className="social-link"
            href={item.href}
            target="_blank"
            rel="noreferrer"
            aria-label={item.name}
            title={item.name}
          >
            {socialIcons[item.icon] || socialIcons.facebook}
          </a>
        ))}
      </div>

      <div className={`navbar-stack${menuOpen ? " is-open" : ""}`}>
        <nav className="nav-links">
          <a href="#top" onClick={closeMenu}>{labels.home}</a>
          <a href="#destinations" onClick={closeMenu}>{labels.destinations}</a>
          <a href="#about" onClick={closeMenu}>{labels.about}</a>
        </nav>
        <div className="nav-actions">
          <label className="nav-select-field">
            <span>{labels.currency}</span>
            <select value={currency} onChange={(event) => onCurrencyChange(event.target.value)}>
              {currencies.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </header>
  );
}

export default Navbar;


