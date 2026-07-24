import fbIcon from "../assets/images/FB.png"; // adjust paths accordingly
import linkedLinIcon from "../assets/images/Linkedin.png";
import youTubeIcon from "../assets/images/YT.png";
import instaIcon from "../assets/images/Insta.png";
import { defaultTheme } from "../helpers/defaultTheme";

const imgStyle = {
  width: "40px",
  height: "40px",
  marginLeft: 15,
  marginRight: 15,
  border: `1.5px solid ${defaultTheme.goldColorLogo}`,
  borderRadius: "5px",
  padding: "1px",
};

const SocialMediaLinks = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="text-center mt-4">
      <h5 style={{ color: "white", fontSize: 13 }}>Follow Us On</h5>
      <div>
        <a
          href="https://www.facebook.com/Moneytreerealtyofficial/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src={fbIcon} alt="Facebook" style={imgStyle} />
        </a>

        <a
          href="https://in.linkedin.com/company/moneytree-realty"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src={linkedLinIcon} alt="LinkedIn" style={imgStyle} />
        </a>

        <a
          href="https://youtube.com/@moneytreerealtyofficial?si=Qv5LKI15uHF-Rq4p"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src={youTubeIcon} alt="YouTube" style={imgStyle} />
        </a>

        <a
          href="https://www.instagram.com/moneytreerealtyofficial"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src={instaIcon} alt="Instagram" style={imgStyle} />
        </a>
      </div>
      <div className="mt-2 text-center">
        <p
          className="text-white font-size-12"
          style={{ color: "white" }}
        >
          Copyright © {currentYear}{" "}
          <a
            href="https://moneytreerealty.com"
            style={{ color: "white", textDecoration: "underline" }}
            target="_blank"
            rel="noopener noreferrer"
          >
            Moneytree Realty{" "}
          </a>
          All Rights Reserved.
        </p>
      </div>
    </div>
  );
};

export default SocialMediaLinks;
