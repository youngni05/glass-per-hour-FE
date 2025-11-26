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
  // useLocation: 이전 페이지(InputName)에서 navigate state로 넘겨준 데이터(nickname, userId)를 받기 위해 사용
  const location = useLocation();
  // useNavigate: 다른 페이지로 이동하기 위해 사용
  const navigate = useNavigate();

  // 이전 페이지에서 받은 nickname, 없으면 'Guest'
  const nickname = (location.state as { nickname: string })?.nickname || "Guest";

  // useState: 컴포넌트의 상태(데이터)를 관리
  const [seconds, setSeconds] = useState(0); // 타이머 시간 (초)
  const [isRunning, setIsRunning] = useState(true); // 타이머 실행 상태
  const [drinks, setDrinks] = useState({ // 마신 술의 종류별 잔 수
    soju: 0,
    beer: 0,
    somaek: 0,
    makgeolli: 0,
    fruitsoju: 0,
  });

  // 술잔 수를 업데이트하는 함수 (+, - 버튼 클릭 시 호출됨)
  const updateDrink = async (type: keyof typeof drinks, amount: number) => {
    // 1. 화면에 즉시 반영 (낙관적 업데이트)
    setDrinks((prev) => ({
      ...prev,
      [type]: Math.max(prev[type] + amount, 0), // 0잔 미만으로 내려가지 않도록
    }));

    // 2. [수정된 부분] 백엔드에 주량 기록 API를 호출합니다.
    const userId = (location.state as { userId?: number })?.userId;
    // userId가 있고, 잔을 추가하는 경우(+1)에만 API 호출
    if (userId && amount > 0) {
      try {
        await fetch(`${API_BASE_URL}/users/${userId}/drinks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            drinkType: type.toUpperCase(), // 백엔드 Enum 형식에 맞게 대문자로 변환
            glassCount: amount,
          }),
        });
      } catch (error) {
        console.error("주량 기록 API 호출 실패:", error);
        // 필요하다면 여기서 사용자에게 에러를 알릴 수 있습니다.
      }
    }
  };

  // useEffect: 특정 상태(isRunning)가 변경될 때마다 특정 작업(타이머)을 수행하기 위해 사용
  useEffect(() => {
    if (!isRunning) return; // 타이머가 멈췄으면 아무것도 안 함
    // 1초(1000ms)마다 seconds 상태를 1씩 증가시킴
    const interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    // 컴포넌트가 사라지거나 isRunning 상태가 바뀌기 직전에 interval을 정리(cleanup)합니다.
    // 이렇게 하지 않으면 메모리 누수가 발생할 수 있습니다.
    return () => clearInterval(interval);
  }, [isRunning]); // isRunning 값이 바뀔 때마다 이 useEffect가 다시 실행됩니다.

  // '술자리 끝내기' 버튼 클릭 시 실행되는 함수
  const handleEnd = () => {
    setIsRunning(false); // 타이머 멈춤
    const userId = (location.state as { userId?: number })?.userId;

    if (!userId) {
      alert("사용자 ID가 없어 결과를 저장할 수 없습니다.");
      navigate("/"); // 문제가 생겼으므로 홈으로 돌려보냄
      return;
    }

    // [수정된 부분] UX 개선: API 응답을 기다리지 않고 결과 페이지로 즉시 이동
    // 'Fire and Forget' 방식으로 API 호출
    fetch(`${API_BASE_URL}/users/${userId}/finish`, {
      method: "POST",
    }).catch(error => {
      // 백그라운드에서 발생한 에러는 사용자에게 알리지 않고 콘솔에만 기록
      console.error("측정 종료 API 호출 실패 (백그라운드):", error);
    });

    // API 응답을 기다리지 않고 즉시 결과 페이지로 이동
    navigate("/result", {
      state: {
        nickname,
        seconds,
        drinks,
        level: "level-loading", // 최종 레벨은 결과 페이지에서 로딩 후 표시할 예정
        aiMessage: "AI 분석 중...", // AI 메시지도 결과 페이지에서 폴링으로 가져옴
        userId,
      },
    });
  };

  // 술 이미지 맵
  const drinkImages = {
    soju: sojuImg,
    beer: beerImg,
    somaek: somaekImg,
    makgeolli: makgeolliImg,
    fruitsoju: fruitsojuImg,
  };

  // 초를 HH:MM:SS 형식으로 변환하는 함수
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