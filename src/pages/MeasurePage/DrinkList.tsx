import React from "react";
import DrinkCounter from "./DrinkCounter";

type Drinks = {
  soju: number;
  beer: number;
  somaek: number;
  makgeolli: number;
  fruitsoju: number;
};

type DrinkListProps = {
  drinks: Drinks;
  updateDrink: (type: keyof Drinks, amount: number) => void;
  drinkImages?: Partial<Record<keyof Drinks, string>>;
};

const labels: Record<keyof Drinks, string> = {
  soju: "소주",
  beer: "맥주",
  somaek: "소맥",
  makgeolli: "막걸리",
  fruitsoju: "과일소주",
};

export default function DrinkList({
  drinks,
  updateDrink,
  drinkImages,
}: DrinkListProps) {
  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      {Object.keys(drinks).map((key) => {
        const k = key as keyof Drinks;
        return (
          <DrinkCounter
            key={k}
            label={labels[k]}
            count={drinks[k]}
            drinkImage={drinkImages?.[k]}
            onIncrease={() => updateDrink(k, 1)}
            onDecrease={() => updateDrink(k, -1)}
          />
        );
      })}
    </div>
  );
}
