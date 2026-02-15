const Alert = (props) => {
  return (
    <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-sm text-amber-200">
      {props.message}
    </div>
  );
};

export default Alert;
