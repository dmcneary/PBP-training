import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";
import { Jumbotron, Container, Row, Col } from "react-bootstrap";

const LoginForm = ({ loggedIn, getUser }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    setMessage("Logging in...");

    axios
      .post("/user/login", {
        username,
        password
      })
      .then((res) => {
        if (res.status === 200) {
          getUser();
          navigate("/dashboard");
        }
      })
      .catch((error) => {
        console.log("login error: ");
        console.log(error);
        setMessage("Something went wrong...oops! Please try again later.");
      });
  };

  if (loggedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Jumbotron className="JumboLogin">
      <div className="container">
        <div className="container containerLog">
          <Row>
            <Container className="contLog">
              <Col lg="auto">
                <br />
                <form className="form-horizontal">
                  <div className="form-group">
                    <div className="col-1 col-ml-auto">
                      <label className="form-label" htmlFor="username">
                        Username
                      </label>
                    </div>
                    <div className="col-3 col-mr-auto">
                      <input
                        className="form-input"
                        type="text"
                        id="username"
                        name="username"
                        placeholder="Username"
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <div className="col-1 col-ml-auto">
                      <label className="form-label" htmlFor="password">
                        Password:
                      </label>
                    </div>
                    <div className="col-3 col-mr-auto">
                      <input
                        className="form-input"
                        placeholder="password"
                        type="password"
                        name="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                      />
                    </div>
                  </div>
                  <div className="container">
                    <div className="form-group ">
                      <button
                        className="btn btn-primary btnLog"
                        onClick={handleSubmit}
                        type="submit"
                      >
                        Login
                      </button>
                    </div>
                    {message ? <p>{message}</p> : null}
                  </div>
                </form>
              </Col>
            </Container>
          </Row>
        </div>
      </div>
    </Jumbotron>
  );
};

export default LoginForm;
