import { useState } from "react";
import axios from "axios";
import Alert from "../../components/Alert";
import { Input } from "../../components/Form";
import { Col, Row, Container } from "../../components/Grid";
import { Link, useNavigate } from "react-router-dom";
import { Jumbotron } from "react-bootstrap";
import "./Signup.css";

const Signup = () => {
  const navigate = useNavigate();
  const [formState, setFormState] = useState({
    firstName: "",
    lastName: "",
    username: "",
    password: "",
    gender: "",
    age: 13,
    location: "",
    message: ""
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    axios
      .post("/user", {
        firstName: formState.firstName,
        lastName: formState.lastName,
        username: formState.username,
        password: formState.password,
        gender: formState.gender,
        age: formState.age,
        location: formState.location
      })
      .then((response) => {
        if (!response.data.errmsg) {
          navigate("/login");
        } else {
          setFormState((prevState) => ({
            ...prevState,
            message: "That username is already in use. Please pick a different username."
          }));
        }
      })
      .catch((error) => {
        console.log("signup error: ");
        console.log(error);
        setFormState((prevState) => ({
          ...prevState,
          message: "Something went wrong...oops! Please try again later."
        }));
      });
  };

  return (
    <Jumbotron className="JumboSignUp">
      <Container fluid>
        <div className="signContainer">
          <Row>
            <Col size="6">
              {formState.message ? (
                <Alert message={formState.message} />
              ) : (
                <h4 className="heading4">Please Fill Out All Fields!</h4>
              )}
              <form className="formSign">
                <p className="pSign">First name: </p>
                <Input
                  value={formState.firstName}
                  onChange={handleInputChange}
                  name="firstName"
                  placeholder="Your first name"
                />
                <p className="pSign">Last name: </p>
                <Input
                  value={formState.lastName}
                  onChange={handleInputChange}
                  name="lastName"
                  placeholder="Your last name"
                />
                <p className="pSign">Username: </p>
                <Input
                  value={formState.username}
                  onChange={handleInputChange}
                  name="username"
                  placeholder="Your desired username"
                />
                <p className="pSign">Password: </p>
                <Input
                  value={formState.password}
                  onChange={handleInputChange}
                  name="password"
                  type="password"
                  placeholder="Password"
                />
                <p className="pSign">Gender</p>
                <Input
                  value={formState.gender}
                  onChange={handleInputChange}
                  name="gender"
                  placeholder="Gender"
                />
                <p className="pSign">Age: </p>
                <Input
                  type="number"
                  min="13"
                  max="120"
                  value={formState.age}
                  onChange={handleInputChange}
                  name="age"
                />
                <p className="pSign">Location: </p>
                <Input
                  value={formState.location}
                  onChange={handleInputChange}
                  name="location"
                  placeholder="Location"
                />
                <button
                  className="btn btn-primary btnSign"
                  onClick={handleSubmit}
                  type="submit"
                >
                  Register
                </button>
              </form>
            </Col>
            <Col size="12">
              <Link to="/login">
                <button className="btn btn-warning btnExist">
                  Login with an existing account
                </button>
              </Link>
            </Col>
          </Row>
        </div>
      </Container>
    </Jumbotron>
  );
};

export default Signup;
