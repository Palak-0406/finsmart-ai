import { useState } from "react";

export default function AIInsights({ transactions, dark }) {
  const [insight, setInsight] = useState("");
  const [loading, setLoading] = useState(false);

  async function getInsights() {
    setLoading(true);
    setInsight("");

    await new Promise(resolve => setTimeout(resolve, 1500));

    const totalExpense = transactions
      .filter(t => Number(t.amount) < 0)
      .reduce((s, t) => s + Math.abs(Number(t.amount)), 0);

    const totalIncome = transactions
      .filter(t => Number(t.amount) > 0)
      .reduce((s, t) => s + Number(t.amount), 0);

    const savingsRate = totalIncome > 0
      ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100)
      : 0;

    const foodSpend = transactions
      .filter(t => t.category === "Food")
      .reduce((s, t) => s + Math.abs(Number(t.amount)), 0);

    const topCategory = Object.entries(
      transactions.filter(t => Number(t.amount) < 0).reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + Math.abs(Number(t.amount));
        return acc;
      }, {})
    ).sort((a, b) => b[1] - a[1])[0]?.[0] || "expenses";

    setInsight(
      `Your top spending category is ${topCategory}. Consider setting a monthly limit to stay on track.\n\nYou spent ₹${foodSpend.toLocaleString("en-IN")} on Food this month. Cooking at home more often can save ₹1,000+ easily.\n\nYour savings rate is ${savingsRate}%. ${savingsRate >= 20 ? "Great job! Keep it up 🎉" : "Aim for 20%+ by reviewing subscriptions and dining out habits."}`
    );

    setLoading(false);
  }

  return (
    <div style={{
      background: dark ? "#1f2937" : "#111827",
      borderRadius: 16, padding: 24,
      border: `1px solid ${dark ? "#374151" : "#1f2937"}`,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: 8 }}>
          🤖 AI Financial Advisor
        </h3>
        <button
          onClick={getInsights}
          disabled={loading}
          style={{
            background: "#3b82f6", color: "#fff", border: "none",
            padding: "7px 14px", borderRadius: 8, fontSize: 12,
            fontWeight: 600, cursor: "pointer", opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "Analyzing..." : "Get Insights ✨"}
        </button>
      </div>

      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[80, 90, 70].map((w, i) => (
            <div key={i} style={{
              height: 10, borderRadius: 6, background: "#374151",
              width: `${w}%`, animation: "pulse 1.5s infinite"
            }} />
          ))}
          <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
        </div>
      )}

      {!insight && !loading && (
        <p style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.7 }}>
          Click Get Insights to get AI-powered insights based on your spending patterns.
        </p>
      )}

      {insight && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {insight.split("\n\n").map((line, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <div style={{
                width: 6, height: 6, borderRadius: "50%",
                background: "#3b82f6", flexShrink: 0, marginTop: 6
              }} />
              <p style={{ fontSize: 12, color: "#d1d5db", lineHeight: 1.7, margin: 0 }}>
                {line}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}