function Wrapper(props) {
  return <div className="grid gap-6 md:grid-cols-2">{props.children}</div>;
}

export default Wrapper;
