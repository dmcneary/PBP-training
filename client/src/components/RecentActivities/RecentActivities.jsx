import React, { Component } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
// import L from "leaflet-routing-machine";

class RecentUserActivities extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activities: []
    }
  }

  componentDidMount() {
    this.getRecentActivities();
  }

  getRecentActivities = () => {
    axios.get("/api/activities")
      .then(res => {
        console.log(res);
        this.setState({
          activities: res.data
        })
      }
      )
      .catch(err => console.log(err));
  };

  render() {
    return (
      <div>
        {this.state.activities.length ?
          (this.state.activities.map(act => {
            return (
              <div className="media" key= {act._id}>
                <img className="mr-3" src="https://staticmapmaker.com/img/google.png" length="250" width="250" alt="placeholder" />
                <div className="media-body">
                  <Link to={"/api/activities/" + act._id}>
                    <h3 className="mt-0">{act.actTitle}</h3>
                  </Link>
                  <p>Created {act.actDate}</p>
                  <hr />
                  <div>
                    <p>{act.actDesc}</p>
                  </div>
                  <div>
                    <p>Type of activity: {act.sportType}</p>
                    <p>Duration: {act.durationMins} minutes, {act.durationSecs} seconds</p>
                    <p>Distance: {act.distance} miles</p>
                  </div>
                </div>
              </div>
            )
          })) :
          (<h3>No Results to Display</h3>)
        }
      </div>
    );
  }
}

export default RecentUserActivities;