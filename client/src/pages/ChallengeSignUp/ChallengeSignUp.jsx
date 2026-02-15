import React, { Component } from "react";
import Alert from "../../components/Alert"
import ChallengeForm from "../../components/ChallengeForm"
import { Input } from "../../components/Form";
import { Col, Row, Container } from "../../components/Grid";
import { Link } from "react-router-dom";
import "./ChallengeSignUp.css";
import { Jumbotron } from "react-bootstrap";


class ChallengeSignup extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        console.log("props", this.props.location);
        return (
            <Container fluid>
                <Jumbotron fluid className="JumboSign">
                    <Container>
                        <br /><br /><br />
                        <h1 className="text-center">Challenge Sign Up</h1>
                        <h2 className="chalName"> {this.props.location.name}</h2>
                        <img className="srcPic" src={this.props.location.img} />
                    </Container>
                </Jumbotron>
                <Jumbotron className="jumboSignBody">
                    <div className="FormText">
                        <ChallengeForm className="cForm" />
                    </div>
                </Jumbotron>
                <Row>
                </Row>
            </Container>
        );
    }
}

export default ChallengeSignup;