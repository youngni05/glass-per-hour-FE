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

    // --- 클라이언트 측 계산 (from test branch) ---
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
    if (bottles === 0) {
      bottleText = "0병";
    } else {
      const full = Math.floor(bottles);
      const half = bottles % 1 === 0.5;
      if (full === 0 && half) {
        bottleText = "반병";
      } else if (half) {
        bottleText = `${full}병 반`;
      } else {
        bottleText = `${full}병`;
      }
    }

    function getLevel(bottles: number): string {
      if (bottles <= 0.5) return "level0";
      else if (bottles <= 1.5) return "level1";
      else if (bottles <= 2) return "level3";
      else return "level4";
    }
    const level = getLevel(bottles);
    // --- 클라이언트 측 계산 끝 ---

    if (!userId) {
      // 오프라인 모드 (from connected branch)
      const aiMessage = `(오프라인 모드) ${nickname}님! 총 ${seconds}초 동안 마셨네요.`;
      navigate("/result", {
        state: { nickname, seconds, drinks, level, aiMessage, gph, bottleText },
      });
      return;
    }

    try {
      // 백엔드 종료 API 호출 (from connected branch)
      const response = await fetch(`${API_BASE_URL}/users/${userId}/finish`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to finish session");
      }

      const data = await response.json();
      const aiMessage = data.aiMessage || "AI 분석 중...";

      // 결과 페이지로 이동
      navigate("/result", {
        state: { nickname, seconds, drinks, level, aiMessage, userId, gph, bottleText },
      });

    } catch (error) {
      console.error("Error finishing session:", error);
      alert("결과 저장 중 오류가 발생했습니다.");
      // 에러 발생 시에도 클라이언트 측 데이터로 결과 페이지를 보여줄 수 있습니다.
      navigate("/result", {
        state: {
          nickname,
          seconds,
          drinks,
          level,
          aiMessage: "결과를 저장하는 데 실패했습니다.",
          userId,
          gph,
          bottleText,
        },
      });
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
