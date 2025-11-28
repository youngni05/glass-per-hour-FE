import React, { useEffect, useState, useRef } from "react";
import html2canvas from "html2canvas";
import { getRankings } from "../../api/api";
import { User } from "../../api/api";
import Button from "../../components/ui/Button";

interface RankingProps {
  nickname: string;
}

const formatTime = (totalSeconds: number) => {
  if (isNaN(totalSeconds) || totalSeconds < 0) {
    totalSeconds = 0;
  }
  const h = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const s = String(Math.floor(totalSeconds % 60)).padStart(2, "0");
  return `${h}:${m}:${s}`;
};

export default function RankingList({ nickname }: RankingProps) {
  const [rankings, setRankings] = useState<User[]>([]);
  const [times, setTimes] = useState<Record<number, number>>({});
  const rankingRef = useRef<HTMLDivElement>(null);

  // Fetch ranking data periodically
  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const data = await getRankings();
        setRankings(data);
      } catch (error) {
        console.error("Failed to fetch rankings:", error);
      }
    };

    fetchRankings(); // Initial fetch
    const intervalId = setInterval(fetchRankings, 5000); // Poll every 5 seconds

    return () => clearInterval(intervalId);
  }, []);

  // Update timers every second
  useEffect(() => {
    const timerId = setInterval(() => {
      const now = Date.now();
      const newTimes: Record<number, number> = {};

      rankings.forEach((user) => {
        if (!user.id || !user.joinedAt) return;

        const startTime = new Date(user.joinedAt).getTime();
        if (user.finishedAt) {
          const finishTime = new Date(user.finishedAt).getTime();
          newTimes[user.id] = (finishTime - startTime) / 1000;
        } else {
          newTimes[user.id] = (now - startTime) / 1000;
        }
      });
      setTimes(newTimes);
    }, 1000); // Update every second

    return () => clearInterval(timerId);
  }, [rankings]); // Rerun when rankings data changes

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
    <div style={{ marginTop: "30px", padding: "20px", textAlign: "center" }}>
      <div ref={rankingRef} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px' }}>
        <h2 style={{ marginBottom: "15px" }}>
          <span role="img" aria-label="trophy">🏆</span>{" "}
          실시간 랭킹
        </h2>

        <div style={{ border: "1px solid #ddd", borderRadius: "8px", overflow: "hidden" }}>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {rankings.map((user, idx) => {
              const isCurrentUser = user.userName === nickname;
              const itemStyle: React.CSSProperties = {
                padding: "10px 15px",
                display: "grid",
                gridTemplateColumns: "auto 1fr auto",
                gap: "15px",
                alignItems: "center",
                fontSize: "16px",
                borderBottom: idx === rankings.length - 1 ? "none" : "1px solid #eee",
                backgroundColor: isCurrentUser ? "#e6f7ff" : "white",
                fontWeight: isCurrentUser ? "bold" : "normal",
                textAlign: "left",
              };

              return (
                <li key={user.id} style={itemStyle}>
                  <strong style={{ textAlign: "right" }}>{idx + 1}.</strong>
                  <span>{user.userName}</span>
                  <div style={{ textAlign: "right" }}>
                    <span>{user.totalSojuEquivalent.toFixed(1)} 잔</span>
                    <span style={{ marginLeft: '10px', color: '#555', fontSize: '14px' }}>
                      ({formatTime(times[user.id] || 0)})
                    </span>
                  </div>
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
