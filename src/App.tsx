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
  const [newDefaultValue, setNewDefaultValue] = useState("0");
  const [isLoading, setIsLoading] = useState(true);

  const isValidCounterData = (data: any): data is CounterData => {
    return (
      data &&
      typeof data.id === "string" &&
      typeof data.label === "string" &&
      typeof data.value === "number" &&
      typeof data.initialValue === "number" &&
      (data.maxValue === undefined || typeof data.maxValue === "number")
    );
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem("game-counters");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const validCounters = parsed.filter(isValidCounterData);
          if (validCounters.length > 0) {
            setCounters(validCounters);
          }
          if (validCounters.length !== parsed.length) {
            console.warn(
              `Filtered out ${parsed.length - validCounters.length} invalid counter(s) from saved data`
            );
          }
        }
      }
    } catch (error) {
      console.error("Failed to load counters from localStorage:", error);
      localStorage.removeItem("game-counters");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("game-counters", JSON.stringify(counters));
    } catch (error) {
      console.error("Failed to save counters to localStorage:", error);
      if (error instanceof DOMException && error.name === "QuotaExceededError") {
        alert("Storage quota exceeded. Please remove some counters to continue saving data.");
      }
    }
  }, [counters]);

  const addCounter = () => {
    if (newLabel.trim()) {
      const maxVal = newMaxValue ? parseInt(newMaxValue) : undefined;
      const defaultVal = parseInt(newDefaultValue) || 0;
      
      const newCounter: CounterData = {
        id: Date.now().toString(),
        label: newLabel.trim(),
        value: defaultVal,
        initialValue: defaultVal,
        maxValue: maxVal,
      };
      setCounters([...counters, newCounter]);
      setNewLabel("");
      setNewMaxValue("");
      setNewDefaultValue("0");
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

  if (isLoading) {
    return (
      <div className="app">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading counters...</p>
        </div>
      </div>
    );
  }

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
          <div className="default-value-section">
            <label className="input-label">Default value:</label>
            <div className="default-value-controls">
              <input
                type="number"
                placeholder="0"
                value={newDefaultValue}
                onChange={(e) => setNewDefaultValue(e.target.value)}
                className="counter-default-input"
                min="0"
                max={newMaxValue || undefined}
              />
              <div className="quick-set-buttons">
                <button
                  type="button"
                  onClick={() => setNewDefaultValue("0")}
                  className="quick-set-button"
                >
                  0
                </button>
                {newMaxValue && (
                  <button
                    type="button"
                    onClick={() => setNewDefaultValue(newMaxValue)}
                    className="quick-set-button"
                  >
                    Max ({newMaxValue})
                  </button>
                )}
              </div>
            </div>
          </div>
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
