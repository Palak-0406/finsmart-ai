const express = require("express");
const cors = require("cors");
require("dotenv").config();
const pool = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

// GET all transactions (with optional date filter)
app.get("/api/transactions", async (req, res) => {
  try {
    const { date } = req.query;
    let result;
    if (date) {
      result = await pool.query(
        "SELECT * FROM transactions WHERE date = $1 ORDER BY created_at DESC",
        [date]
      );
    } else {
      result = await pool.query(
        "SELECT * FROM transactions ORDER BY created_at DESC"
      );
    }
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST add transaction
app.post("/api/transactions", async (req, res) => {
  try {
    const { name, amount, category, type, date } = req.body;
    const result = await pool.query(
      "INSERT INTO transactions (name, amount, category, type, date) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, amount, category, type, date]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE transaction
app.delete("/api/transactions/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM transactions WHERE id = $1", [req.params.id]);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

const PORT = process.env.PORT || 5000;

// GET all goals
app.get("/api/goals", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM goals ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST add goal
app.post("/api/goals", async (req, res) => {
  try {
    const { name, target_amount, current_amount, deadline } = req.body;
    const result = await pool.query(
      "INSERT INTO goals (name, target_amount, current_amount, deadline) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, target_amount, current_amount || 0, deadline]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// PATCH update goal amount
app.patch("/api/goals/:id", async (req, res) => {
  try {
    const { current_amount } = req.body;
    const result = await pool.query(
      "UPDATE goals SET current_amount = $1 WHERE id = $2 RETURNING *",
      [current_amount, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE goal
app.delete("/api/goals/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM goals WHERE id = $1", [req.params.id]);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET all budgets
app.get("/api/budgets", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM budgets ORDER BY category ASC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST add budget
app.post("/api/budgets", async (req, res) => {
  try {
    const { category, budget_amount } = req.body;
    const result = await pool.query(
      "INSERT INTO budgets (category, budget_amount) VALUES ($1, $2) ON CONFLICT (category) DO UPDATE SET budget_amount = $2 RETURNING *",
      [category, budget_amount]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE budget
app.delete("/api/budgets/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM budgets WHERE id = $1", [req.params.id]);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));