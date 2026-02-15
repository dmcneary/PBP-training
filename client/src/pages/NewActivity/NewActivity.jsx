import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Input, TextArea } from "../../components/Form";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
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
          navigate(`/activities/${res.data._id}`);
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
    <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="glass rounded-3xl p-4">
        <div id="map" className="h-[420px] w-full rounded-2xl"></div>
      </div>
      <form onSubmit={handleSubmit} className="glass space-y-4 rounded-3xl p-6">
        <div>
          <label className="text-sm text-slate-300">Activity title</label>
          <Input
            value={formState.actTitle}
            onChange={handleInputChange}
            name="actTitle"
            placeholder="Name your activity"
          />
        </div>
        <div>
          <label className="text-sm text-slate-300">Activity description</label>
          <TextArea
            value={formState.actDesc}
            onChange={handleInputChange}
            name="actDesc"
            placeholder="Describe the effort, conditions, and how it felt."
          />
        </div>
        <div>
          <label className="text-sm text-slate-300">Date</label>
          <Input
            type="date"
            value={formState.actDate}
            onChange={handleInputChange}
            name="actDate"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm text-slate-300">Duration (minutes)</label>
            <Input
              value={formState.durationMins}
              onChange={handleInputChange}
              name="durationMins"
            />
          </div>
          <div>
            <label className="text-sm text-slate-300">Duration (seconds)</label>
            <Input
              value={formState.durationSecs}
              onChange={handleInputChange}
              name="durationSecs"
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm text-slate-300">Distance (miles)</label>
            <Input
              value={formState.distance}
              onChange={handleInputChange}
              name="distance"
              type="number"
            />
          </div>
          <div>
            <label className="text-sm text-slate-300">Sport type</label>
            <select
              name="sportType"
              onChange={handleInputChange}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-2 text-sm text-white focus:border-emerald-300 focus:outline-none"
            >
              <option value="">Select sport</option>
              <option value="hiking">Hiking</option>
              <option value="running">Running</option>
              <option value="cycling">Cycling</option>
              <option value="swimming">Swimming</option>
              <option value="rowing">Rowing</option>
            </select>
          </div>
        </div>
        {formState.message ? <p className="text-sm text-amber-200">{formState.message}</p> : null}
        <button className="btn-primary w-full justify-center" type="submit">
          Create activity
        </button>
      </form>
    </div>
  );
};

export default NewActivity;
