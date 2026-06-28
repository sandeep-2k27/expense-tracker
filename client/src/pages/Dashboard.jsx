import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import { toast } from "react-toastify";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

import "../styles/dashboard.css";

ChartJS.register(ArcElement, Tooltip, Legend);

function Dashboard() {
  const navigate = useNavigate();
  const name = localStorage.getItem("name");
  const API = import.meta.env.VITE_API_URL;

  // Summary
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
  });

  // PDF Download
  const downloadPDF = () => {
    const doc = new jsPDF();

    const tableData = transactions.map((item, index) => [
      index + 1,
      item.type,
      item.amount,
      item.category,
      item.note || "-",
      new Date(item.date).toLocaleDateString(),
    ]);

    doc.text("Expense Report", 14, 15);

    autoTable(doc, {
      head: [["#", "Type", "Amount", "Category", "Note", "Date"]],
      body: tableData,
      startY: 25,
    });

    doc.save("expense-report.pdf");
  };

  // Transactions
  const [transactions, setTransactions] = useState([]);
  // Calculate income, expense, balance
  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const expense = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const balance = income - expense;

  // Form states
  const [type, setType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [note, setNote] = useState("");

  // Protect route
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  // Fetch summary
  const fetchSummary = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(`${API}/api/transactions/summary`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSummary(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch transactions
  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(`${API}/api/transactions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTransactions(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Initial load
  useEffect(() => {
    fetchSummary();
    fetchTransactions();
  }, []);

  // Add transaction
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!amount || !category) {
      alert("Please fill all required fields");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        `${API}/api/transactions`,
        {
          type,
          amount,
          category,
          note,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("Transaction added!");

      // Clear form
      setAmount("");
      setCategory("");
      setNote("");

      // Reload data
      fetchSummary();
      fetchTransactions();
    } catch (error) {
      console.log(error);
      toast.error("Failed to add transaction");
    }
  };

  // Delete transaction
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this?")) return;

    try {
      const token = localStorage.getItem("token");

      await axios.delete(`${API}/api/transactions/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Transaction deleted!");

      // Refresh data
      fetchSummary();
      fetchTransactions();
    } catch (error) {
      console.log(error);
      toast.error("Delete failed");
    }
  };

  // Prepare chart data
  const expenseData = {};

  transactions.forEach((t) => {
    if (t.type === "expense") {
      expenseData[t.category] = (expenseData[t.category] || 0) + t.amount;
    }
  });

  const chartData = {
    labels: Object.keys(expenseData),
    datasets: [
      {
        data: Object.values(expenseData),
        backgroundColor: [
          "#ef4444",
          "#f97316",
          "#eab308",
          "#22c55e",
          "#3b82f6",
          "#8b5cf6",
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p className="user-email">Welcome, {name} 👋</p>
        </div>

        <button onClick={downloadPDF} className="pdf-btn">
          📄 Download Report
        </button>

        <button className="profile-btn" onClick={() => navigate("/profile")}>
          Profile
        </button>

        <button
          className="logout-btn"
          onClick={() => {
            localStorage.clear();
            navigate("/login");
          }}
        >
          Logout
        </button>
      </div>

      {/* Summary */}
      <div className="summary-grid">
        <div className="summary-card">
          <h3>Income</h3>
          <h2>₹{summary.totalIncome}</h2>
        </div>

        <div className="summary-card">
          <h3>Expense</h3>
          <h2>₹{summary.totalExpense}</h2>
        </div>

        <div className="summary-card">
          <h3>Balance</h3>
          <h2>₹{balance}</h2>
        </div>
      </div>

      {/* Add Transaction Form */}
      <div className="form-card">
        <h2>Add Transaction</h2>

        <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>

          <br />
          <br />

          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <br />
          <br />

          <input
            type="text"
            placeholder="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />

          <br />
          <br />

          <input
            type="text"
            placeholder="Note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          <br />
          <br />

          <button className="add-btn" type="submit">
            Add
          </button>
        </form>
      </div>

      {/* Transaction List */}
      <div className="chart-box">
        <h2>Expense Breakdown</h2>

        {Object.keys(expenseData).length === 0 ? (
          <p>No expense data yet</p>
        ) : (
          <div
            style={{
              width: "300px",
              height: "300px",
              margin: "auto",
            }}
          >
            <Pie data={chartData} options={chartOptions} />
          </div>
        )}
      </div>
      <div className="table-card">
        <h2>Transactions</h2>

        {transactions.length === 0 ? (
          <p>No transactions yet</p>
        ) : (
          <table border="1" cellPadding="8">
            <thead>
              <tr>
                <th>Type</th>
                <th>Amount</th>
                <th>Category</th>
                <th>Note</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {transactions.map((t) => (
                <tr key={t._id}>
                  <td>{t.type}</td>
                  <td>₹{t.amount}</td>
                  <td>{t.category}</td>
                  <td>{t.note}</td>
                  <td>{new Date(t.date).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(t._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Dashboard;