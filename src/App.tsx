import { useState, useEffect } from "react";
import { Counter } from "./Counter";
import "./index.css";

interface CounterData {
  id: string;
  label: string;
  value: number;
  initialValue: number;
  maxValue?: number;
}

export function App() {
  const [counters, setCounters] = useState<CounterData[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newMaxValue, setNewMaxValue] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("game-counters");
    if (saved) {
      try {
        setCounters(JSON.parse(saved));
      } catch (error) {
        console.error("Failed to load counters from localStorage:", error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("game-counters", JSON.stringify(counters));
  }, [counters]);

  const addCounter = () => {
    if (newLabel.trim()) {
      const newCounter: CounterData = {
        id: Date.now().toString(),
        label: newLabel.trim(),
        value: 0,
        initialValue: 0,
        maxValue: newMaxValue ? parseInt(newMaxValue) : undefined,
      };
      setCounters([...counters, newCounter]);
      setNewLabel("");
      setNewMaxValue("");
      setShowAddForm(false);
    }
  };

  const removeCounter = (id: string) => {
    setCounters(counters.filter((counter) => counter.id !== id));
  };

  const updateCounter = (id: string, value: number) => {
    setCounters(
      counters.map((counter) =>
        counter.id === id ? { ...counter, value } : counter
      )
    );
  };

  const resetAllCounters = () => {
    setCounters(
      counters.map((counter) => ({
        ...counter,
        value: counter.initialValue,
      }))
    );
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Game Counters</h1>
        <div className="header-buttons">
          <button
            type="button"
            className="add-counter-button"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            + Add Counter
          </button>
          {counters.length > 0 && (
            <button
              type="button"
              className="reset-all-button"
              onClick={resetAllCounters}
            >
              Reset All
            </button>
          )}
        </div>
      </header>

      {showAddForm && (
        <div className="add-counter-form">
          <input
            type="text"
            placeholder="Counter name (e.g., Health, Mana)"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            className="counter-name-input"
          />
          <input
            type="number"
            placeholder="Max value (optional)"
            value={newMaxValue}
            onChange={(e) => setNewMaxValue(e.target.value)}
            className="counter-max-input"
            min="1"
          />
          <div className="form-buttons">
            <button
              type="button"
              onClick={addCounter}
              className="confirm-button"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="cancel-button"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {counters.length === 0 && !showAddForm && (
        <div className="empty-state">
          <p>No counters yet!</p>
          <p>Tap "Add Counter" to create your first counter.</p>
        </div>
      )}

      <div className="counters-grid">
        {counters.map((counter) => (
          <Counter
            key={counter.id}
            id={counter.id}
            label={counter.label}
            initialValue={counter.initialValue}
            maxValue={counter.maxValue}
            onRemove={removeCounter}
            onUpdate={updateCounter}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
