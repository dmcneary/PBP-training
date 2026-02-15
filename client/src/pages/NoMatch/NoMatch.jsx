import React from "react";
import { Col, Row, Container } from "../../components/Grid";

const NoMatch = () => (
  <Container fluid>
    <Row>
      <Col size="md-12">
        <div className = "mr-auto">
          <h1>Doing a little off-roading?</h1>
          <h3>Sorry, that page was not found.</h3>
        </div>
      </Col>
    </Row>
  </Container>
);

export default NoMatch;
