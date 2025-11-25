import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import bgImage from "../assets/images/해커톤_표지.png";

export default function StartPage() {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate("/input-name"); // 다음 페이지로 이동
  };

  // 전체 페이지 스타일
  const pageStyle: React.CSSProperties = {
    width: "100vw",
    height: "100vh",
    backgroundImage: `url(${bgImage})`,
    backgroundSize: "contain", // 화면 전체를 채움
    backgroundPosition: "center", // 중앙 정렬
    backgroundRepeat: "no-repeat",
    position: "relative", // 버튼 절대 위치 기준
  };

  // 버튼 스타일
  const buttonStyle: React.CSSProperties = {
    position: "absolute",
    bottom: "20%",
    left: "50%",
    transform: "translateX(-50%)",
    width: "200px",
    height: "50px",
    fontSize: "20px",
  };

  return (
    <div style={pageStyle}>
      <Button style={buttonStyle} onClick={handleStart}>
        시작하기
      </Button>
    </div>
  );
}
