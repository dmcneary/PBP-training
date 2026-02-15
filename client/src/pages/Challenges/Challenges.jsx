import { useState } from "react";
import ChallengeCard from "../../components/ChallengeCard";
import cardData from "../../utils/card.json";

const Challenge = () => {
  const [cards, setCards] = useState(cardData);

  const removeCard = (id) => {
    const nextCards = cards.filter((card) => card.id !== id);
    setCards(nextCards);
  };

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="tag">Challenges</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">
            Fit Monkey Challenges
          </h1>
          <p className="mt-2 text-slate-300">
            Choose a route, rally your crew, and collect progress insights as you go.
          </p>
        </div>
        <div className="glass rounded-2xl px-4 py-2 text-sm text-slate-300">
          {cards.length} live challenges
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {cards.map((card) => (
          <ChallengeCard
            removeCard={removeCard}
            id={card.id}
            key={card.id}
            name={card.name}
            distance={card.distance}
            image={card.image}
            bananas={card.bananas}
            location={card.location}
            description={card.description}
          />
        ))}
      </div>
    </div>
  );
};

export default Challenge;
