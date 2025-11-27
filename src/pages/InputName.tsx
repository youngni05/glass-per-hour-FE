import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import nameImg from "../assets/images/이름_입력.png";

export default function InputName() {
  const [nickname, setNickname] = useState("");
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNickname(e.target.value);
  };

  const handleCreateRoom = () => {
    if (nickname.trim() === "") {
      alert("닉네임을 입력해주세요.");
      return;
    }
    navigate("/waiting-room", { state: { nickname, isHost: true } });
  };

  const handleJoinRoom = () => {
    if (nickname.trim() === "") {
      alert("닉네임을 입력해주세요.");
      return;
    }
    navigate("/join-room", { state: { nickname, isHost: false } });
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        gap: "20px",
      }}
    >
      <img
        src={nameImg}
        alt="이름 입력해요!!"
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
      <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
        <Button onClick={handleCreateRoom}>방 만들기</Button>
        <Button onClick={handleJoinRoom}>방 참여하기</Button>
      </div>
    </div>
  );
}
