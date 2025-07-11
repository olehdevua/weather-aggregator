import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  TimeScale,
  ChartData,
  ChartOptions,
} from "chart.js";
import { CandlestickController, CandlestickElement } from "chartjs-chart-financial";
import { Chart } from "react-chartjs-2";
import "chartjs-adapter-luxon";

interface WeatherInfo {
  _id: string;
  minTemperature: number;
  maxTemperature: number;
  openTemperature: number;
  closeTemperature: number;
}

interface ApiResponse {
  content: WeatherInfo[];
}

// Describes the data format required by the 'chartjs-chart-financial' plugin
interface CandlestickDataPoint {
  x: number;
  o: number;
  h: number;
  l: number;
  c: number;
}

ChartJS.register(
  CategoryScale,
  LinearScale,
  Tooltip,
  TimeScale,
  Legend,
  CandlestickController,
  CandlestickElement,
);

const WeatherChart: React.FC = () => {
  const [city, setCity] = useState<string>("NewYork");
  const [startDate, setStartDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [chartData, setChartData] = useState<
    ChartData<"candlestick", CandlestickDataPoint[]>
  >({ datasets: [] });
  const [error, setError] = useState<string>("");

  const chartRef = useRef<ChartJS<"candlestick", CandlestickDataPoint[]> | null>(null);

  useEffect(() => {
    fetchData();
  }, [city, startDate]);

  const fetchData = async () => {
    if (!city || !startDate) return;
    setError("");

    try {
      const response = await axios.get<ApiResponse>("http://localhost:3001/weather", {
        params: { city, startDate: new Date(startDate).toISOString() },
      });

      if (response.data && response.data.content.length > 0) {
        const formattedData: CandlestickDataPoint[] = response.data.content.map(
          (item) => ({
            x: new Date(item._id).getTime(),
            o: item.openTemperature,
            h: item.maxTemperature,
            l: item.minTemperature,
            c: item.closeTemperature,
          }),
        );

        setChartData({ datasets: [{ label: `${city} Weather`, data: formattedData }] });
      } else {
        setError(`No data found for ${city} on ${startDate}.`);
        setChartData({ datasets: [] });
      }
    } catch (err) {
      console.error("Error fetching weather data:", err);
      setError("Failed to fetch weather data. Please ensure the backend is running.");
      setChartData({ datasets: [] });
    }
  };

  const chartOptions: ChartOptions<"candlestick"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" as const },
      title: { display: true, text: "Weather Candlestick Chart" },
    },

    scales: {
      x: {
        type: "time",
        // adapters: { date: { zone: "utc" } },
        time: {
          unit: "hour",
          tooltipFormat: "MMM dd, yyyy HH:mm",
          displayFormats: { hour: "HH:mm" },
        },
        title: { display: true, text: "Date" },
      },
      y: { title: { display: true, text: "Temperature (°C)" }, min: -20, max: 45 },
    },
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCity(e.target.value);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value);
  };

  return (
    <div className="bg-gray-900 min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-5xl mx-auto bg-gray-800 text-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-cyan-400">
          Weather Candlestick Chart 📈
        </h2>

        {/* Input Controls */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-6">
          <div className="w-full sm:w-auto">
            <label
              htmlFor="city"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              City
            </label>
            <input
              type="text"
              id="city"
              value={city}
              onChange={handleCityChange}
              className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5"
              placeholder="e.g., London"
            />
          </div>
          <div className="w-full sm:w-auto">
            <label
              htmlFor="startDate"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={handleDateChange}
              className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5"
            />
          </div>
        </div>

        <div className="relative h-[40rem] p-4 bg-gray-900 rounded-lg">
          {error ? (
            <div className="flex items-center justify-center h-full text-red-400">
              <p>{error}</p>
            </div>
          ) : chartData.datasets.length > 0 && chartData.datasets[0].data.length > 0 ? (
            <Chart
              ref={chartRef}
              type="candlestick"
              data={chartData}
              options={chartOptions}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <p>Loading chart data...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeatherChart;
