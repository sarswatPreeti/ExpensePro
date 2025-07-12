import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const Charts = () => {
  const data = {
    labels: ["Food", "Transport", "Bills", "Entertainment"],
    datasets: [
      {
        label: "Expenses",
        data: [300, 150, 100, 50],
        backgroundColor: ["#f87171", "#60a5fa", "#34d399", "#fbbf24"],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-xl font-semibold mb-4">Expense Distribution</h2>
      <Pie data={data} />
    </div>
  );
};

export default Charts;
