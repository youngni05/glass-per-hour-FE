import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import StartPage from "./pages/StartPage";
import InputName from "./pages/InputName";
import MeasurePage from "./pages/MeasurePage/Measure";
import ResultPage from "./pages/Result";

/**
 * App 컴포넌트는 전체 애플리케이션의 진입점입니다.
 * BrowserRouter, Routes, Route 컴포넌트를 사용해 페이지 간의 이동(라우팅)을 관리합니다.
 */
function App() {
  return (
    // 전체 앱을 감싸는 배경색 스타일
    <div style={{ backgroundColor: "#EDEDEC", minHeight: "100vh" }}>
      {/* BrowserRouter는 웹 브라우저의 주소(URL)와 UI를 동기화합니다. */}
      <BrowserRouter>
        {/* Routes는 여러 Route 중 현재 URL과 일치하는 첫 번째 Route만 렌더링합니다. */}
        <Routes>
          {/*
            Route는 특정 경로(path)와 해당 경로에 보여줄 컴포넌트(element)를 짝지어줍니다.
            예: 사용자가 웹사이트의 가장 기본 주소('/')로 접속하면 <StartPage /> 컴포넌트를 보여줍니다.
          */}
          <Route path="/" element={<StartPage />} />
          <Route path="/input-name" element={<InputName />} />
          <Route path="/measure" element={<MeasurePage />} />
          <Route path="/result" element={<ResultPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;