import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";

export default function JoinRoom() {
  const location = useLocation();
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState("");

  const nickname =
    (location.state as { nickname: string })?.nickname || "Guest";

  const handleJoin = () => {
    // 1. 빈값 체크
    if (roomCode.trim() === "") {
      alert("방 코드를 입력해주세요!");
      return;
    }

    // 2. 숫자 4자리 체크
    const codeRegex = /^\d{4}$/;
    if (!codeRegex.test(roomCode)) {
      alert("방 코드는 숫자 4자리여야 합니다.");
      return;
    }

    // 3. 정상 → WaitingRoom으로 이동
    navigate("/waiting-room", {
      state: {
        roomCode,
        isHost: false,
      },
    });
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "20px",
        height: "100vh",
        justifyContent: "center",
      }}
    >
      <input
        type="text"
        placeholder="방 코드 4자리 입력"
        maxLength={4}
        value={roomCode}
        onChange={(e) => setRoomCode(e.target.value)}
        style={{
          padding: "10px",
          fontSize: "16px",
          borderRadius: "8px",
          border: "1px solid #000",
          width: "200px",
          textAlign: "center",
        }}
      />
      {/* 참여하기 버튼 */}
      <Button
        onClick={handleJoin}
        style={{
          width: "200px",
          fontSize: "18px",
          padding: "10px",
        }}
      >
        방 참여하기
      </Button>
    </div>
  );
}
