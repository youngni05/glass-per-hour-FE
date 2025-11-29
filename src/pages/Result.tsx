// src/pages/Result.tsx
import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import Button from "../components/ui/Button";
import { getAiMessage, getUser } from "../api/api";
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
  const [searchParams] = useSearchParams();
  const captureRef = useRef<HTMLDivElement>(null);

  const [state, setState] = useState<any>(location.state || null);
  const [loading, setLoading] = useState(!location.state);

  useEffect(() => {
    const fetchUser = async () => {
      const userIdParam = searchParams.get("userId");
      if (!location.state && userIdParam) {
        try {
          const user = await getUser(Number(userIdParam));

          let bottleText = "0병";
          if (user.totalSojuEquivalent > 0) {
            const b = (user.totalSojuEquivalent / 7.2).toFixed(1);
            bottleText = `${b}병`;
          }

          const levelIndex = user.characterLevel ?? 0;
          const level = `level${levelIndex}`;

          // Calculate seconds and GPH from timestamps
          let seconds = 0;
          let gph = 0;
          if (user.joinedAt && user.finishedAt) {
            const joinTime = new Date(user.joinedAt).getTime();
            const finishTime = new Date(user.finishedAt).getTime();
            seconds = Math.floor((finishTime - joinTime) / 1000);
            const hours = seconds / 3600;
            if (hours > 0) {
              gph = Math.round(user.totalSojuEquivalent / hours);
            }
          }

          setState({
            nickname: user.userName,
            level: level,
            seconds: seconds,
            drinks: {
              soju: user.sojuCount,
              beer: user.beerCount,
              somaek: user.somaekCount,
              makgeolli: user.makgeolliCount,
              fruitsoju: user.fruitsojuCount,
            },
            aiMessage: user.aiMessage,
            userId: user.id,
            gph: gph,
            bottleText: bottleText,
          });
        } catch (e) {
          console.error(e);
          alert("사용자 정보를 불러오는데 실패했습니다.");
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    fetchUser();
  }, [location.state, searchParams]);

  const {
    nickname,
    level,
    seconds,
    drinks,
    aiMessage: initialAiMessage,
    userId,
    gph,
    bottleText,
  } = state || {
    nickname: "Guest",
    seconds: 0,
    drinks: { soju: 0, beer: 0, somaek: 0, makgeolli: 0, fruitsoju: 0 },
    level: "level0",
    aiMessage: "측정된 데이터가 없습니다.",
    gph: 0,
    bottleText: "0병",
  };

  const [aiMessage, setAiMessage] = useState(initialAiMessage || "AI 분석 중...");

  useEffect(() => {
    if (state && state.aiMessage) {
      setAiMessage(state.aiMessage);
    }
  }, [state]);

  useEffect(() => {
    if (!userId || (aiMessage && !aiMessage.includes("분석 중"))) {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const user = await getAiMessage(userId);
        if (user.aiMessage && !user.aiMessage.includes("분석 중")) {
          setAiMessage(user.aiMessage);
          clearInterval(interval);
        }
      } catch (error) {
        console.error("Failed to fetch AI message:", error);
        clearInterval(interval);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [userId, aiMessage]);

  const labels: Record<keyof Drinks, string> = {
    soju: "소주",
    beer: "맥주",
    somaek: "소맥",
    makgeolli: "막걸리",
    fruitsoju: "과일소주",
  };

  const handleRestart = () => navigate("/");

  const formatTime = (totalSeconds: number) => {
    const h = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
    const s = String(totalSeconds % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  const saveResultAsImage = async () => {
    if (!captureRef.current) return;
    try {
      const canvas = await html2canvas(captureRef.current, {
        useCORS: true, scale: 2, scrollY: -window.scrollY, backgroundColor: "#ffffff",
      });
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `${nickname}_술레벨_결과.png`;
      link.click();
    } catch (error) {
      console.error("Failed to save image:", error);
      alert("이미지 저장에 실패했습니다.");
    }
  };

  const handleCopyLink = () => {
    if (!userId) {
      alert("공유할 수 있는 사용자 정보가 없습니다.");
      return;
    }
    const url = `${window.location.origin}/result?userId=${userId}`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        alert("링크가 복사되었습니다!");
      }).catch(() => {
        fallbackCopyTextToClipboard(url);
      });
    } else {
      fallbackCopyTextToClipboard(url);
    }
  };

  const fallbackCopyTextToClipboard = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      alert("링크가 복사되었습니다!");
    } catch (err) {
      alert("링크 복사에 실패했습니다. 링크: " + text);
    }
    document.body.removeChild(textArea);
  };

  if (loading) return <div style={{ textAlign: "center", padding: "50px" }}>로딩 중...</div>;

  return (
    <div style={{ padding: "40px", maxWidth: "600px", margin: "0 auto", textAlign: "center" }}>
      <div ref={captureRef} style={{ padding: "40px", background: "#EDEDEC" }}>
        <h1 style={{ fontSize: "48px", fontWeight: "bold", marginBottom: "20px" }}>{nickname}님의 술레벨은?</h1>
        <p style={{ fontSize: "20px", marginBottom: "25px", color: "#555" }}>술자리 가진 시간: {formatTime(seconds)}</p>
        <p style={{ fontSize: "24px", marginBottom: "10px", fontWeight: "bold" }}>시속: {gph ?? 0} 잔/시간</p>
        <p style={{ fontSize: "32px", marginBottom: "30px", fontWeight: "bold", color: "#ec0808ff" }}>주량: {bottleText ?? "0병"}</p>
        <div style={{ marginBottom: "30px" }}>
          <h2 style={{ marginBottom: "15px" }}>술 종류별 잔 수</h2>
          <ul style={{ listStyle: "none", padding: 0, marginBottom: "30px" }}>
            {Object.keys(drinks).map((key) => {
              const k = key as keyof Drinks;
              return <li key={k} style={{ backgroundColor: "#f0f0f0", padding: "5px", borderRadius: "8px", marginBottom: "8px", fontSize: "16px", fontWeight: "500", textAlign: "center" }}>{labels[k]}: {Math.round(drinks[k])}잔</li>;
            })}
          </ul>
        </div>
        <img src={levelImages[level]} alt={levelNames[level]} style={{ width: "400px", height: "auto", borderRadius: "10px", marginBottom: "10px" }} />
        <h2 style={{ marginBottom: "40px", fontWeight: "bold", fontSize: "28px", color: "#333" }}>{levelNames[level]}</h2>
        <div style={{ backgroundColor: "#f5f5f5", padding: "20px", borderRadius: "10px", border: "1px solid #ccc", textAlign: "left", marginBottom: "25px" }}>
          <p>{aiMessage}</p>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "50px", gap: "10px" }}>
        <Button onClick={saveResultAsImage} style={{ marginBottom: "10px" }}>결과 저장하기</Button>
        <Button onClick={handleCopyLink} style={{ marginBottom: "10px" }}>링크 공유하기</Button>
        <Button onClick={handleRestart}>홈으로</Button>
      </div>
    </div>
  );
}