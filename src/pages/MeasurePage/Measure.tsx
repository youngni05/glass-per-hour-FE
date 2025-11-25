import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DrinkList from "./DrinkList";
import Button from "../../components/ui/Button";

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

  const updateDrink = (type: keyof typeof drinks, amount: number) => {
    setDrinks((prev) => ({
      ...prev,
      [type]: Math.max(prev[type] + amount, 0),
    }));
  };

  // 타이머
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  const handleEnd = () => {
    setIsRunning(false);

    //여기는 프론트에서 동작하는 거 확인할려고 임의로 작성한 레벨, AI분석 메시지입니다.
    // 여기서 백엔드에 drinks, seconds, nickname 보내는 로직 가능
    // 예시: fetch('/api/result', { method:'POST', body: JSON.stringify({nickname, drinks, seconds}) })

    // 임시 AI 메시지 생성
    const aiMessage = `안녕하세요 ${nickname}님! 총 ${seconds}초 동안 술을 마셨네요. 적절히 즐기셨습니다.`;

    // 술레벨 결정 (예시, 간단히 총 잔 수로)
    const totalDrinks = Object.values(drinks).reduce((a, b) => a + b, 0);
    let level = "level0";
    if (totalDrinks >= 1 && totalDrinks <= 3) level = "level1";
    else if (totalDrinks <= 6) level = "level2";
    else if (totalDrinks <= 9) level = "level3";
    else level = "level4";

    navigate("/result", {
      state: { nickname, seconds, drinks, level, aiMessage },
    });
  };

  /* 백엔드와 연동하는 코드 예시
   const handleEnd = async () => {
    setIsRunning(false);

    try {
      // 백엔드 API 호출
      const response = await fetch("/api/drunk-level", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname, drinks, seconds }),
      });
      const data = await response.json();

      const level = data.level;        // AI 계산 술레벨
      const aiMessage = data.message;  // AI 개인 설명

      navigate("/result", { state: { nickname, level, drinks, seconds, aiMessage } });
    } catch (error) {
      console.error("술레벨 계산 오류:", error);
      alert("결과를 가져오는 데 실패했습니다.");
    }
  };*/

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
