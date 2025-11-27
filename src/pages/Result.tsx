// src/pages/Result.tsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import html2canvas from "html2canvas";

import level0Img from "../assets/images/level0.png";
import level1Img from "../assets/images/level1.png";
import level2Img from "../assets/images/level2.png";
import level3Img from "../assets/images/level3.png";
import level4Img from "../assets/images/level4.png";

type Drinks = {
  soju: number;
  beer: number;
  somaek: number;
  makgeolli: number;
  fruitsoju: number;
};

const levelNames: Record<string, string> = {
  level0: "LV0: 홍익인간",
  level1: "LV1: 일청담 다이버",
  level2: "LV2: 술취한 다람쥐",
  level3: "LV3: 술고래 지망생",
  level4: "LV4: 술먹는 하마",
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
  const captureRef = React.useRef<HTMLDivElement>(null);

  const { nickname, level, seconds, drinks, aiMessage } = (location.state as {
    nickname: string;
    level: string;
    seconds: number;
    drinks: Record<string, number>;
    aiMessage: string;
  }) || {
    nickname: "Guest",
    seconds: 0,
    drinks: { soju: 0, beer: 0, somaek: 0, makgeolli: 0, fruitsoju: 0 },
    level: "level0",
    aiMessage: "측정된 데이터가 없습니다.",
  };

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

  const saveResultAsImage = async () => {
    if (!captureRef.current) return;
    {
      const canvas = await html2canvas(captureRef.current, {
        useCORS: true,
        scale: 2,
        scrollY: -window.scrollY,
        backgroundColor: "#ffffff",
      });

      const dataUrl = canvas.toDataURL("image/png");

      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = "result.png";
      link.click();
    }
  };

  return (
    <div
      style={{
        padding: "40px",
        maxWidth: "600px",
        margin: "0 auto",
        textAlign: "center",
      }}
    >
      <div ref={captureRef} style={{ padding: "40px" }}>
        {/* 1. 닉네임 */}
        <h1
          style={{ fontSize: "48px", fontWeight: "bold", marginBottom: "20px" }}
        >
          {nickname}님의 술레벨은?
        </h1>

        {/* 2. 술자리 가진 시간 */}
        <p style={{ fontSize: "20px", marginBottom: "25px", color: "#555" }}>
          술자리 가진 시간: {formatTime(seconds)}
        </p>

        {/* 2-1. 시속 */}
        <p
          style={{ fontSize: "24px", marginBottom: "10px", fontWeight: "bold" }}
        >
          시속: {location.state?.gph ?? 0} 잔/시간
        </p>

        {/* 2-2. 주량 */}
        <p
          style={{
            fontSize: "32px",
            marginBottom: "30px",
            fontWeight: "bold",
            color: "#ec0808ff",
          }}
        >
          주량: {location.state?.bottleText ?? "0병"}
        </p>

        {/* 3. 술 종류별 잔 수 */}
        <div style={{ marginBottom: "30px" }}>
          <h2 style={{ marginBottom: "15px" }}>술 종류별 잔 수</h2>
          <ul style={{ listStyle: "none", padding: 0, marginBottom: "30px" }}>
            {Object.keys(drinks).map((key) => {
              const k = key as keyof Drinks;
              return (
                <li
                  key={k}
                  style={{
                    backgroundColor: "#f0f0f0",
                    padding: "5px",
                    borderRadius: "8px",
                    marginBottom: "8px",
                    fontSize: "16px",
                    fontWeight: "500",
                    textAlign: "center",
                  }}
                >
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
            marginBottom: "10px",
          }}
        />

        {/* 5. 술 레벨명 */}
        <h2
          style={{
            marginBottom: "40px",
            fontWeight: "bold",
            fontSize: "28px",
            color: "#333",
          }}
        >
          {levelNames[level]}
        </h2>

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
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: "50px",
          gap: "10px",
        }}
      >
        {/* 7. 결과 저장하기 버튼*/}
        <Button onClick={saveResultAsImage} style={{ marginBottom: "20px" }}>
          결과 이미지 저장하기
        </Button>

        {/* 8. 홈으로 버튼 */}
        <Button onClick={handleRestart}>홈으로</Button>
      </div>
    </div>
  );
}
