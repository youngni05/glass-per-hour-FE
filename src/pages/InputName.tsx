import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import nameImg from "../assets/images/이름_입력.png";
import { API_BASE_URL } from "../api";

export default function InputName() {
  const [nickname, setNickname] = useState("");
  const navigate = useNavigate();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNickname(e.target.value);
  };

  const handleStart = async () => {
    if (nickname.trim() === "") {
      alert("닉네임을 입력해주세요.");
      return;
    }

    try {
      // 방 생성 API 호출 (1인용 방)
      const response = await fetch(`${API_BASE_URL}/rooms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomName: `${nickname}의 혼술방`, // AI가 지어주게 하려면 null로 보내도 됨
          hostName: nickname,
        }),
      });

      if (!response.ok) {
        throw new Error("방 생성 실패");
      }

      const data = await response.json();
      const userId = data.hostUserId; // 응답에서 userId 추출

      // userId와 nickname을 가지고 측정 페이지로 이동
      navigate("/measure", { state: { nickname, userId } });
    } catch (error) {
      console.error("API Error:", error);
      alert("서버 연결에 실패했습니다. 백엔드가 실행 중인지 확인해주세요.");
      // 테스트를 위해 실패해도 일단 넘어가게 하려면 아래 주석 해제
      // navigate("/measure", { state: { nickname, userId: 1 } });
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column", // 세로로 배치
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        gap: "20px", // 요소 사이 간격
      }}
    >
      {/* 이미지 */}
      <img
        src={nameImg}
        alt="재밌는 이미지"
        style={{ width: "500px", height: "auto", borderRadius: "10px" }}
      />

      {/* 닉네임 입력창 */}
      <input
        type="text"
        placeholder="닉네임을 입력하세요"
        value={nickname}
        onChange={handleChange}
        style={{
          padding: "10px 15px",
          fontSize: "16px",
          borderRadius: "8px",
          border: "1px solid #000",
          width: "250px",
        }}
      />

      {/* 주량 측정 버튼 */}
      <Button onClick={handleStart}>주량 측정하기</Button>
    </div>
  );
}
