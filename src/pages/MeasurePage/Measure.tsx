import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DrinkList from "./DrinkList";
import Button from "../../components/ui/Button";
import { addDrink, finishUser } from "../../api/api"; // Use the new API functions
import RankingList from "./RankingList";

// Local image imports
import sojuImg from "../../assets/images/소주.jpg";
import beerImg from "../../assets/images/맥주.jpg";
import somaekImg from "../../assets/images/소맥.jpg";
import makgeolliImg from "../../assets/images/막걸리.jpg";
import fruitsojuImg from "../../assets/images/과일소주.jpg";

export default function MeasurePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { nickname = "Guest", userId } = (location.state as { nickname?: string, userId?: number }) || {};

  const [seconds, setSeconds] = useState(10000);
  const [isRunning, setIsRunning] = useState(true);

  const [drinks, setDrinks] = useState({
    soju: 0,
    beer: 0,
    somaek: 0,
    makgeolli: 0,
    fruitsoju: 0,
  });

  const updateDrink = async (type: keyof typeof drinks, amount: number) => {
    setDrinks((prev) => ({
      ...prev,
      [type]: Math.max(prev[type] + amount, 0),
    }));

    if (userId && amount > 0) {
      try {
        // Use the new addDrink function
        await addDrink(userId, type.toUpperCase(), amount);
      } catch (error) {
        console.error("Failed to record drink:", error);
      }
    }
  };

  // Timer effect
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  const handleEnd = async () => {
    setIsRunning(false);

    // Client-side calculations for immediate feedback
    const sojuEq =
      drinks.soju +
      drinks.beer * 0.7 +
      drinks.somaek * 1.3 +
      drinks.makgeolli * 0.8 +
      drinks.fruitsoju * 0.5;

    const hours = seconds / 3600;
    const gph = hours > 0 ? Math.round(sojuEq / hours) : 0;
    const bottles = Math.round((sojuEq / 7.2) * 2) / 2;
    
    let bottleText = "";
    if (bottles === 0) bottleText = "0병";
    else {
      const full = Math.floor(bottles);
      const half = bottles % 1 === 0.5;
      if (full === 0 && half) bottleText = "반병";
      else if (half) bottleText = `${full}병 반`;
      else bottleText = `${full}병`;
    }

    function getLevel(b: number): string {
      if (b <= 0.5) return "level0";
      if( b<= 1) return "level1";
      if (b <= 1.5) return "level2";
      if (b <= 2) return "level3";
      return "level4";
    }
    const level = getLevel(bottles);

    if (!userId) { // Offline mode
      const aiMessage = `(오프라인 모드) ${nickname}님! 총 ${seconds}초 동안 마셨네요.`;
      navigate("/result", { state: { nickname, seconds, drinks, level, aiMessage, gph, bottleText } });
      return;
    }

    try {
      // Use the new finishUser function
      const data = await finishUser(userId);
      const aiMessage = data.aiMessage || "AI 분석 중...";

      navigate("/result", { state: { nickname, seconds, drinks, level, aiMessage, userId, gph, bottleText } });
    } catch (error) {
      console.error("Error finishing session:", error);
      navigate("/result", {
        state: {
          nickname, seconds, drinks, level,
          aiMessage: "결과를 저장하는 데 실패했습니다.",
          userId, gph, bottleText,
        },
      });
    }
  };

  const drinkImages = { soju: sojuImg, beer: beerImg, somaek: somaekImg, makgeolli: makgeolliImg, fruitsoju: fruitsojuImg };

  const formatTime = (totalSeconds: number) => {
    const h = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
    const s = String(totalSeconds % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  return (
    <div style={{ padding: "50px", textAlign: "center" }}>
      <h1>
        {nickname} 님이
        <br />
        {formatTime(seconds)}초 동안 술 마시는 중...
      </h1>

      <DrinkList
        drinks={drinks}
        updateDrink={updateDrink}
        drinkImages={drinkImages}
      />

      <Button onClick={handleEnd}>술자리 끝내기</Button>
      {/* Remove the invalid sojuEq prop */}
      <RankingList nickname={nickname} />
    </div>
  );
}