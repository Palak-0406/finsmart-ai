import { useState, useEffect } from "react";
import { Trash2, Plus, Target } from "lucide-react";

const API = "http://localhost:5000/api";

export default function SavingsGoals({ dark, show, setShow }) {
  const [goals, setGoals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", target_amount: "", current_amount: "", deadline: "" });

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

  useEffect(() => { fetchGoals(); }, []);

  async function fetchGoals() {
    try {
      const res = await fetch(`${API}/goals`);
      const data = await res.json();
      setGoals(data);
    } catch (e) { console.error(e); }
  }

  async function addGoal() {
    if (!form.name || !form.target_amount) return;
    await fetch(`${API}/goals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ name: "", target_amount: "", current_amount: "", deadline: "" });
    setShowForm(false);
    fetchGoals();
  }

  async function deleteGoal(id) {
    await fetch(`${API}/goals/${id}`, { method: "DELETE" });
    fetchGoals();
  }

  async function updateAmount(id, newAmount) {
    await fetch(`${API}/goals/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ current_amount: newAmount }),
    });
    fetchGoals();
  }

  function monthsLeft(deadline) {
    if (!deadline) return null;
    const now = new Date();
    const end = new Date(deadline);
    const months = (end.getFullYear() - now.getFullYear()) * 12 + (end.getMonth() - now.getMonth());
    return months > 0 ? months : 0;
  }

  function monthlyNeeded(goal) {
    const months = monthsLeft(goal.deadline);
    if (!months) return null;
    const remaining = Number(goal.target_amount) - Number(goal.current_amount);
    if (remaining <= 0) return 0;
    return Math.ceil(remaining / months);
  }

  return (
    <div style={{ background: t.card, borderRadius: 16, padding: 24, border: `1px solid ${t.border}`, boxShadow: "0 1px 3px rgba(0,0,0,0.05)", marginBottom: 16 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: show ? 20 : 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Target size={18} color="#3b82f6" />
          </div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: t.text }}>Savings Goals</h3>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {show && (
            <button
              onClick={() => setShowForm(!showForm)}
              style={{ background: showForm ? t.hover : "#111827", color: showForm ? t.text : "#fff", border: "none", padding: "7px 14px", borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}
            >
              {showForm ? "✕ Cancel" : <><Plus size={13} /> Add Goal</>}
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
          {/* Add Goal Form */}
          {showForm && (
            <div style={{ background: dark ? "#111827" : "#f9fafb", borderRadius: 12, padding: 16, marginBottom: 20, border: `1px solid ${t.border}` }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={labelStyle}>Goal Name</label>
                  <input type="text" placeholder="e.g. New Laptop" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Target (₹)</label>
                  <input type="number" placeholder="50000" value={form.target_amount} onChange={e => setForm({ ...form, target_amount: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Saved So Far (₹)</label>
                  <input type="number" placeholder="0" value={form.current_amount} onChange={e => setForm({ ...form, current_amount: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Deadline</label>
                  <input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} style={inputStyle} />
                </div>
              </div>
              <button onClick={addGoal} style={{ background: "#111827", color: "#fff", border: "none", padding: "9px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                + Add Goal
              </button>
            </div>
          )}

          {/* Goals List */}
          {goals.length === 0 ? (
            <p style={{ textAlign: "center", color: t.subtext, fontSize: 13, padding: "24px 0" }}>
              No goals yet. Add one to start tracking! 🎯
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {goals.map(goal => {
                const progress = Math.min(Math.round((Number(goal.current_amount) / Number(goal.target_amount)) * 100), 100);
                const months = monthsLeft(goal.deadline);
                const needed = monthlyNeeded(goal);
                const isComplete = progress >= 100;
                const progressColor = isComplete ? "#10b981" : progress >= 60 ? "#3b82f6" : progress >= 30 ? "#f59e0b" : "#f43f5e";

                return (
                  <div key={goal.id} style={{ background: dark ? "#111827" : "#f9fafb", borderRadius: 12, padding: 16, border: `1px solid ${t.border}` }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 700, color: t.text, marginBottom: 2 }}>{goal.name}</p>
                        <p style={{ fontSize: 11, color: t.subtext }}>
                          {goal.deadline ? `Deadline: ${goal.deadline}` : "No deadline set"}
                          {months !== null && months > 0 && ` · ${months} months left`}
                          {months === 0 && " · Deadline reached!"}
                        </p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {isComplete && <span style={{ fontSize: 11, background: "#dcfce7", color: "#10b981", padding: "3px 10px", borderRadius: 20, fontWeight: 600 }}>✓ Completed!</span>}
                        <button onClick={() => deleteGoal(goal.id)} style={{ background: "none", border: "none", cursor: "pointer", color: t.subtext }}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    <div style={{ marginBottom: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 12, color: t.muted }}>₹{Number(goal.current_amount).toLocaleString("en-IN")} saved</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: progressColor }}>{progress}%</span>
                      </div>
                      <div style={{ height: 8, background: dark ? "#374151" : "#e5e7eb", borderRadius: 10, overflow: "hidden" }}>
                        <div style={{ height: "100%", borderRadius: 10, width: `${progress}%`, background: progressColor, transition: "width 1s ease" }} />
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                        <span style={{ fontSize: 11, color: t.subtext }}>
                          {needed !== null && needed > 0 && `Save ₹${needed.toLocaleString("en-IN")}/month to reach goal`}
                          {needed === 0 && "🎉 Goal reached!"}
                        </span>
                        <span style={{ fontSize: 11, color: t.subtext }}>Target: ₹{Number(goal.target_amount).toLocaleString("en-IN")}</span>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <input
                        type="number"
                        placeholder="Update saved amount (₹)"
                        style={{ ...inputStyle, flex: 1, padding: "7px 12px" }}
                        onKeyDown={e => {
                          if (e.key === "Enter" && e.target.value) {
                            updateAmount(goal.id, e.target.value);
                            e.target.value = "";
                          }
                        }}
                      />
                      <span style={{ fontSize: 11, color: t.subtext }}>Press Enter to update</span>
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