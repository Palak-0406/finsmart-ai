import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Trash2,
} from "lucide-react";
import AIInsights from "./AIInsights";
import SavingsGoals from "./SavingsGoals";
import BudgetPlanner from "./BudgetPlanner";

const COLORS = [
  "#3b82f6",
  "#f43f5e",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#06b6d4",
];
const API = "https://finsmart-ai-production.up.railway.app/api";

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState({
    name: "",
    amount: "",
    category: "Housing",
    type: "expense",
    date: new Date().toISOString().split("T")[0],
  });
  const [showForm, setShowForm] = useState(false);
  const [dark, setDark] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterDate, setFilterDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showTransactions, setShowTransactions] = useState(true);
  const [showBudget, setShowBudget] = useState(true);
  const [showGoals, setShowGoals] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  async function fetchTransactions() {
    try {
      const res = await fetch(`${API}/transactions`);
      const data = await res.json();
      setTransactions(data);
    } catch (e) {
      console.error(e);
    }
  }

  async function addTransaction() {
    if (!form.name || !form.amount) return;
    const payload = {
      name: form.name,
      amount:
        form.type === "expense"
          ? -Math.abs(Number(form.amount))
          : Math.abs(Number(form.amount)),
      category: form.category,
      type: form.type,
      date: form.date,
    };
    await fetch(`${API}/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setForm({
      name: "",
      amount: "",
      category: "Housing",
      type: "expense",
      date: new Date().toISOString().split("T")[0],
    });
    setShowForm(false);
    fetchTransactions();
  }

  async function deleteTransaction(id) {
    await fetch(`${API}/transactions/${id}`, { method: "DELETE" });
    fetchTransactions();
  }

  const totalIncome = transactions
    .filter((t) => Number(t.amount) > 0)
    .reduce((s, t) => s + Number(t.amount), 0);
  const totalExpense = transactions
    .filter((t) => Number(t.amount) < 0)
    .reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
  const balance = totalIncome - totalExpense;

  const fmt = (n) => `₹${Math.abs(n).toLocaleString("en-IN")}`;

  const filteredTransactions = transactions.filter((tx) => {
    const searchLower = search.toLowerCase();
    const txDate = new Date(tx.date);
    const day = txDate.getDate();
    const month = txDate
      .toLocaleString("en-IN", { month: "long" })
      .toLowerCase();
    const shortMonth = txDate
      .toLocaleString("en-IN", { month: "short" })
      .toLowerCase();
    const dateFormats = [
      tx.date,
      `${day} ${month}`,
      `${day} ${shortMonth}`,
      `${month} ${day}`,
      `${shortMonth} ${day}`,
      `${day}-${String(txDate.getMonth() + 1).padStart(2, "0")}`,
      `${day}/${String(txDate.getMonth() + 1).padStart(2, "0")}`,
      month,
      shortMonth,
    ];
    const matchSearch =
      tx.name.toLowerCase().includes(searchLower) ||
      tx.category.toLowerCase().includes(searchLower) ||
      dateFormats.some((f) => f.includes(searchLower));
    const matchCategory =
      filterCategory === "All" || tx.category === filterCategory;
    const matchDate = !filterDate || tx.date === filterDate;
    return matchSearch && matchCategory && matchDate;
  });

  const monthlyTransactions = transactions.filter((tx) => {
    const date = new Date(tx.date);
    return (
      date.getMonth() === selectedMonth && date.getFullYear() === selectedYear
    );
  });

  const monthlyIncome = monthlyTransactions
    .filter((t) => Number(t.amount) > 0)
    .reduce((s, t) => s + Number(t.amount), 0);
  const monthlyExpense = monthlyTransactions
    .filter((t) => Number(t.amount) < 0)
    .reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
  const monthlySavings = monthlyIncome - monthlyExpense;

  const monthlyCategoryData = Object.entries(
    monthlyTransactions
      .filter((t) => Number(t.amount) < 0)
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + Math.abs(Number(t.amount));
        return acc;
      }, {}),
  ).map(([name, value]) => ({ name, value }));

  const t = {
    bg: dark ? "#111827" : "#f3f4f6",
    card: dark ? "#1f2937" : "#fff",
    border: dark ? "#374151" : "#e5e7eb",
    text: dark ? "#f9fafb" : "#111827",
    muted: dark ? "#9ca3af" : "#6b7280",
    subtext: dark ? "#6b7280" : "#9ca3af",
    input: dark ? "#111827" : "#fff",
    inputBorder: dark ? "#374151" : "#e5e7eb",
    hover: dark ? "#374151" : "#f3f4f6",
  };

  const inputStyle = {
    width: "100%",
    padding: "9px 12px",
    borderRadius: 10,
    border: `1px solid ${t.inputBorder}`,
    fontSize: 13,
    outline: "none",
    fontFamily: "inherit",
    color: t.text,
    background: t.input,
  };

  const labelStyle = {
    fontSize: 11,
    color: t.subtext,
    fontWeight: 600,
    letterSpacing: 1,
    textTransform: "uppercase",
    display: "block",
    marginBottom: 6,
  };

  const collapseBtn = (show, setShow) => (
    <button
      onClick={() => setShow(!show)}
      style={{
        background: t.hover,
        border: "none",
        borderRadius: 8,
        padding: "4px 12px",
        fontSize: 12,
        color: t.muted,
        cursor: "pointer",
      }}
    >
      {show ? "▲ Hide" : "▼ Show"}
    </button>
  );

  return (
    <div
      style={{
        fontFamily: "'DM Sans', sans-serif",
        background: t.bg,
        minHeight: "100vh",
        transition: "all 0.3s",
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap'); * { box-sizing: border-box; }`}</style>

      {/* Navbar */}
      <nav
        style={{
          background: t.card,
          borderBottom: `1px solid ${t.border}`,
          padding: "0 40px",
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 100,
          transition: "all 0.3s",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              background: "#3b82f6",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Wallet size={18} color="#fff" />
          </div>
          <span
            style={{
              fontWeight: 700,
              fontSize: 17,
              color: t.text,
              letterSpacing: "-0.3px",
            }}
          >
            FinSmart AI
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => setDark(!dark)}
            style={{
              background: t.hover,
              color: t.text,
              border: `1px solid ${t.border}`,
              padding: "8px 14px",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {dark ? "☀️ Light" : "🌙 Dark"}
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              background: showForm ? t.hover : "#111827",
              color: showForm ? t.text : "#fff",
              border: "none",
              padding: "9px 18px",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {showForm ? "✕ Cancel" : "+ Add Transaction"}
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px" }}>
        {/* Add Transaction Form */}
        {showForm && (
          <div
            style={{
              background: t.card,
              borderRadius: 16,
              padding: "24px 28px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
              marginBottom: 24,
              border: `1px solid ${t.border}`,
            }}
          >
            <h3
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: t.text,
                marginBottom: 20,
              }}
            >
              Add Transaction
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr 1fr",
                gap: 14,
                marginBottom: 16,
              }}
            >
              <div>
                <label style={labelStyle}>Description</label>
                <input
                  type="text"
                  placeholder="Rent, Groceries..."
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Amount</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Category</label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  style={inputStyle}
                >
                  <option>Housing</option>
                  <option>Food</option>
                  <option>Entertainment</option>
                  <option>Utilities</option>
                  <option>Health</option>
                  <option>Shopping</option>
                  <option>Income</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  style={inputStyle}
                />
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
              <button
                onClick={() => setForm({ ...form, type: "expense" })}
                style={{
                  padding: "8px 20px",
                  borderRadius: 10,
                  border: "none",
                  background: form.type === "expense" ? "#f43f5e" : t.hover,
                  color: form.type === "expense" ? "#fff" : t.muted,
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                Expense
              </button>
              <button
                onClick={() => setForm({ ...form, type: "income" })}
                style={{
                  padding: "8px 20px",
                  borderRadius: 10,
                  border: "none",
                  background: form.type === "income" ? "#10b981" : t.hover,
                  color: form.type === "income" ? "#fff" : t.muted,
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                Income
              </button>
            </div>
            <button
              onClick={addTransaction}
              style={{
                background: "#111827",
                color: "#fff",
                border: "none",
                padding: "10px 24px",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              + Add Transaction
            </button>
          </div>
        )}

        {/* Stat Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <StatCard
            icon={<TrendingUp size={20} color="#10b981" />}
            iconBg="#dcfce7"
            label="Total Income"
            value={fmt(totalIncome)}
            dark={dark}
          />
          <StatCard
            icon={<TrendingDown size={20} color="#f43f5e" />}
            iconBg="#ffe4e6"
            label="Total Expenses"
            value={fmt(totalExpense)}
            dark={dark}
          />
          <StatCard
            icon={<Wallet size={20} color="#3b82f6" />}
            iconBg="#dbeafe"
            label="Current Balance"
            value={fmt(balance)}
            dark={dark}
          />
        </div>

        {/* Monthly Summary */}
        <div
          style={{
            background: t.card,
            borderRadius: 16,
            padding: "16px 24px",
            border: `1px solid ${t.border}`,
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            marginBottom: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <h3 style={{ fontSize: 15, fontWeight: 700, color: t.text }}>
              📊 Monthly Summary
            </h3>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              style={{
                padding: "6px 12px",
                borderRadius: 8,
                border: `1px solid ${t.border}`,
                fontSize: 12,
                background: t.input,
                color: t.text,
                outline: "none",
                fontFamily: "inherit",
                cursor: "pointer",
              }}
            >
              <option value={2025}>2025</option>
              <option value={2026}>2026</option>
              <option value={2027}>2027</option>
            </select>
          </div>
          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              marginBottom: 16,
            }}
          >
            {[
              "Jan",
              "Feb",
              "Mar",
              "Apr",
              "May",
              "Jun",
              "Jul",
              "Aug",
              "Sep",
              "Oct",
              "Nov",
              "Dec",
            ].map((m, i) => (
              <button
                key={i}
                onClick={() => setSelectedMonth(i)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 8,
                  border: "none",
                  background: selectedMonth === i ? "#3b82f6" : t.hover,
                  color: selectedMonth === i ? "#fff" : t.muted,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {m}
              </button>
            ))}
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 12,
            }}
          >
            <div
              style={{
                background: dark ? "#111827" : "#f9fafb",
                borderRadius: 12,
                padding: 14,
                border: `1px solid ${t.border}`,
              }}
            >
              <p style={{ fontSize: 11, color: t.subtext, marginBottom: 4 }}>
                INCOME
              </p>
              <p style={{ fontSize: 18, fontWeight: 700, color: "#10b981" }}>
                ₹{monthlyIncome.toLocaleString("en-IN")}
              </p>
            </div>
            <div
              style={{
                background: dark ? "#111827" : "#f9fafb",
                borderRadius: 12,
                padding: 14,
                border: `1px solid ${t.border}`,
              }}
            >
              <p style={{ fontSize: 11, color: t.subtext, marginBottom: 4 }}>
                EXPENSES
              </p>
              <p style={{ fontSize: 18, fontWeight: 700, color: "#f43f5e" }}>
                ₹{monthlyExpense.toLocaleString("en-IN")}
              </p>
            </div>
            <div
              style={{
                background: dark ? "#111827" : "#f9fafb",
                borderRadius: 12,
                padding: 14,
                border: `1px solid ${t.border}`,
              }}
            >
              <p style={{ fontSize: 11, color: t.subtext, marginBottom: 4 }}>
                SAVINGS
              </p>
              <p
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: monthlySavings >= 0 ? "#3b82f6" : "#f43f5e",
                }}
              >
                ₹{monthlySavings.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              background: t.card,
              borderRadius: 16,
              padding: 24,
              border: `1px solid ${t.border}`,
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <h3
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: t.text,
                marginBottom: 16,
              }}
            >
              Income vs Expenses
            </h3>
            {monthlyTransactions.length === 0 ? (
              <div
                style={{
                  height: 200,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: t.subtext,
                  fontSize: 13,
                }}
              >
                No data for this month
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={[
                    {
                      name: "This Month",
                      income: monthlyIncome,
                      expense: monthlyExpense,
                    },
                  ]}
                >
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: t.muted }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: t.muted }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip formatter={(v) => `₹${v.toLocaleString("en-IN")}`} />
                  <Bar dataKey="income" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="expense" fill="#e5e7eb" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div
            style={{
              background: t.card,
              borderRadius: 16,
              padding: 24,
              border: `1px solid ${t.border}`,
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <h3
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: t.text,
                marginBottom: 16,
              }}
            >
              Spending Breakdown
            </h3>
            {monthlyCategoryData.length === 0 ? (
              <div
                style={{
                  height: 200,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: t.subtext,
                  fontSize: 13,
                }}
              >
                No expenses this month
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={monthlyCategoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={85}
                    innerRadius={50}
                  >
                    {monthlyCategoryData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => `₹${v.toLocaleString("en-IN")}`} />
                  <Legend iconType="circle" iconSize={8} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Search & Filter */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 16,
            flexWrap: "wrap",
          }}
        >
          <input
            type="text"
            placeholder="🔍 Search by name, date, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 2,
              padding: "10px 16px",
              borderRadius: 10,
              border: `1px solid ${t.border}`,
              fontSize: 13,
              outline: "none",
              background: t.card,
              color: t.text,
              fontFamily: "inherit",
              minWidth: 200,
            }}
          />
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            style={{
              flex: 1,
              padding: "10px 16px",
              borderRadius: 10,
              border: `1px solid ${t.border}`,
              fontSize: 13,
              outline: "none",
              background: t.card,
              color: t.text,
              fontFamily: "inherit",
              minWidth: 150,
              cursor: "pointer",
            }}
          />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            style={{
              flex: 1,
              padding: "10px 16px",
              borderRadius: 10,
              border: `1px solid ${t.border}`,
              fontSize: 13,
              outline: "none",
              background: t.card,
              color: t.text,
              fontFamily: "inherit",
              cursor: "pointer",
              minWidth: 130,
            }}
          >
            <option>All</option>
            <option>Housing</option>
            <option>Food</option>
            <option>Entertainment</option>
            <option>Utilities</option>
            <option>Health</option>
            <option>Shopping</option>
            <option>Income</option>
            <option>Other</option>
          </select>
          {(search || filterDate || filterCategory !== "All") && (
            <button
              onClick={() => {
                setSearch("");
                setFilterDate("");
                setFilterCategory("All");
              }}
              style={{
                padding: "10px 16px",
                borderRadius: 10,
                border: `1px solid ${t.border}`,
                fontSize: 13,
                background: t.card,
                color: "#f43f5e",
                fontFamily: "inherit",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              ✕ Clear
            </button>
          )}
        </div>

        {/* Recent Transactions */}
        <div
          style={{
            background: t.card,
            borderRadius: 16,
            padding: 24,
            border: `1px solid ${t.border}`,
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            marginBottom: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: showTransactions ? 16 : 0,
            }}
          >
            <h3 style={{ fontSize: 15, fontWeight: 700, color: t.text }}>
              Recent Transactions
            </h3>
            {collapseBtn(showTransactions, setShowTransactions)}
          </div>
          {showTransactions &&
            (filteredTransactions.length === 0 ? (
              <p
                style={{
                  textAlign: "center",
                  color: t.subtext,
                  fontSize: 13,
                  padding: "24px 0",
                }}
              >
                {search || filterDate || filterCategory !== "All"
                  ? "No transactions match your search."
                  : "No transactions yet. Add one above!"}
              </p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {[
                      "Date",
                      "Description",
                      "Category",
                      "Amount",
                      "Action",
                    ].map((h) => (
                      <th
                        key={h}
                        style={{
                          fontSize: 11,
                          color: t.subtext,
                          fontWeight: 600,
                          letterSpacing: 1,
                          textTransform: "uppercase",
                          textAlign: "left",
                          paddingBottom: 10,
                          borderBottom: `1px solid ${t.border}`,
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((tx) => (
                    <tr
                      key={tx.id}
                      style={{ borderBottom: `1px solid ${t.border}` }}
                    >
                      <td
                        style={{
                          padding: "12px 0",
                          fontSize: 13,
                          color: t.muted,
                        }}
                      >
                        {new Date(tx.date).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td
                        style={{
                          padding: "12px 8px",
                          fontSize: 13,
                          color: t.text,
                          fontWeight: 500,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <div
                            style={{
                              width: 26,
                              height: 26,
                              borderRadius: 6,
                              background:
                                Number(tx.amount) > 0 ? "#dcfce7" : "#ffe4e6",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {Number(tx.amount) > 0 ? (
                              <ArrowUpRight size={13} color="#10b981" />
                            ) : (
                              <ArrowDownLeft size={13} color="#f43f5e" />
                            )}
                          </div>
                          {tx.name}
                        </div>
                      </td>
                      <td style={{ padding: "12px 8px" }}>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            padding: "3px 10px",
                            borderRadius: 20,
                            background: dark ? "#374151" : "#f3f4f6",
                            color: t.muted,
                          }}
                        >
                          {tx.category}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "12px 8px",
                          fontSize: 13,
                          fontWeight: 700,
                          color: Number(tx.amount) > 0 ? "#10b981" : "#f43f5e",
                        }}
                      >
                        {Number(tx.amount) > 0 ? "+" : "-"}₹
                        {Math.abs(Number(tx.amount)).toLocaleString("en-IN")}
                      </td>
                      <td style={{ padding: "12px 0" }}>
                        <button
                          onClick={() => deleteTransaction(tx.id)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: t.subtext,
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ))}
        </div>

        {/* Budget Planner */}
        <BudgetPlanner
          transactions={monthlyTransactions}
          dark={dark}
          show={showBudget}
          setShow={setShowBudget}
        />

        {/* Savings Goals */}
        <SavingsGoals dark={dark} show={showGoals} setShow={setShowGoals} />

        {/* AI Insights */}
        <AIInsights transactions={monthlyTransactions} dark={dark} />
      </div>
    </div>
  );
}

function StatCard({ icon, iconBg, label, value, dark }) {
  return (
    <div
      style={{
        background: dark ? "#1f2937" : "#fff",
        borderRadius: 16,
        padding: "20px 24px",
        border: `1px solid ${dark ? "#374151" : "#e5e7eb"}`,
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        display: "flex",
        alignItems: "center",
        gap: 16,
        transition: "all 0.3s",
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <p style={{ fontSize: 12, color: "#9ca3af", marginBottom: 4 }}>
          {label}
        </p>
        <p
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: dark ? "#f9fafb" : "#111827",
          }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
