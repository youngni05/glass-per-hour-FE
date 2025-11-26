import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import nameImg from "../assets/images/이름_입력.png";
// api.ts 파일에서 API 기본 URL을 가져옵니다.
import { API_BASE_URL } from "../api";

export default function InputName() {
  // useState: 컴포넌트의 상태(데이터)를 관리하기 위한 React Hook입니다.
  // nickname: 현재 입력된 닉네임을 저장하는 변수
  // setNickname: nickname 값을 변경하는 함수
  const [nickname, setNickname] = useState("");

  // useNavigate: 페이지 이동을 위한 React Router Hook입니다.
  const navigate = useNavigate();

  // 입력창의 내용이 변경될 때마다 호출되는 함수
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNickname(e.target.value);
  };

  // '주량 측정하기' 버튼 클릭 시 실행되는 함수
  // async 키워드는 이 함수 안에서 비동기 작업(API 요청 등)을 기다릴 것임을 의미합니다.
  const handleStart = async () => {
    // 닉네임이 비어있는지 확인
    if (nickname.trim() === "") {
      alert("닉네임을 입력해주세요.");
      return;
    }

    // 백엔드 API 호출을 위해 try-catch 블록으로 감싸 에러를 처리합니다.
    try {
      // [수정된 부분] 백엔드에 사용자 생성을 요청합니다.
      // fetch 함수를 사용해 네트워크 요청을 보냅니다. await는 요청이 끝날 때까지 기다리게 합니다.
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: "POST", // 데이터 생성을 의미하는 POST 메서드 사용
        headers: {
          "Content-Type": "application/json", // 우리가 보내는 데이터 형식이 JSON임을 명시
        },
        // body에는 서버로 보낼 실제 데이터를 JSON 문자열 형태로 담습니다.
        body: JSON.stringify({
          userName: nickname, // 입력받은 닉네임을 userName 이라는 키로 보냅니다.
        }),
      });

      // 서버가 정상적인 응답(HTTP 2xx 상태 코드)을 주지 않았을 경우 에러를 발생시킵니다.
      if (!response.ok) {
        throw new Error("사용자 생성에 실패했습니다.");
      }

      // 서버로부터 받은 JSON 응답을 JavaScript 객체로 변환합니다.
      const user = await response.json();
      // 응답으로 받은 user 객체에서 id 값을 추출합니다. 이 id는 앞으로 모든 요청에서 사용자를 식별하는 데 쓰입니다.
      const userId = user.id;

      // navigate 함수를 사용해 /measure 페이지로 이동합니다.
      // state 객체를 통해 다음 페이지로 nickname과 방금 받은 userId를 전달합니다.
      navigate("/measure", { state: { nickname, userId } });

    } catch (error) {
      // API 요청 실패 시 사용자에게 알림을 표시하고, 콘솔에 에러를 기록합니다.
      console.error("API Error:", error);
      alert("서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.");
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