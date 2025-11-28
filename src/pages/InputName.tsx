import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import nameImg from "../assets/images/이름_입력.png";
import { createUser } from "../api/api"; // Import the new createUser function

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
      // Call the new createUser function
      const user = await createUser(nickname);
      
      // The user object from the backend contains the id
      const userId = user.id;

      // Navigate to the measure page with the nickname and new userId
      navigate("/measure", { state: { nickname, userId } });
    } catch (error) {
      console.error("API Error:", error);
      alert("서버 연결에 실패했습니다. 백엔드가 실행 중인지 확인해주세요.");
      // For testing purposes, you can uncomment the line below to proceed even if the API fails
      // navigate("/measure", { state: { nickname, userId: 1 } });
    }
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
        alt="재밌는 이미지"
        style={{ width: "500px", height: "auto", borderRadius: "10px" }}
      />
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
      <Button onClick={handleStart}>주량 측정하기</Button>
    </div>
  );
}