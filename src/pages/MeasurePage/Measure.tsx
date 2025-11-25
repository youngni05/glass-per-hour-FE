import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DrinkList from "./DrinkList";
import Button from "../../components/ui/Button";
import { API_BASE_URL } from "../../api";

// 로컬 이미지 import
import sojuImg from "../../assets/images/소주.jpg";
import beerImg from "../../assets/images/맥주.jpg";
import somaekImg from "../../assets/images/소맥.jpg";
import makgeolliImg from "../../assets/images/막걸리.jpg";
import fruitsojuImg from "../../assets/images/과일소주.jpg";

export default function MeasurePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const nickname =
    (location.state as { nickname: string })?.nickname || "Guest";

  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(true);

  const [drinks, setDrinks] = useState({
    soju: 0,
    beer: 0,
    somaek: 0,
    makgeolli: 0,
    fruitsoju: 0,
  });

  const updateDrink = async (type: keyof typeof drinks, amount: number) => {
    // 1. 상태 업데이트 (낙관적 업데이트)
    setDrinks((prev) => ({
      ...prev,
      [type]: Math.max(prev[type] + amount, 0),
    }));

    // 2. 백엔드 전송 (userId가 있을 때만)
    const userId = (location.state as { userId?: number })?.userId;
    if (userId && amount > 0) {
      try {
        await fetch(`${API_BASE_URL}/users/${userId}/drinks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            drinkType: type.toUpperCase(), // BE enum: SOJU, BEER, etc.
            glassCount: amount,
          }),
        });
      } catch (error) {
        console.error("Failed to record drink:", error);
      }
    }
  };

  // 타이머
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  const handleEnd = async () => {
    setIsRunning(false);
    const userId = (location.state as { userId?: number })?.userId;

    if (!userId) {
      // userId가 없으면(테스트 등) 기존 로직대로 이동
      const totalDrinks = Object.values(drinks).reduce((a, b) => a + b, 0);
      let level = "level0";
      if (totalDrinks >= 1 && totalDrinks <= 3) level = "level1";
      else if (totalDrinks <= 6) level = "level2";
      else if (totalDrinks <= 9) level = "level3";
      else level = "level4";

      const aiMessage = `(오프라인 모드) ${nickname}님! 총 ${seconds}초 동안 마셨네요.`;
      navigate("/result", {
        state: { nickname, seconds, drinks, level, aiMessage },
      });
      return;
    }

    try {
      // 1. 종료 API 호출
      const response = await fetch(`${API_BASE_URL}/users/${userId}/finish`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to finish session");
      }

      const data = await response.json();
      // BE now returns User object immediately, AI message might be null initially
      const aiMessage = data.aiMessage || "AI 분석 중...";

      // 2. 결과 조회를 위해 유저 정보 가져오기 (혹은 룸 정보)
      // 현재 finish API는 void 반환이므로, 계산된 결과를 얻으려면 별도 조회가 필요할 수 있음.
      // 하지만 간단히 프론트에서 계산하거나, BE에서 계산된 값을 믿을 수 있음.
      // 여기서는 BE 로직(RankingCalculator)과 동일하게 레벨을 보여주기 위해
      // BE의 User 정보를 조회하는 API가 있다면 좋겠지만, 
      // 일단 프론트에서 계산해서 넘기거나, finish 응답에 결과를 포함시키는게 좋음.
      // 현재 BE finish는 void이므로, 프론트에서 계산 로직 유지 혹은 추가 조회 필요.

      // 임시: 프론트 계산 로직 유지하되, BE 데이터 동기화는 추후 고려
      const totalDrinks = Object.values(drinks).reduce((a, b) => a + b, 0);
      let level = "level0";
      if (totalDrinks >= 1 && totalDrinks <= 3) level = "level1";
      else if (totalDrinks <= 6) level = "level2";
      else if (totalDrinks <= 9) level = "level3";
      else level = "level4";

      navigate("/result", {
        state: { nickname, seconds, drinks, level, aiMessage, userId },
      });

    } catch (error) {
      console.error("Error finishing session:", error);
      alert("결과 저장 중 오류가 발생했습니다.");
    }
  };

  const drinkImages = {
    soju: sojuImg,
    beer: beerImg,
    somaek: somaekImg,
    makgeolli: makgeolliImg,
    fruitsoju: fruitsojuImg,
  };

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    // 두 자리로 맞추기 위해 padStart 사용
    const hh = String(hours).padStart(2, "0");
    const mm = String(minutes).padStart(2, "0");
    const ss = String(seconds).padStart(2, "0");

    return `${hh}:${mm}:${ss}`;
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
    </div>
  );
}
