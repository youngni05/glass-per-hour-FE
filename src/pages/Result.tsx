// src/pages/Result.tsx
import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import Button from "../components/ui/Button";
import { getAiMessage, getUser } from "../api/api"; // Import the new API function
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

  // KakaoTalk share button setup
  useEffect(() => {
    if (window.Kakao && !window.Kakao.isInitialized()) {
      const kakaoKey = process.env.REACT_APP_KAKAO_JS_KEY;
      if (kakaoKey) {
        window.Kakao.init(kakaoKey);
      }
    }
  }, []);

  const [state, setState] = useState<any>(location.state || null);
  const [loading, setLoading] = useState(!location.state);

  useEffect(() => {
    const fetchUser = async () => {
      const userIdParam = searchParams.get("userId");
      if (!location.state && userIdParam) {
        try {
          const user = await getUser(Number(userIdParam));
          // Reconstruct state from user data
          // Note: This is an approximation as we don't store drinks breakdown in User entity perfectly for this view
          // But we can show the main stats.
          // For now, let's assume we just show what we have.
          // Since the User entity doesn't have drinks breakdown, we might show 0 for drinks list or hide it if empty.
          // Or we can just show the total bottles and level.

          let bottleText = "0병";
          const bottles = user.totalSojuEquivalent / 7.2; // Approximate back calculation if needed, or just use what we have
          // Actually, let's just use the level and message.
          // We need to calculate bottleText from totalSojuEquivalent if possible or just show "기록된 주량"

          if (user.totalSojuEquivalent > 0) {
            const b = Math.round((user.totalSojuEquivalent / 7.2) * 2) / 2;
            const full = Math.floor(b);
            const half = b % 1 === 0.5;
            if (full === 0 && half) bottleText = "반병";
            else if (half) bottleText = `${full}병 반`;
            else bottleText = `${full}병`;
          }

          // Determine level based on bottle count (approx)
          const b = user.totalSojuEquivalent / 7.2;
          let level = "level0";
          if (b <= 0.5) level = "level0";
          else if (b <= 1) level = "level1";
          else if (b <= 1.5) level = "level2";
          else if (b <= 2) level = "level3";
          else level = "level4";

          setState({
            nickname: user.userName,
            level: level, // We might need to store level in DB or recalculate
            seconds: 0, // We don't have duration in User entity easily accessible as "seconds" unless we diff joinedAt and finishedAt
            drinks: { soju: 0, beer: 0, somaek: 0, makgeolli: 0, fruitsoju: 0 }, // We don't have this detail
            aiMessage: user.aiMessage,
            userId: user.id,
            gph: 0, // We can calculate if we have duration
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

  // Update aiMessage when state changes (e.g. loaded from API)
  useEffect(() => {
    if (state && state.aiMessage) {
      setAiMessage(state.aiMessage);
    }
  }, [state]);

  // Polling for AI message
  useEffect(() => {
    // Only poll if we have a userId and the message is still pending
    if (!userId || (aiMessage && !aiMessage.includes("분석 중"))) {
      return;
    }

    const interval = setInterval(async () => {
      try {
        // Use the new getAiMessage function
        const user = await getAiMessage(userId);
        if (user.aiMessage && !user.aiMessage.includes("분석 중")) {
          setAiMessage(user.aiMessage);
          clearInterval(interval); // Stop polling once we have the message
        }
      } catch (error) {
        console.error("Failed to fetch AI message:", error);
        clearInterval(interval); // Stop polling on error
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(interval); // Cleanup on unmount
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

  const handleKakaoShare = () => {
    if (!window.Kakao) return;
    window.Kakao.Link.sendDefault({
      objectType: "feed",
      content: {
        title: `${nickname}님의 술레벨 결과`,
        description: `주량: ${bottleText}\n시속: ${gph} 잔/시간\n${aiMessage}`,
        imageUrl: "https://your-site.com/share-image.png",
        link: { mobileWebUrl: "https://your-site.com", webUrl: "https://your-site.com" },
      },
      buttons: [{ title: "앱에서 확인하기", link: { mobileWebUrl: "https://your-site.com", webUrl: "https://your-site.com" } }],
    });
  };

  const handleCopyLink = () => {
    if (!userId) {
      alert("공유할 수 있는 사용자 정보가 없습니다.");
      return;
    }
    const url = `${window.location.origin}/result?userId=${userId}`;
    navigator.clipboard.writeText(url).then(() => {
      alert("링크가 복사되었습니다!");
    }).catch(() => {
      alert("링크 복사에 실패했습니다.");
    });
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
              return <li key={k} style={{ backgroundColor: "#f0f0f0", padding: "5px", borderRadius: "8px", marginBottom: "8px", fontSize: "16px", fontWeight: "500", textAlign: "center" }}>{labels[k]}: {drinks[k]}잔</li>;
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