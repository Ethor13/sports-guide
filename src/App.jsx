import React from "react";
import GamesList from "./components/GamesList";
import "./App.css";

const App = () => (
    <div className="app">
        <header>
            <h1>Slates</h1>
        </header>
        <main>
            <GamesList />
        </main>
    </div>
);

export default App;
