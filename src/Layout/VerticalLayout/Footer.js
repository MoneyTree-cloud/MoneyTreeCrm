
const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="footer mt-footer">
      <span>Copyright © {currentYear}</span>
      <span>
        <a
          className="mt-footer__brand"
          href="https://moneytreerealty.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          MoneyTree Realty
        </a>
        . All rights reserved.
      </span>
    </footer>
  );
};

export default Footer;
