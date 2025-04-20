import { Link } from "react-router-dom";
import React,{useEffect,useState} from "react";
import TransactionCards from "../Components/TransactionCards";
import "../styles/Dashboard.css";
import RecentTransaction from "../Components/RecentTransaction";
import {Bar} from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";

import NoTransactions from "../Components/NoTransactions";


ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
)




function Dashboard()
{
    const [transaction,setTransaction] = useState([]);
    const [totalIncome,setTotalIncome]= useState(0);
    const [totalExpense,setTotalExpense]=useState(0);
    const [balance,setBalance]=useState(0);
    const [categoryData,setCategoryData] = useState({});
    const [maxExpense,setMaxExpense]=useState(0);
    const categories = [
        "Salary",
        "Groceries",
        "Dining",
        "Transport",
        "Entertainment",
        "Others",
    ];

    useEffect(()=>{
        const existingTransactions = JSON.parse(localStorage.getItem("transaction")) || [];
        setTransaction(existingTransactions);
        let income=0;
        let expense=0;
        let categoryBreakDown = {};
        let highestExpense=0;
        categories.forEach(cat=>categoryBreakDown[cat]=0)
        existingTransactions.forEach(tx =>{
           if(tx.type==="Income"){
            income+=tx.amount;
           }else {
            expense+=tx.amount;
            categoryBreakDown[tx.category] = (categoryBreakDown[tx.category]||0)+tx.amount;
            if(categoryBreakDown[tx.category]>highestExpense)
             {
                highestExpense = categoryBreakDown[tx.category];
             }
           }
        });
        setTotalExpense(expense);
        setTotalIncome(income);
        setBalance(income - expense);
        setCategoryData(categoryBreakDown);
        setMaxExpense(highestExpense);
    },[]);

    const chartData = {
        labels: categories, // fixed spelling
        datasets: [         // fixed from dataset to datasets
          {
            label: "Expenses per Category",
            data: categories.map((cat) => categoryData[cat] || 0),
            backgroundColor: [
              "#FF6384",
              "#36A2EB",
              "#FFCE56",
              "#4CAF50",
              "#9966FF",
              "#FFA07A",
            ],
          },
        ],
      };
      
    const chartOptions = {
        scales:{
            y:{
                beginAtZero:true,
                suggestedMax:maxExpense > 0 ? maxExpense * 1.2 :10,
                grid:{
                    display:false, // Hide horizontal grid lines
                }, 
            },
            x:{
                grid:{
                    display:false,  // Hide vertical grid lines
                },
            },
        },
        maintainAspectRatio:false,
    };
    return(
        <div className="dashboard">
            <div className="dashboard-inner">
        <h2>Dashboard Page</h2>
        <Link to={'/add-transaction'}>
         <button className="add-transaction">
     + Add Transaction
        </button>
        </Link>

        </div>
        
      
        <TransactionCards balance={balance} income={totalIncome} expense={totalExpense}/>
        
        <div className="transactions-chart-row">
        <div className="transactions half-width">
          <h3>Recent Transactions</h3>
          {transaction.length===0?<NoTransactions/>:<RecentTransaction transactions={transaction} />}
          
        </div>
        <div className="expense-chart half-width">
          <h3>Expense by Category</h3>
          {chartData.datasets[0].data.every((value) => value === 0) ? (
            <NoTransactions />):
          <div className="chart-container">
            <Bar data={chartData} options={chartOptions}/>
          </div>}
        </div>
      </div>
    </div>


                


    
    )
}
export default Dashboard;