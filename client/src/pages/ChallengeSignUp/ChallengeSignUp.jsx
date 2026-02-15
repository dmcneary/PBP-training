import { useLocation } from "react-router-dom";
import ChallengeForm from "../../components/ChallengeForm";
import { Container } from "../../components/Grid";
import "./ChallengeSignUp.css";
import { Jumbotron } from "react-bootstrap";

const ChallengeSignup = () => {
    const location = useLocation();
    const challenge = location.state || {};
    const challengeName = challenge.name || "Challenge";
    const challengeImg = challenge.img;

    return (
        <Container fluid>
            <Jumbotron fluid className="JumboSign">
                <Container>
                    <br /><br /><br />
                    <h1 className="text-center">Challenge Sign Up</h1>
                    <h2 className="chalName"> {challengeName}</h2>
                    {challengeImg ? (
                        <img className="srcPic" src={challengeImg} alt={challengeName} />
                    ) : null}
                </Container>
            </Jumbotron>
            <Jumbotron className="jumboSignBody">
                <div className="FormText">
                    <ChallengeForm className="cForm" />
                </div>
            </Jumbotron>
        </Container>
    );
};

export default ChallengeSignup;
