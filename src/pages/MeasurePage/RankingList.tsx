// src/components/RankingList.tsx
import React, { useEffect, useState } from "react";

// 랭킹 항목 데이터 구조 정의 (닉네임과 소주 잔 수)
interface RankItem {
  nickname: string;
  sojuEq: number; // 소주 환산 잔 수
}

// Props 구조 정의
interface RankingProps {
  nickname: string;
  sojuEq: number; // 현재 사용자의 소주 환산 잔 수
}

// ⚠️ MOCK 데이터: 백엔드 연결 전까지 사용하는 가짜 데이터
const MOCK_RANKINGS: RankItem[] = [
  { nickname: "주왕1호", sojuEq: 32.0 },
  { nickname: "만취요정", sojuEq: 28.0 },
  { nickname: "알콜몬", sojuEq: 21.0 },
  { nickname: "소주짱", sojuEq: 14.0 },
  { nickname: "음료수", sojuEq: 7.0 },
  { nickname: "해장중", sojuEq: 24.0 },
  { nickname: "취한곰", sojuEq: 18.0 },
  { nickname: "술고래", sojuEq: 12.0 },
  { nickname: "맥주천사", sojuEq: 9.0 },
  { nickname: "청하", sojuEq: 5.0 },
];

export default function RankingList({ nickname, sojuEq }: RankingProps) {
  const [displayRankings, setDisplayRankings] = useState<RankItem[]>([]);

  useEffect(() => {
    const currentUserRecord: RankItem = { nickname, sojuEq };

    // MOCK 데이터 복사 + 현재 사용자 기록 반영
    let list = MOCK_RANKINGS.filter((item) => item.nickname !== nickname);
    list = [...list, currentUserRecord];

    // 소주 잔 수 기준 내림차순 정렬
    list.sort((a, b) => b.sojuEq - a.sojuEq);

    setDisplayRankings(list);
  }, [nickname, sojuEq]);

  return (
    <div
      style={{
        marginTop: "30px",
        padding: "20px",
        textAlign: "center",
      }}
    >
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
          {displayRankings.map((item, idx) => {
            const isCurrentUser = item.nickname === nickname;

            const itemStyle: React.CSSProperties = {
              padding: "10px 15px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "16px",
              borderBottom:
                idx === displayRankings.length - 1 ? "none" : "1px solid #eee",
              backgroundColor: isCurrentUser ? "#e6f7ff" : "white",
              fontWeight: isCurrentUser ? "bold" : "normal",
            };

            return (
              <li key={item.nickname} style={itemStyle}>
                <div>
                  <strong>{idx + 1}.</strong> {item.nickname}
                </div>
                <div>{Math.round(item.sojuEq)} 잔</div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
