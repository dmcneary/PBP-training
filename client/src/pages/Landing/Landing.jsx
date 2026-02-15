import React, { Component } from "react";
import SignUpBtn from "../../components/Buttons/SignUp";
import { Card } from "react-bootstrap";
import { Button, ButtonToolbar } from "react-bootstrap";
import { Carousel } from "react-bootstrap";
import { Col, Row, Container } from "../../components/Grid";
import Jumbotron from "../../components/Jumbotron";
// import Card from "../../components/Card"
import ChallengeCard from "../../components/ChallengeCard"
// import Image from "../../Images"
import card from "../../utils/card.json";
import img3 from "../../Images/girlHike.jpg"
import img4 from "../../Images/runBeach.jpg"
import img5 from "../../Images/bikeWoman.jpg"
import "./Landing.css";
import { Link } from "react-router-dom";


class Landing extends Component {

    state = {
        card
    };
//conditional render register button/go to dashboard button

    render() {
        return (
            <div>
                <Container fluid className="carousel-container">
                    <Carousel className="carousel" >
                        <Carousel.Item className="imgHero">
                            <img 
                                className="d-block w-100 imgC"
                                src={img3}
                                alt="First slide"
                            />
                            <Carousel.Caption>
                                <h3 className="h3Color2">Join A Challenge</h3>
                                <p></p>
                                <ButtonToolbar className="btn-toolbar">
                                    <Link to="/Signup">
                                        <Button className="Btn" type="submit">Sign Up</Button>
                                    </Link>
                                </ButtonToolbar>
                            </Carousel.Caption>
                        </Carousel.Item>
                        <Carousel.Item className="imgHero">
                            <img 
                                className="d-block w-100 imgC"
                                src={img4}
                                alt="Third slide"
                            />
                            <Carousel.Caption>
                                <h3 className="h3Color">See What Your Friends Are Doing</h3>
                                <p></p>
                                <ButtonToolbar className="btn-toolbar">
                                    <Link to="/Signup">
                                        <Button className="Btn" type="submit">Sign Up</Button>
                                    </Link>
                                </ButtonToolbar>
                            </Carousel.Caption>
                        </Carousel.Item>
                        <Carousel.Item className="imgHero">
                            <img 
                                className="d-block w-100 imgC"
                                src={img5}
                                alt="Third slide"
                            />
                            <Carousel.Caption>
                                <h3>Track Your Activity</h3>
                                <p></p>
                                <ButtonToolbar className="btn-toolbar">
                                    <Link to="/Signup">
                                        <Button className="Btn" type="submit">Sign Up</Button>
                                    </Link>
                                </ButtonToolbar>
                            </Carousel.Caption>
                        </Carousel.Item>
                    </Carousel>
                    <Row>
                        {/* <Card className="text-center">
                            <Card.Header>Featured</Card.Header>
                            <Card.Body>
                                <Card.Title>Special title treatment</Card.Title>
                                <Card.Text>
                                    With supporting text below as a natural lead-in to additional content.
                                </Card.Text>
                                <Link to="/login">
                                    <SignUpBtn value="Login with existing account" />
                                </Link>
                            </Card.Body>
                            <Card.Footer className="text-muted">2 days ago</Card.Footer>
                        </Card> */}
                    </Row>
                </Container>
            </div>
        );
    }
}

export default Landing;