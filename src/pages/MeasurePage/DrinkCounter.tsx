import React from "react";
import Button from "../../components/ui/Button";

type DrinkCounterProps = {
  label: string;
  count: number;
  onIncrease: () => void;
  onDecrease: () => void;
  drinkImage?: string;
};

export default function DrinkCounter({
  label,
  count,
  onIncrease,
  onDecrease,
  drinkImage,
}: DrinkCounterProps) {
  return (
    <div
      style={{
        border: "2px solid black",
        borderRadius: "8px",
        padding: "15px",
        marginBottom: "20px",
        textAlign: "center",
        width: "200px",
      }}
    >
      <h3>{label}</h3>
      {drinkImage && (
        <img
          src={drinkImage}
          alt={label}
          style={{
            width: "80px",
            height: "80px",
            objectFit: "contain",
            marginBottom: "10px",
          }}
        />
      )}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          marginTop: "10px",
        }}
      >
        <button onClick={onDecrease} style={btnStyle}>
          -
        </button>
        <span style={{ fontSize: "20px", fontWeight: "bold" }}>{count}</span>
        <button onClick={onIncrease} style={btnStyle}>
          +
        </button>
      </div>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  padding: "6px 12px",
  fontSize: "18px",
  borderRadius: "6px",
  border: "1px solid black",
  cursor: "pointer",
};
