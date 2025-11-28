import React, { useEffect, useState, useRef } from "react";
import html2canvas from "html2canvas";
import { getRankings } from "../../api/api";
import { User } from "../../api/api"; // Import the User interface
import Button from "../../components/ui/Button";

// Props structure now only needs the current user's name to highlight them
interface RankingProps {
  nickname: string;
}

export default function RankingList({ nickname }: RankingProps) {
  const [rankings, setRankings] = useState<User[]>([]);
  const rankingRef = useRef<HTMLDivElement>(null); // Ref for capturing the component

  // Function to fetch and update rankings
  const fetchRankings = async () => {
    try {
      const data = await getRankings();
      // The backend already sorts by totalSojuEquivalent, so no need to sort here.
      setRankings(data);
    } catch (error) {
      console.error("Failed to fetch rankings:", error);
      // Don't show an alert to avoid interrupting the user repeatedly
    }
  };

  // useEffect for initial fetch and auto-refresh
  useEffect(() => {
    fetchRankings(); // Initial fetch

    const intervalId = setInterval(() => {
      fetchRankings();
    }, 5000); // Auto-refresh every 5 seconds

    // Cleanup function to clear the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []);

  // Function to handle sharing
  const handleShare = () => {
    if (rankingRef.current) {
      html2canvas(rankingRef.current).then((canvas) => {
        const image = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = image;
        link.download = "my-ranking.png";
        link.click();
      });
    }
  };

  return (
    <div
      style={{
        marginTop: "30px",
        padding: "20px",
        textAlign: "center",
      }}
    >
      <div ref={rankingRef} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px' }}>
        <h2 style={{ marginBottom: "15px" }}>
          <span role="img" aria-label="trophy">
            🏆
          </span>{" "}
          실시간 랭킹
        </h2>

        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {rankings.map((user, idx) => {
              const isCurrentUser = user.userName === nickname;

              const itemStyle: React.CSSProperties = {
                padding: "10px 15px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "16px",
                borderBottom:
                  idx === rankings.length - 1 ? "none" : "1px solid #eee",
                backgroundColor: isCurrentUser ? "#e6f7ff" : "white",
                fontWeight: isCurrentUser ? "bold" : "normal",
              };

              return (
                <li key={user.id} style={itemStyle}>
                  <div>
                    <strong>{idx + 1}.</strong> {user.userName}
                  </div>
                  {/* Use totalSojuEquivalent from the User object */}
                  <div>{Math.round(user.totalSojuEquivalent)} 잔</div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <div style={{ marginTop: '20px' }}>
        <Button onClick={handleShare}>랭킹 이미지로 공유하기</Button>
      </div>
    </div>
  );
}