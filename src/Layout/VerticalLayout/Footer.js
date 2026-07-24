import { Container, Row, Col } from "reactstrap";
import { defaultTheme } from "../../helpers/defaultTheme";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="footer">
      <Container fluid={true}>
        <Row>
          <Col
            xs={12}
            sm={6}
            className="text-center text-sm-start"
            style={{ color: defaultTheme.primary, fontWeight: "bold" }}
          >
            Copyright © {currentYear}
          </Col>
          <Col
            xs={12}
            sm={6}
            className="text-center text-sm-end"
            style={{ color: defaultTheme.primary, fontWeight: "bold" }}
          >
            <a
              href="https://moneytreerealty.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Moneytree Realty{" "}
            </a>
            
            All rights reserved.
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
