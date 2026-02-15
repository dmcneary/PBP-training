import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Input, TextArea } from "../../components/Form";
import { Row, Container } from "../../components/Grid";
import "./NewActivity.css";
import Leaflet from "leaflet";
import "leaflet-routing-machine/dist/leaflet-routing-machine";

const NewActivity = ({ username }) => {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const controlRef = useRef(null);
  const [userLocation, setUserLocation] = useState({
    lat: 34.0522,
    lon: -118.2437
  });
  const [formState, setFormState] = useState({
    actTitle: "",
    actDesc: "",
    actDate: "",
    durationMins: 0,
    durationSecs: 0,
    distance: 0,
    sportType: "",
    message: ""
  });

  useEffect(() => {
    const geoSuccess = (position) => {
      setUserLocation({
        lat: position.coords.latitude,
        lon: position.coords.longitude
      });
      if (mapRef.current) {
        mapRef.current.setView(
          [position.coords.latitude, position.coords.longitude],
          13
        );
      }
    };
    navigator.geolocation.getCurrentPosition(geoSuccess);

    const map = Leaflet.map("map").setView(
      [userLocation.lat, userLocation.lon],
      13
    );
    mapRef.current = map;

    Leaflet.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      subdomains: ["a", "b", "c"],
      maxZoom: 17,
      minZoom: 9
    }).addTo(map);

    Leaflet.tileLayer("http://tiles.mapc.org/trailmap-onroad/{z}/{x}/{y}.png", {
      maxZoom: 17,
      minZoom: 9
    }).addTo(map);

    const control = Leaflet.Routing.control({
      waypoints: [
        Leaflet.latLng(userLocation.lat, userLocation.lon),
        Leaflet.latLng(34.0407, -118.2468)
      ],
      routeWhileDragging: true
    }).addTo(map);
    controlRef.current = control;

    const createButton = (label, container) => {
      const btn = Leaflet.DomUtil.create("button", "", container);
      btn.setAttribute("type", "button");
      btn.innerHTML = label;
      return btn;
    };

    map.on("click", (event) => {
      const container = Leaflet.DomUtil.create("div");
      const startBtn = createButton("Start from this location", container);
      const destBtn = createButton("Go to this location", container);

      Leaflet.DomEvent.on(startBtn, "click", () => {
        control.spliceWaypoints(0, 1, event.latlng);
        map.closePopup();
      });

      Leaflet.DomEvent.on(destBtn, "click", () => {
        control.spliceWaypoints(control.getWaypoints().length - 1, 1, event.latlng);
        map.closePopup();
      });

      Leaflet.popup().setContent(container).setLatLng(event.latlng).openOn(map);
    });

    return () => {
      map.remove();
    };
  }, []);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const waypoints = controlRef.current ? controlRef.current.getWaypoints() : [];

    axios
      .post("/api/activities", {
        userId: username,
        actTitle: formState.actTitle,
        actDesc: formState.actDesc,
        actDate: formState.actDate,
        durationMins: formState.durationMins,
        durationSecs: formState.durationSecs,
        distance: formState.distance,
        sportType: formState.sportType,
        waypoints: waypoints
      })
      .then((res) => {
        if (!res.data.errmsg) {
          navigate(`/api/activities/${res.data._id}`);
        }
      })
      .catch((error) => {
        console.log("activity creation error: ");
        console.log(error);
        setFormState((prevState) => ({
          ...prevState,
          message: "Something went wrong...oops! Please try again later."
        }));
      });
  };

  return (
    <Container fluid>
      <Row>
        <div className="col-xs-12 col-md-6 mx-auto" id="map"></div>
        <div className="col-xs-12 col-md-6 mx-auto">
          <form>
            <p className="newActP">Activity title: </p>
            <Input
              value={formState.actTitle}
              onChange={handleInputChange}
              name="actTitle"
              placeholder="Name your activity"
            />
            <p className="newActP">Activity description: </p>
            <TextArea
              value={formState.actDesc}
              onChange={handleInputChange}
              name="actDesc"
              placeholder="Describe this activity (how did it go? how were you feeling?)"
            />
            <p className="newActP">Date: </p>
            <Input
              type="date"
              value={formState.actDate}
              onChange={handleInputChange}
              name="actDate"
            />
            <p className="newActP">Duration: </p>
            <Input
              value={formState.durationMins}
              onChange={handleInputChange}
              name="durationMins"
              size="2"
            />{" "}
            Minutes
            <Input
              value={formState.durationSecs}
              onChange={handleInputChange}
              name="durationSecs"
              size="2"
            />{" "}
            Seconds
            <p className="newActP">Distance (in miles): </p>
            <Input
              value={formState.distance}
              onChange={handleInputChange}
              name="distance"
              type="number"
              size="6"
            />
            <p className="newActP">Type of activity: </p>
            <select name="sportType" onChange={handleInputChange}>
              <option value="">--Please choose an option--</option>
              <option value="hiking">Hiking</option>
              <option value="running">Running</option>
              <option value="cycling">Cycling</option>
              <option value="swimming">Swimming</option>
              <option value="rowing">Rowing</option>
            </select>
            <div className="submitBtn">
              <button
                className="btn btnSub1"
                font-color="white"
                onClick={handleSubmit}
                type="submit"
              >
                Create Activity
              </button>
            </div>
            {formState.message ? <p>{formState.message}</p> : null}
          </form>
        </div>
      </Row>
    </Container>
  );
};

export default NewActivity;
