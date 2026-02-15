import { useCallback, useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import Landing from "./pages/Landing/";
import Dashboard from "./pages/Dashboard/";
import BrmChecklist from "./pages/Challenges/";
import Login from "./pages/Login/";
import Signup from "./pages/Signup/";
import Header from "./components/Header";
import Footer from "./components/Footer";
import AllActivities from "./pages/AllActivities";
import NewActivity from "./pages/NewActivity";
import ActivityDetail from "./pages/ActivityDetail";
import ChallengeSignUp from "./pages/ChallengeSignUp";
import NoMatch from "./pages/NoMatch";
import Navbar from "./components/NavbarLoggedIn";

const App = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState(null);

  const getUser = useCallback(() => {
    axios.get("/user").then((response) => {
      if (response.data.user !== null) {
        setLoggedIn(true);
        setUsername(response.data.user.username);
      } else {
        setLoggedIn(false);
        setUsername(null);
      }
    });
  }, []);

  useEffect(() => {
    getUser();
  }, [getUser]);

  const hasUser = loggedIn && username;

  return (
    <Router>
      <div className="app-shell">
        {hasUser ? (
          <Navbar getUser={getUser} loggedIn={loggedIn} />
        ) : (
          <Header />
        )}
        <main className="px-6 pb-16 pt-6">
          <Routes>
            <Route
              path="/login"
              element={<Login getUser={getUser} loggedIn={loggedIn} />}
            />
            <Route
              path="/dashboard"
              element={<Dashboard loggedIn={loggedIn} username={username} />}
            />
            <Route path="/all-activities" element={<AllActivities />} />
            <Route
              path="/activities/:id"
              element={<ActivityDetail loggedIn={loggedIn} username={username} />}
            />
            <Route
              path="/newactivity"
              element={<NewActivity loggedIn={loggedIn} username={username} />}
            />
            <Route path="/brm-checklist" element={<BrmChecklist />} />
            <Route
              path="/challenges"
              element={<Navigate to="/brm-checklist" replace />}
            />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/"
              element={<Landing loggedIn={loggedIn} username={username} />}
            />
            <Route path="/ChallengeSignUp" element={<ChallengeSignUp />} />
            <Route path="*" element={<NoMatch />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
