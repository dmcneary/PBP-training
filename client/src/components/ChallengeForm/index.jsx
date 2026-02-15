import React from "react";
import "./ChallengeForm.css";
import img from '../../Images/banana3.png'
import { Form, Jumbotron, Container, Button } from "react-bootstrap";

function ChallengeForm(props) {
    // console.log("props", props.location.name);

    return (
 
            <div className="Form ChalForm">
                <Form>
                    <Form.Group controlId="exampleForm.ControlInput1">
                        <Form.Label>Username</Form.Label>
                        <Form.Control type="user" placeholder="" />
                    </Form.Group>
                    <Form.Group controlId="exampleForm.ControlSelect1">
                        <Form.Label>Age</Form.Label>
                        <Form.Control type="age" placeholder="" />
                    </Form.Group>
                    <Form.Group controlId="exampleForm.ControlSelect2">
                        <Form.Label>Level</Form.Label>
                        <Form.Control as="select">
                            <option>Beginner</option>
                            <option>Intermediate</option>
                            <option>Advanced</option>
                        </Form.Control>
                    </Form.Group>
                    <Form.Group controlId="exampleForm.ControlTextarea1">
                        <Form.Label>Message</Form.Label>
                        <Form.Control as="textarea" rows="3" />
                    </Form.Group>
                    <Button className="formSignBtn" variant="primary" type="submit">
                        Submit
                    </Button>
                </Form>
            </div>
      
    );
}

export default ChallengeForm;