import React, { useState } from "react";
import { DayPicker } from "react-day-picker";
import "./SportSelector.css";
// import "./rdp.css";

const App = () => {
    const [selectedSports, setSelectedSports] = useState([]);
    const [selectedDate, setSelectedDate] = useState("");

    const handleSportChange = (sport) => {
        setSelectedSports(
            (prev) =>
                prev.includes(sport)
                    ? prev.filter((item) => item !== sport) // remove sport if already selected
                    : [...prev, sport] // add sport if not selected
        );
    };

    const handleDateChange = (date) => {
        setSelectedDate(date);
    };

    return (
        <div className="selector">
            <div className="calendar">
                <DayPicker
                    captionLayout="label"
                    dir="ltr"
                    firstWeekContainsDate={0}
                    mode="single"
                    numberOfMonths={1}
                    numerals="latn"
                    timeZone="America/New_York"
                    weekStartsOn={0}
                />
            </div>
            <div className="sports-selector">
                <button
                    className={selectedSports.includes("nba") ? "active" : ""}
                    onClick={() => handleSportChange("nba")}
                >
                    <img src="/i/leaguelogos/nba.png" alt="" />
                    <span>NBA</span>
                </button>
                <button
                    className={selectedSports.includes("ncaambb") ? "active" : ""}
                    onClick={() => handleSportChange("ncaambb")}
                >
                    <img src="/i/leaguelogos/ncaambb.png" alt="" />
                    <span>NCAA Men's Basketball</span>
                </button>
            </div>
            <p>Selected Sport: {selectedSports.join(", ")}</p>
            <p>Selected Date: {selectedDate}</p>
        </div>
    );
};

export default App;
