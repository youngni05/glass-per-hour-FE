// src/components/ui/Button.tsx
import React from "react";

type ButtonProps = {
  children: React.ReactNode; // 버튼 안에 들어갈 글자
  onClick?: () => void; // 버튼 클릭 시 실행할 함수
  style?: React.CSSProperties; // 추가 스타일링
};

export default function Button({ children, onClick, style }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        backgroundColor: "#ffffff", // 배경 흰색
        border: "2px solid #000000", // 테두리 검은색
        borderRadius: "8px", // 모서리 둥글게
        padding: "10px 20px", // 여백
        fontWeight: "bold", // 글자 굵게
        fontSize: "16px", // 글자 크기
        cursor: "pointer", // 마우스 올리면 포인터 표시
        ...style,
      }}
    >
      {children}
    </button>
  );
}
