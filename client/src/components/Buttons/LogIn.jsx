const LogIn = (props) => (
  <button {...props} className="btn-primary">
    {props.children || "Log In"}
  </button>
);

export default LogIn;
