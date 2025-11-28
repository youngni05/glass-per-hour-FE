// src/pages/Result.tsx
import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import { API_BASE_URL } from "../api";
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
  const captureRef = useRef<HTMLDivElement>(null);

  // 🔹 카카오톡 공유 버튼
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.Kakao &&
      !window.Kakao.isInitialized()
    ) {
      const kakaoKey = process.env.REACT_APP_KAKAO_JS_KEY;
      if (!kakaoKey) {
        return;
      }
      window.Kakao.init(kakaoKey);
    }
  }, []);

  const {
    nickname,
    level,
    seconds,
    drinks,
    aiMessage: initialAiMessage,
    userId,
    gph,
    bottleText,
  } = (location.state as {
    nickname: string;
    level: string;
    seconds: number;
    drinks: Record<string, number>;
    aiMessage: string;
    userId?: number;
    gph: number;
    bottleText: string;
  }) || {
    nickname: "Guest",
    seconds: 0,
    drinks: { soju: 0, beer: 0, somaek: 0, makgeolli: 0, fruitsoju: 0 },
    level: "level0",
    aiMessage: "측정된 데이터가 없습니다.",
    gph: 0,
    bottleText: "0병",
  };

  const [aiMessage, setAiMessage] = useState(initialAiMessage);

  useEffect(() => {
    if (!userId || (aiMessage && aiMessage !== "AI 분석 중...")) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/users/${userId}/ai-message`
        );
        if (response.ok) {
          const data = await response.json();
          if (data.aiMessage && data.aiMessage !== "AI 분석 중...") {
            setAiMessage(data.aiMessage);
            clearInterval(interval);
          }
        }
      } catch (error) {
        console.error("Failed to fetch AI message:", error);
        // Optional: stop polling on error
        clearInterval(interval);
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
    navigate("/");
  };

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(s).padStart(2, "0")}`;
  };

  const saveResultAsImage = async () => {
    if (!captureRef.current) return;
    try {
      const canvas = await html2canvas(captureRef.current, {
        useCORS: true,
        scale: 2,
        scrollY: -window.scrollY,
        backgroundColor: "#ffffff",
      });
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `${nickname}_술레벨_결과.png`;
      link.click();
    } catch (error) {
      console.error("Failed to save image:", error);
      alert("이미지 저장에 실패했습니다.");
    }
  };

  const handleKakaoShare = () => {
    if (!window.Kakao) return;

    window.Kakao.Link.sendDefault({
      objectType: "feed",
      content: {
        title: `${nickname}님의 술레벨 결과`,
        description: `주량: ${bottleText}\n시속: ${gph} 잔/시간\n${aiMessage}`,
        imageUrl: "https://your-site.com/share-image.png", // 공유 이미지 URL
        link: {
          mobileWebUrl: "https://your-site.com",
          webUrl: "https://your-site.com",
        },
      },
      buttons: [
        {
          title: "앱에서 확인하기",
          link: {
            mobileWebUrl: "https://your-site.com",
            webUrl: "https://your-site.com",
          },
        },
      ],
    });
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
      <div ref={captureRef} style={{ padding: "40px", background: "#EDEDEC" }}>
        <h1
          style={{ fontSize: "48px", fontWeight: "bold", marginBottom: "20px" }}
        >
          {nickname}님의 술레벨은?
        </h1>

        <p style={{ fontSize: "20px", marginBottom: "25px", color: "#555" }}>
          술자리 가진 시간: {formatTime(seconds)}
        </p>

        <p
          style={{ fontSize: "24px", marginBottom: "10px", fontWeight: "bold" }}
        >
          시속: {gph ?? 0} 잔/시간
        </p>

        <p
          style={{
            fontSize: "32px",
            marginBottom: "30px",
            fontWeight: "bold",
            color: "#ec0808ff",
          }}
        >
          주량: {bottleText ?? "0병"}
        </p>

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
        <Button onClick={saveResultAsImage} style={{ marginBottom: "10px" }}>
          결과 저장하기
        </Button>

        {/*8. 링크 공유하기 버튼*/}
        <Button onClick={handleKakaoShare} style={{ marginBottom: "10px" }}>
          링크 공유하기
        </Button>

        {/* 9. 홈으로 버튼 */}
        <Button onClick={handleRestart}>홈으로</Button>
      </div>
    </div>
  );
}
