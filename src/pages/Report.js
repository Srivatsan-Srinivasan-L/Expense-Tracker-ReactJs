import React, { useState, useEffect } from "react";
import { Pie, Bar } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from "chart.js";
import "../styles/Report.css";
import NoTransactions from "../Components/NoTransactions";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";



ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

function Report() {
  const [transactions, setTransactions] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [categoryData, setCategoryData] = useState({});

  useEffect(() => {
    const storedTransactions = JSON.parse(localStorage.getItem("transaction")) || [];
    setTransactions(storedTransactions);
  }, []);

  useEffect(() => {
    const filtered = transactions.filter((tx) => tx.date.startsWith(selectedMonth));
    setFilteredTransactions(filtered);

    let income = 0, expense = 0;
    let categoryBreakdown = {};

    filtered.forEach((tx) => {
      if (tx.type === "Income") {
        income += tx.amount;
      } else {
        expense += tx.amount;
        categoryBreakdown[tx.category] = (categoryBreakdown[tx.category] || 0) + tx.amount;
      }
    });

    setTotalIncome(income);
    setTotalExpense(expense);
    setCategoryData(categoryBreakdown);
  }, [transactions, selectedMonth]);

  const pieChartData = {
    labels: Object.keys(categoryData),
    datasets: [
      {
        data: Object.values(categoryData),
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4CAF50", "#9966FF"],
      },
    ],
  };

  const barChartData = {
    labels: ["Income", "Expense"],
    datasets: [
      {
        label: "Amount",
        data: [totalIncome, totalExpense],
        backgroundColor: ["#36A2EB", "#FF6384"],
      },
    ],
  };

  const chartOptions = {
    scales: {
      y: {
        beginAtZero: true,
        grid: { display: false },
      },
      x: {
        grid: { display: false },
      },
    },
    maintainAspectRatio: false,
  };


  const generatePDF = () => {
    const doc = new jsPDF();
  
    // Centered title with an icon
    doc.setFontSize(18);
    doc.setTextColor(40, 40, 40);
    doc.text(" Monthly Expense Tracker", 105, 20, { align: "center" });
  
    // Sub details
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Month: ${selectedMonth}`, 14, 30);
  
    // Income, Expense, Balance
    doc.setTextColor(0, 128, 0); // Green
    doc.text(`Total Income:  RS. ${totalIncome.toLocaleString()}`, 14, 40);
  
    doc.setTextColor(255, 0, 0); // Red
    doc.text(`Total Expense:  RS. ${totalExpense.toLocaleString()}`, 14, 48);
  
    doc.setTextColor(0, 0, 0); // Default
    doc.text(`Balance:  RS. ${(totalIncome - totalExpense).toLocaleString()}`, 14, 56);
  
    // Format date as DD-MM-YYYY
    const formatDate = (dateStr) => {
      const [year, month, day] = dateStr.split("-");
      return `${day}-${month}-${year}`;
    };
  
    // Get max expense to highlight
    let maxAmt = 0;
    filteredTransactions.forEach(tx => {
      if (tx.type === "Expense" && tx.amount > maxAmt) {
        maxAmt = tx.amount;
      }
    });
  
    // Create table body with formatted rows
    const tableData = filteredTransactions.map((tx, i) => {
      const formattedDate = formatDate(tx.date);
      const isMaxExpense = tx.amount === maxAmt && tx.type === "Expense";
  
      return {
        row: [
          i + 1,
          formattedDate,
          tx.category,
          tx.description || "No Description",
          tx.type,
          ` RS. ${tx.amount.toLocaleString()}`
        ],
        styles: isMaxExpense
          ? { fillColor: [255, 204, 204] } // Light red background
          : {}
      };
    });
  
    // Build autoTable input format
    const rows = tableData.map(item => item.row);
    const rowStyles = tableData.map(item => item.styles);
  
    autoTable(doc, {
      startY: 65,
      head: [["#", "Date", "Category", "Description", "Type", "Amount"]],
      body: rows,
      bodyStyles: {
        textColor: 30,
      },
      didParseCell: function (data) {
        const idx = data.row.index;
        if (rowStyles[idx]?.fillColor) {
          data.cell.styles.fillColor = rowStyles[idx].fillColor;
        }
      },
    });
  
    doc.save(`Expense_Report_${selectedMonth}.pdf`);
  };

  return (
    <div className="reports-container">
      <h2>Expense Reports</h2>
      <div className="date-filter">
        <label>Select Month:</label>
        <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} />
        <button className="download-btn" onClick={generatePDF}>
  Download PDF Report
</button>

      </div>

      <div className="summary-cards">
        <div className="income-card">
          <p>Total Income</p>
          <h3 className="income">₹{totalIncome.toLocaleString()}</h3>
        </div>
        <div className="expense-card">
          <p>Total Expense</p>
          <h3 className="expense">₹{totalExpense.toLocaleString()}</h3>
        </div>
      </div>

      <div className="charts-container">
        {/* Category-wise Expense Pie Chart */}
        <div className="chart-item pie-chart">
          <h3>Category-wise Expense Breakdown</h3>
          {Object.keys(categoryData).length === 0 ? (
            <NoTransactions />
          ) : (
            <Pie data={pieChartData} />
          )}
        </div>

        {/* Income vs Expense Bar Chart */}
        <div className="chart-item bar-chart">
          <h3>Income vs Expense</h3>
          {totalIncome === 0 && totalExpense === 0 ? (
            <NoTransactions />
          ) : (
            <div className="chart-wrapper">
              <Bar data={barChartData} options={chartOptions} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Report;