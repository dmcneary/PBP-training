import React from 'react';
import './Dashboard.css';
import Jumbotron from "../../components/Jumbotron";
import RecentActivities from "../../components/RecentActivities";
import Totals from "../../components/Totals";
import { Col, Row, Container } from "../../components/Grid";

const Dashboard = (props) => {
  return(
    <Container fluid>
      <Row>
        <Col size="8">
          <Jumbotron>
            <RecentActivities username={props.username}/>
          </Jumbotron>
        </Col>
        {/*<Col size="4">
          <Totals />
        </Col>*/}
      </Row>
    </Container>
  );
}

  export default Dashboard;