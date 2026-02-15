import { useLocation } from "react-router-dom";
import ChallengeForm from "../../components/ChallengeForm";

const ChallengeSignup = () => {
  const location = useLocation();
  const challenge = location.state || {};
  const challengeName = challenge.name || "Challenge";
  const challengeImg = challenge.img;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">
      <div className="glass overflow-hidden rounded-3xl">
        {challengeImg ? (
          <img className="h-64 w-full object-cover" src={challengeImg} alt={challengeName} />
        ) : null}
        <div className="p-6">
          <p className="tag">Challenge signup</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">{challengeName}</h1>
          <p className="mt-2 text-slate-300">
            Share your training goals and join the roster.
          </p>
        </div>
      </div>
      <ChallengeForm />
    </div>
  );
};

export default ChallengeSignup;
