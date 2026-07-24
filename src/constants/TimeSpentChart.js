import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { formatDate, HHMMSSToMinutes } from "../helpers/function_helper";

const DayWiseTimeChart = () => {
  const stored =
    JSON.parse(localStorage.getItem("dailySiteTime")) || {};

  // Get last 7 days
  const days = Object.keys(stored)
    .sort()
    .slice(-7);

  const chartData = days.map(date => ({
    date: formatDate(date),
    minutes: HHMMSSToMinutes(stored[date])
  }));

  const totalMinutes = chartData.reduce(
    (sum, item) => sum + item.minutes,
    0
  );

  const averageMinutes =
    chartData.length > 0
      ? (totalMinutes / chartData.length).toFixed(1)
      : 0;

  return (
    <div style={{ width: "100%", height: 350 }}>
      <h3>Daily Time Spent</h3>
      <p>
        <b>Average per day:</b> {averageMinutes} minutes
      </p>

      <ResponsiveContainer>
        <BarChart data={chartData}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="minutes" fill="#22c55e" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DayWiseTimeChart;