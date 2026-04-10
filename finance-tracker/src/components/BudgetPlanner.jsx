import { useState, useEffect } from "react";
import { Trash2, Plus, PieChart } from "lucide-react";

const API = "https://finsmart-ai-production.up.railway.app/api";

export default function BudgetPlanner({ transactions, dark, show, setShow }) {
  const [budgets, setBudgets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ category: "Food", budget_amount: "" });

  const t = {
    card: dark ? "#1f2937" : "#fff",
    border: dark ? "#374151" : "#e5e7eb",
    text: dark ? "#f9fafb" : "#111827",
    muted: dark ? "#9ca3af" : "#6b7280",
    subtext: dark ? "#6b7280" : "#9ca3af",
    input: dark ? "#111827" : "#fff",
    hover: dark ? "#374151" : "#f3f4f6",
  };

  const inputStyle = {
    width: "100%", padding: "9px 12px", borderRadius: 10,
    border: `1px solid ${t.border}`, fontSize: 13, outline: "none",
    fontFamily: "inherit", color: t.text, background: t.input,
  };

  const labelStyle = {
    fontSize: 11, color: t.subtext, fontWeight: 600,
    letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 6
  };

  useEffect(() => { fetchBudgets(); }, []);

  async function fetchBudgets() {
    try {
      const res = await fetch(`${API}/budgets`);
      const data = await res.json();
      setBudgets(data);
    } catch (e) { console.error(e); }
  }

  async function addBudget() {
    if (!form.category || !form.budget_amount) return;
    await fetch(`${API}/budgets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ category: "Food", budget_amount: "" });
    setShowForm(false);
    fetchBudgets();
  }

  async function deleteBudget(id) {
    await fetch(`${API}/budgets/${id}`, { method: "DELETE" });
    fetchBudgets();
  }

  function spentInCategory(category) {
    return transactions
      .filter(t => t.category === category && Number(t.amount) < 0)
      .reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
  }

  return (
    <div style={{ background: t.card, borderRadius: 16, padding: 24, border: `1px solid ${t.border}`, boxShadow: "0 1px 3px rgba(0,0,0,0.05)", marginBottom: 16 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: show ? 20 : 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <PieChart size={18} color="#f59e0b" />
          </div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: t.text }}>Budget Planner</h3>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {show && (
            <button
              onClick={() => setShowForm(!showForm)}
              style={{ background: showForm ? t.hover : "#111827", color: showForm ? t.text : "#fff", border: "none", padding: "7px 14px", borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}
            >
              {showForm ? "✕ Cancel" : <><Plus size={13} /> Set Budget</>}
            </button>
          )}
          <button
            onClick={() => setShow(!show)}
            style={{ background: t.hover, border: "none", borderRadius: 8, padding: "4px 12px", fontSize: 12, color: t.muted, cursor: "pointer" }}
          >
            {show ? "▲ Hide" : "▼ Show"}
          </button>
        </div>
      </div>

      {show && (
        <>
          {/* Add Budget Form */}
          {showForm && (
            <div style={{ background: dark ? "#111827" : "#f9fafb", borderRadius: 12, padding: 16, marginBottom: 20, border: `1px solid ${t.border}` }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={labelStyle}>Category</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={inputStyle}>
                    <option>Food</option>
                    <option>Housing</option>
                    <option>Entertainment</option>
                    <option>Utilities</option>
                    <option>Health</option>
                    <option>Shopping</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Monthly Limit (₹)</label>
                  <input type="number" placeholder="e.g. 5000" value={form.budget_amount} onChange={e => setForm({ ...form, budget_amount: e.target.value })} style={inputStyle} />
                </div>
              </div>
              <button onClick={addBudget} style={{ background: "#111827", color: "#fff", border: "none", padding: "9px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                + Set Budget
              </button>
            </div>
          )}

          {/* Budget List */}
          {budgets.length === 0 ? (
            <p style={{ textAlign: "center", color: t.subtext, fontSize: 13, padding: "24px 0" }}>
              No budgets set yet. Add one to start tracking! 🎯
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {budgets.map(budget => {
                const spent = spentInCategory(budget.category);
                const limit = Number(budget.budget_amount);
                const progress = Math.min(Math.round((spent / limit) * 100), 100);
                const remaining = limit - spent;
                const isOver = spent > limit;
                const isClose = progress >= 80 && !isOver;
                const progressColor = isOver ? "#f43f5e" : isClose ? "#f59e0b" : "#10b981";

                return (
                  <div key={budget.id} style={{ background: dark ? "#111827" : "#f9fafb", borderRadius: 12, padding: 16, border: `1px solid ${isOver ? "#f43f5e" : isClose ? "#f59e0b" : t.border}` }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: t.text }}>{budget.category}</p>
                        {isOver && <span style={{ fontSize: 10, background: "#ffe4e6", color: "#f43f5e", padding: "2px 8px", borderRadius: 20, fontWeight: 600 }}>Over Budget!</span>}
                        {isClose && <span style={{ fontSize: 10, background: "#fef3c7", color: "#f59e0b", padding: "2px 8px", borderRadius: 20, fontWeight: 600 }}>Almost There!</span>}
                        {!isOver && !isClose && <span style={{ fontSize: 10, background: "#dcfce7", color: "#10b981", padding: "2px 8px", borderRadius: 20, fontWeight: 600 }}>On Track</span>}
                      </div>
                      <button onClick={() => deleteBudget(budget.id)} style={{ background: "none", border: "none", cursor: "pointer", color: t.subtext }}>
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div style={{ marginBottom: 8 }}>
                      <div style={{ height: 8, background: dark ? "#374151" : "#e5e7eb", borderRadius: 10, overflow: "hidden" }}>
                        <div style={{ height: "100%", borderRadius: 10, width: `${progress}%`, background: progressColor, transition: "width 1s ease" }} />
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 12, color: t.muted }}>
                        Spent: <b style={{ color: progressColor }}>₹{spent.toLocaleString("en-IN")}</b>
                      </span>
                      <span style={{ fontSize: 12, color: t.muted }}>
                        {isOver
                          ? <b style={{ color: "#f43f5e" }}>₹{Math.abs(remaining).toLocaleString("en-IN")} over limit!</b>
                          : <>Remaining: <b style={{ color: "#10b981" }}>₹{remaining.toLocaleString("en-IN")}</b></>
                        }
                      </span>
                      <span style={{ fontSize: 12, color: t.muted }}>Limit: ₹{limit.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}