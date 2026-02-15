import React from "react";
import "./Jumbotron.css";

const Jumbotron = ({ children }) => (
  <div
    style={{ height: 300, clear: "both", paddingTop: 50, paddingBottom: 50, textAlign: "center", background: "transparent" }}
    className="jumbotron jumbo"
  >
    {children}
  </div>
);

export default Jumbotron;

