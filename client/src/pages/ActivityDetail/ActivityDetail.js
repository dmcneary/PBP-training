import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./ActivityDetail.css";
import axios from "axios";
import { Container } from "../../components/Grid";

const Detail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activity, setActivity] = useState({});

  useEffect(() => {
    axios
      .get(`/api/activities/${id}`)
      .then((res) => {
        setActivity(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [id]);

  const handleDelete = (event) => {
    event.preventDefault();
    if (!activity._id) {
      return;
    }
    axios
      .delete(`/api/activities/${activity._id}`)
      .then(() => {
        navigate("/dashboard");
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleEdit = (event) => {
    event.preventDefault();
  };

  return (
    <Container fluid>
      <div className="media">
        <img
          className="mr-3"
          src="https://staticmapmaker.com/img/google.png"
          length="250"
          width="250"
          alt="placeholder"
        />
        <div className="media-body">
          <h3 className="mt-0">{activity.actTitle}</h3>
          <h4>by {activity.userId}</h4>
          <p>Created {activity.actDate}</p>
          <hr />
          <div className="col-xs-12 col-md-8">
            <p>{activity.actDesc}</p>
          </div>
          <div className="col-xs-12 col-md-4">
            <p>Type of activity: {activity.sportType}</p>
            <p>
              Duration: {activity.durationMins} minutes, {activity.durationSecs} seconds
            </p>
            <p>Distance: {activity.distance}</p>
          </div>
        </div>
        <div>
          <button className="btn btn-warning" onClick={handleEdit} type="submit">
            Edit Activity
          </button>
          <button className="btn btn-danger" onClick={handleDelete} type="submit">
            Delete Activity
          </button>
        </div>
      </div>
    </Container>
  );
};

export default Detail;
