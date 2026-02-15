import React from "react";

const SignUp = props => (
  <button {...props} style={{ float: "right", marginBottom: 10 }} className="btn btn-success">
    Sign Up
    {props.children}
  </button>
);

export default SignUp;