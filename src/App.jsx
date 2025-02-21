import React, { useState } from "react";
import GamesList from "./components/GamesList";
import SportSelector from "./components/SportSelector";
import "./App.css";

const App = () => {
    const [selectedSports, setSelectedSports] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [sortBy, setSortBy] = useState("time");

    const props = {
        selectedSports,
        setSelectedSports,
        selectedDate,
        setSelectedDate,
        sortBy,
        setSortBy,
    };

    return (
        <div className="app">
            <header>
                <h1>Slates</h1>
            </header>
            <main>
                <SportSelector props={props} />
                <GamesList sports={selectedSports} date={selectedDate} sortBy={sortBy} />
            </main>
        </div>
    );
};

export default App;
