import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import StartPage from "./pages/StartPage";
import InputName from "./pages/InputName";
import MeasurePage from "./pages/MeasurePage/Measure";
import ResultPage from "./pages/Result";

function App() {
  return (
    <div style={{ backgroundColor: "#EDEDEC", minHeight: "100vh" }}>
      <BrowserRouter>
        <Routes>
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
