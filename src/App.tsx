import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import StartPage from "./pages/StartPage";
import InputName from "./pages/InputName";
import WaitingRoom from "./pages/WaitingRoom";
import JoinRoom from "./pages/JoinRoom";
import MeasurePage from "./pages/MeasurePage/Measure";
import ResultPage from "./pages/Result";

function App() {
  return (
    <div style={{ backgroundColor: "#EDEDEC", minHeight: "100vh" }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<StartPage />} />
          <Route path="/input-name" element={<InputName />} />
          <Route path="/waiting-room" element={<WaitingRoom />} />
          <Route path="/join-room" element={<JoinRoom />} />
          <Route path="/measure" element={<MeasurePage />} />
          <Route path="/result" element={<ResultPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
