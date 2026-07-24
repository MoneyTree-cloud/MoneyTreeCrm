import { Row, Col, Card } from 'reactstrap';
import { FaCheck } from 'react-icons/fa';
import './SuccessCard.css';
import { assetImageBaseUrl } from '../../helpers/api_helper';

const SuccessCard = ({ candidateData, title, message }) => {
  const fullName = `${candidateData.firstName}`.trim();
  const currentYear = new Date().getFullYear();

  return (
    <div className="success-container d-flex justify-content-center align-items-center vh-100 p-0">
      <Card className="success-card text-center p-0">
        <div className="confirmation-header py-3">
          <img src={assetImageBaseUrl + "logo.png"} alt="MoneyTree Realty Logo" />
        </div>
        <div className="confirmation-body p-4">
          <Row className="justify-content-center">
            <Col xs={12}>
              <div className="check-icon-container mb-4">
                <FaCheck className="check-icon" size={70} />
              </div>
              <h2 className="confirmation-title mb-3">THANK YOU, <span className="user-name">{fullName.toUpperCase()}</span>!</h2>
              <h4 className="confirmation-subtitle mb-3 text-uppercase">
                {title} Successfully
              </h4>
              <p className="confirmation-message">
                {message}
              </p>
            </Col>
          </Row>
        </div>
        <div className="confirmation-footer">
          <div className="footer-logo">MoneyTree Realty</div>
          <p>Growing Opportunities, Building Communities</p>
          <div className="disclaimer">
            <i>
              For any questions, please contact <a href="mailto: career@moneytreerealty.com">career@moneytreerealty.com</a><br />
              © {currentYear} MoneyTree Realty. All rights reserved.
            </i>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SuccessCard;
