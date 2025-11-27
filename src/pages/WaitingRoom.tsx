// src/pages/WaitingRoom.tsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";

type LocationState = {
  nickname: string;
  isHost: boolean;
  roomCode?: string;
};

export default function WaitingRoom() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLeave = () => {
    navigate("/");
  };

  const {
    nickname,
    isHost,
    roomCode: joinedRoomCode,
  } = location.state as LocationState;

  const [roomCode, setRoomCode] = useState<string>(
    isHost ? "" : joinedRoomCode || ""
  );
  const [participants, setParticipants] = useState<string[]>([nickname]);
  const [newParticipant, setNewParticipant] = useState("");

  useEffect(() => {
    if (isHost) {
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      setRoomCode(code);
    }
  }, [isHost]);

  const handleAddParticipant = () => {
    if (newParticipant.trim() === "") return;
    setParticipants((prev) => [...prev, newParticipant.trim()]);
    setNewParticipant("");
  };

  const handleStart = () => {
    navigate("/measure", {
      state: { nickname, participants, roomCode },
    });
  };

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "420px",
        margin: "0 auto",
        textAlign: "center",
      }}
    >
      <h1 style={{ marginBottom: "20px", fontSize: "26px" }}>대기실</h1>

      <div
        style={{
          backgroundColor: "#fff",
          padding: "15px",
          borderRadius: "10px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          marginBottom: "20px",
        }}
      >
        <p style={{ fontSize: "32px", marginBottom: "10px" }}>
          방 코드: <strong>{roomCode}</strong>
        </p>
        <p style={{ fontSize: "18px" }}>참여자: {participants.length}명</p>
      </div>

      {/* 참여자 목록 */}
      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          fontSize: "18px",
          fontWeight: "bold",
        }}
      >
        {participants.map((p) => (
          <div
            key={p}
            style={{
              backgroundColor: "#f8f8f8",
              padding: "10px",
              borderRadius: "8px",
              fontSize: "16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
            }}
          >
            <span>{p}</span>
            {p === nickname && isHost && (
              <span style={{ fontSize: "20px" }}>👑</span>
            )}
          </div>
        ))}
      </div>

      {/* 테스트용 참여자 추가 - 참여자 화면에서만 */}
      {!isHost && (
        <div style={{ marginBottom: "20px" }}>
          <input
            type="text"
            placeholder="참여자 추가 (테스트)"
            value={newParticipant}
            onChange={(e) => setNewParticipant(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              marginRight: "10px",
              width: "60%",
            }}
          />
          <Button onClick={handleAddParticipant}>추가</Button>
        </div>
      )}

      {/* 시작하기 & 방 나가기 버튼 */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          alignItems: "center",
        }}
      >
        {isHost ? (
          <Button onClick={handleStart} style={{ width: "60%" }}>
            주량 측정 시작하기
          </Button>
        ) : (
          <p
            style={{ fontStyle: "italic", color: "#555", marginBottom: "10px" }}
          >
            방장이 시작할 때까지 기다려주세요...
          </p>
        )}

        <Button
          onClick={handleLeave}
          style={{
            width: "60%",
            backgroundColor: "#e0e0e0",
            color: "#000",
          }}
        >
          방 나가기
        </Button>
      </div>
    </div>
  );
}
