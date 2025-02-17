import React, { useState } from "react";
import { DayPicker } from "react-day-picker";
import "./SportSelector.css";
import "./rdp.css";

const App = ({ props }) => {
    const { selectedSports, setSelectedSports, selectedDate, setSelectedDate, onSelect } = props;

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
        <div className="sidebar">
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
                    selected={selectedDate}
                    onSelect={setSelectedDate}
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
        </div>
    );
};

export default App;
