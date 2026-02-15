const LogOut = (props) => (
  <button {...props} className="btn-primary">
    {props.children || "Log Out"}
  </button>
);

export default LogOut;
