// src/pages/Result.tsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import { API_BASE_URL } from "../api";
import level0Img from "../assets/images/level0.jpg";
import level1Img from "../assets/images/level1.jpg";
import level2Img from "../assets/images/level2.jpg";
import level3Img from "../assets/images/level3.jpg";
import level4Img from "../assets/images/level4.jpg";

type Drinks = {
  soju: number;
  beer: number;
  somaek: number;
  makgeolli: number;
  fruitsoju: number;
};

const levelNames: Record<string, string> = {
  level0: "LV0: 일청담 다이버",
  level1: "LV1: 술취한 다람쥐",
  level2: "LV2: 홍익인간",
  level3: "LV3: 술고래",
  level4: "LV4: 고수",
};

const levelImages: Record<string, string> = {
  level0: level0Img,
  level1: level1Img,
  level2: level2Img,
  level3: level3Img,
  level4: level4Img,
};

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const { nickname, level, seconds, drinks, aiMessage: initialAiMessage, userId } = (location.state as {
    nickname: string;
    level: string;
    seconds: number;
    drinks: Record<string, number>;
    aiMessage: string;
    userId?: number;
  }) || {
    nickname: "Guest",
    seconds: 0,
    drinks: { soju: 0, beer: 0, somaek: 0, makgeolli: 0, fruitsoju: 0 },
    level: "level0",
    aiMessage: "측정된 데이터가 없습니다.",
  };

  const [aiMessage, setAiMessage] = useState(initialAiMessage);

  useEffect(() => {
    if (!userId || (aiMessage && aiMessage !== "AI 분석 중...")) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/ai-message`);
        if (response.ok) {
          const data = await response.json();
          if (data.aiMessage && data.aiMessage !== "AI 분석 중...") {
            setAiMessage(data.aiMessage);
            clearInterval(interval);
          }
        }
      } catch (error) {
        console.error("Failed to fetch AI message:", error);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [userId, aiMessage]);

  const labels: Record<keyof Drinks, string> = {
    soju: "소주",
    beer: "맥주",
    somaek: "소맥",
    makgeolli: "막걸리",
    fruitsoju: "과일소주",
  };

  const handleRestart = () => {
    navigate("/"); // 다시 시작 페이지로 이동
  };

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(2, "0")}`;
  };

  return (
    <div
      style={{
        padding: "40px",
        maxWidth: "500px",
        margin: "0 auto",
        textAlign: "center",
      }}
    >
      {/* 1. 닉네임 */}
      <h1 style={{ marginBottom: "20px" }}>{nickname}님의 술레벨은?</h1>

      {/* 2. 술자리 가진 시간 */}
      <p style={{ fontSize: "18px", marginBottom: "20px" }}>
        술자리 가진 시간: {formatTime(seconds)}
      </p>

      {/* 3. 술 종류별 잔 수 */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <h2>술 종류별 잔 수</h2>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {Object.keys(drinks).map((key) => {
            const k = key as keyof Drinks;
            return (
              <li key={k} style={{ marginBottom: "8px", fontSize: "16px" }}>
                {labels[k]}: {drinks[k]}잔
              </li>
            );
          })}
        </ul>
      </div>

      {/* 4. 술 레벨 이미지 */}
      <img
        src={levelImages[level]}
        alt={levelNames[level]}
        style={{
          width: "400px",
          height: "auto",
          borderRadius: "10px",
          marginBottom: "15px",
        }}
      />

      {/* 5. 술 레벨명 */}
      <h2 style={{ marginBottom: "15px" }}>{levelNames[level]}</h2>

      {/* 6. AI 분석 설명 */}
      <div
        style={{
          backgroundColor: "#f5f5f5",
          padding: "20px",
          borderRadius: "10px",
          border: "1px solid #ccc",
          textAlign: "left",
          marginBottom: "25px",
        }}
      >
        <p>{aiMessage}</p>
      </div>

      {/* 7. 홈으로 버튼 */}
      <Button onClick={handleRestart}>홈으로</Button>
    </div>
  );
}
