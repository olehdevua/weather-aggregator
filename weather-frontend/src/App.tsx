import React from "react";
import "./App.css";
import WeatherChart from "./components/WeatherChart";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <WeatherChart />
      </header>
    </div>
  );
}

export default App;
