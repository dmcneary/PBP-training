const SignUp = (props) => (
  <button {...props} className="btn-primary">
    {props.children || "Sign Up"}
  </button>
);

export default SignUp;
