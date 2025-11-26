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

// API 응답으로 오는 User 객체의 타입을 정의합니다. TypeScript에서 타입 안정성을 위해 사용합니다.
interface User {
  id: number;
  userName: string;
  totalSojuEquivalent: number;
  characterLevel: number;
}

// 레벨 이름과 이미지 경로를 미리 정의해 둔 객체입니다.
const levelNames: Record<string, string> = {
  "level-loading": "레벨 계산 중...",
  level0: "LV0: 일청담 다이버",
  level1: "LV1: 술취한 다람쥐",
  level2: "LV2: 홍익인간",
  level3: "LV3: 술고래",
  level4: "LV4: 고수",
};
const levelImages: Record<string, string> = {
  "level-loading": level0Img, // 로딩 중에는 기본 이미지를 보여줍니다.
  level0: level0Img,
  level1: level1Img,
  level2: level2Img,
  level3: level3Img,
  level4: level4Img,
};

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // 이전 페이지(MeasurePage)에서 넘겨준 state 데이터들을 추출합니다.
  const {
    nickname,
    level: initialLevel, // 'level-loading' 상태로 전달됨
    aiMessage: initialAiMessage, // 'AI 분석 중...' 상태로 전달됨
    userId,
  } = (location.state as {
    nickname: string;
    level: string;
    aiMessage: string;
    userId?: number;
  }) || { // state가 없는 경우(예: URL로 직접 접근) 기본값 설정
    nickname: "Guest",
    level: "level0",
    aiMessage: "측정된 데이터가 없습니다.",
  };

  // useState Hook으로 이 컴포넌트에서 사용할 상태들을 관리합니다.
  const [aiMessage, setAiMessage] = useState(initialAiMessage); // AI 메시지 상태
  const [rankings, setRankings] = useState<User[]>([]); // 전체 랭킹 목록 상태
  const [finalLevel, setFinalLevel] = useState(initialLevel); // 최종 레벨 상태

  // useEffect Hook: 컴포넌트가 처음 렌더링될 때, 또는 특정 상태가 변경될 때 API 호출과 같은 'Side Effect'를 수행합니다.
  useEffect(() => {
    // [추가된 기능] 전체 랭킹 목록을 가져오는 함수
    const fetchRankings = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/rankings`);
        if (response.ok) {
          const data: User[] = await response.json();
          setRankings(data); // 받아온 랭킹 데이터로 상태 업데이트

          // [UX 개선] 랭킹 데이터에서 현재 사용자를 찾아 최종 레벨을 업데이트합니다.
          if (userId) {
            const currentUser = data.find(user => user.id === userId);
            if (currentUser) {
              setFinalLevel(`level${currentUser.characterLevel}`);
            }
          }
        } else {
          console.error("랭킹 정보를 가져오는 데 실패했습니다.");
        }
      } catch (error) {
        console.error("랭킹 API 호출 중 에러:", error);
      }
    };

    fetchRankings(); // 랭킹 가져오기 함수 호출

    // [추가된 기능] AI 메시지를 주기적으로 확인(Polling)하는 로직
    if (!userId || (aiMessage && aiMessage !== "AI 분석 중...")) {
      return; // userId가 없거나, 이미 메시지를 받았다면 폴링을 시작하지 않음
    }

    // 2초마다 백엔드에 AI 메시지가 완성되었는지 물어보는 interval 설정
    const interval = setInterval(async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/users/${userId}/ai-message`
        );
        // [수정된 부분] 사용자를 찾을 수 없는 경우(404), 폴링을 중단합니다.
        if (response.status === 404) {
          console.error("AI 메시지 폴링 중단: 사용자를 찾을 수 없습니다.");
          clearInterval(interval);
          return;
        }
        if (response.ok) {
          const data = await response.json();
          // 메시지가 완성되었으면 상태를 업데이트하고 interval을 중단합니다.
          if (data.aiMessage && data.aiMessage !== "AI 분석 중...") {
            setAiMessage(data.aiMessage);
            clearInterval(interval);
          }
        }
      } catch (error) {
        console.error("AI 메시지 폴링 중 에러:", error);
        clearInterval(interval); // 에러 발생 시에도 폴링 중단
      }
    }, 2000);

    // 컴포넌트가 사라질 때 interval을 정리하여 메모리 누수를 방지합니다.
    return () => clearInterval(interval);
  }, [userId, aiMessage]); // userId나 aiMessage 상태가 바뀔 때마다 이 useEffect를 다시 평가합니다.

  // '홈으로' 버튼 클릭 시 실행되는 함수
  const handleRestart = () => {
    navigate("/");
  };

  return (
    <div style={{ padding: "40px", maxWidth: "600px", margin: "0 auto", textAlign: "center" }}>
      {/* 1. 개인 결과 표시 영역 */}
      <div style={{ marginBottom: "50px" }}>
        <h1>{nickname}님의 술레벨은?</h1>
        <img
          src={levelImages[finalLevel]} // 최종 레벨에 맞는 이미지 표시
          alt={levelNames[finalLevel]}
          style={{ width: "400px", height: "auto", borderRadius: "10px", margin: "15px 0" }}
        />
        <h2>{levelNames[finalLevel]}</h2> {/* 최종 레벨 이름 표시 */}
        <div style={{ backgroundColor: "#f5f5f5", padding: "20px", borderRadius: "10px", border: "1px solid #ccc", textAlign: "left", marginTop: "15px" }}>
          <p>{aiMessage}</p> {/* AI 메시지 표시 */}
        </div>
      </div>

      {/* 2. 전체 랭킹 표시 영역 */}
      <div style={{ marginBottom: "30px" }}>
        <h2>🏆 전체 랭킹 🏆</h2>
        <ol style={{ listStyle: "none", padding: 0, border: "1px solid #ddd", borderRadius: "8px" }}>
          {rankings.length > 0 ? (
            rankings.map((user, index) => (
              <li
                key={user.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "12px 20px",
                  borderBottom: index < rankings.length - 1 ? "1px solid #ddd" : "none",
                  backgroundColor: user.id === userId ? "#eefcff" : "transparent", // 내 순위는 배경색으로 강조
                  fontWeight: user.id === userId ? "bold" : "normal",
                }}
              >
                <span>{index + 1}. {user.userName}</span>
                <span>{user.totalSojuEquivalent.toFixed(2)} 병</span>
              </li>
            ))
          ) : (
            <p>랭킹을 불러오는 중입니다...</p> // 데이터 로딩 중 표시
          )}
        </ol>
      </div>

      {/* 3. 홈으로 버튼 */}
      <Button onClick={handleRestart}>홈으로</Button>
    </div>
  );
}