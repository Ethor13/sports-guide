import React, { useState, useCallback, useRef, useEffect } from "react";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import { MdKeyboardArrowDown } from "react-icons/md";
import "./SportSelector.css";

const addDays = (date, days) => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + days);
    return newDate;
};

const getDateString = (date) => {
    return date.toLocaleDateString("en-CA").slice(0, 10);
};

const App = ({ props }) => {
    const { selectedSports, setSelectedSports, selectedDate, setSelectedDate, sortBy, setSortBy } = props;
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const today = getDateString(new Date());

    const sortOptions = [
        { value: 'time', label: 'Time' },
        { value: 'score', label: 'Slate Score' }
    ];

    const [displayedDates, setDisplayedDates] = useState([
        addDays(selectedDate, -2),
        addDays(selectedDate, -1),
        selectedDate,
        addDays(selectedDate, 1),
        addDays(selectedDate, 2),
    ]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSportChange = useCallback(
        (sport) => {
            setSelectedSports(
                (prev) =>
                    prev.includes(sport)
                        ? prev.filter((item) => item !== sport) // remove sport if already selected
                        : [...prev, sport] // add sport if not selected
            );
        },
        [setSelectedSports]
    );

    const handleDateChange = useCallback(
        (date) => {
            if (getDateString(date) < today) return;
            if (getDateString(date) === getDateString(selectedDate)) return;
            setSelectedDate(date);
            // change display dates so date is in the middle
            setDisplayedDates([
                addDays(date, -2),
                addDays(date, -1),
                date,
                addDays(date, 1),
                addDays(date, 2),
            ]);
        },
        [setSelectedDate, today, selectedDate]
    );

    const shiftDaysLeft = useCallback(() => {
        setDisplayedDates((prevDates) => {
            if (getDateString(prevDates[2]) !== today) {
                const newDates = prevDates.map((date) => addDays(date, -1));
                setSelectedDate(newDates[2]);
                return newDates;
            }
            return prevDates;
        });
    }, [setDisplayedDates, today, getDateString, setSelectedDate]);

    const shiftDaysRight = useCallback(() => {
        setDisplayedDates((prevDates) => {
            const newDates = prevDates.map((date) => addDays(date, 1));
            setSelectedDate(newDates[2]);
            return newDates;
        });
    }, [setDisplayedDates, setSelectedDate]);

    return (
        <div className="selector">
            <div className="calendar">
                <div className="week-navigation">
                    <ChevronButton
                        onClick={shiftDaysLeft}
                        direction="left"
                        blocked={getDateString(displayedDates[2]) == today}
                    />
                    {displayedDates.map((date, index) => (
                        <button
                            key={index}
                            className={`date-option date${index} ${
                                getDateString(date) === getDateString(new Date(selectedDate))
                                    ? "active"
                                    : ""
                            } ${getDateString(date) === today ? "today" : ""} ${
                                getDateString(date) < today ? "blocked" : ""
                            }`}
                            onClick={() => handleDateChange(date)}
                        >
                            <div className="day-abbreviation">
                                {new Date(date).toLocaleDateString("en-US", { weekday: "short" })}
                            </div>
                            <div className="date-abbreviation">
                                {new Date(date).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                })}
                            </div>
                        </button>
                    ))}
                    <ChevronButton onClick={shiftDaysRight} direction="right" />
                </div>
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
            <div className="sort-selector">
                <p>Sorted by:&nbsp;</p>
                <div className="custom-dropdown" ref={dropdownRef}>
                    <button 
                        className="dropdown-toggle"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                        {sortOptions.find(option => option.value === sortBy).label}
                        <MdKeyboardArrowDown className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`} size={16}/>
                    </button>
                    {isDropdownOpen && (
                        <ul className="dropdown-menu">
                            {sortOptions.map((option) => (
                                <li
                                    key={option.value}
                                    onClick={() => {
                                        setSortBy(option.value);
                                        setIsDropdownOpen(false);
                                    }}
                                >
                                    {option.label}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

const ChevronButton = ({ onClick, direction, blocked }) => (
    <button className={`chevron ${direction} ${blocked ? "blocked" : ""}`} onClick={onClick}>
        {direction === "left" ? <MdChevronLeft size={24} /> : <MdChevronRight size={24} />}
    </button>
);

export default App;
