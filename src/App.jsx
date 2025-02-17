import React, { useState } from "react";
import GamesList from "./components/GamesList";
import SportSelector from "./components/SportSelector";
import "./App.css";

const App = () => {
    const [selectedSport, setSelectedSport] = useState("");
    const [selectedDate, setSelectedDate] = useState("");

    return (
        <div className="app">
            <header>
                <h1>Slates</h1>
            </header>
            <main>
                <SportSelector onSportChange={setSelectedSport} onDateChange={setSelectedDate} />
                <GamesList sport={selectedSport} date={selectedDate} />
            </main>
        </div>
    );
};

export default App;
