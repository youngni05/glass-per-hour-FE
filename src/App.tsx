import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import StartPage from "./pages/StartPage";
import InputName from "./pages/InputName";
import MeasurePage from "./pages/MeasurePage/Measure";
import ResultPage from "./pages/Result";
import { API_BASE_URL } from "./api";

function App() {
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const testApiConnection = async () => {
    try {
      const userId = 1; // Hardcoded for testing
      const response = await fetch(`${API_BASE_URL}/users/${userId}/drinks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          drinkType: 'BEER', // Example value
          amount: 500, // Example value
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setApiResponse(JSON.stringify(data, null, 2));
      setError(null);
    } catch (e: any) {
      setError(e.message);
      setApiResponse(null);
    }
  };

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
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>API Connection Test</h1>
        <button onClick={testApiConnection} style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}>
          Test Backend API (Add Drink for User 1)
        </button>
        {apiResponse && (
          <div style={{ marginTop: '20px', backgroundColor: '#f0f0f0', padding: '15px', borderRadius: '5px', textAlign: 'left' }}>
            <h2>API Response:</h2>
            <pre>{apiResponse}</pre>
          </div>
        )}
        {error && (
          <div style={{ marginTop: '20px', backgroundColor: '#ffe0e0', color: 'red', padding: '15px', borderRadius: '5px', textAlign: 'left' }}>
            <h2>Error:</h2>
            <pre>{error}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

