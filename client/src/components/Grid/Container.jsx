import React from "react";

export const Container = ({ fluid, children, custom }) => (
  <div className={`container${fluid ? "-fluid" + ' ' + custom : ""}`}>
    {children}
  </div>
);
