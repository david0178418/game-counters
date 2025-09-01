import { useState } from "react";

interface CounterProps {
  id: string;
  label: string;
  initialValue?: number;
  maxValue?: number;
  onRemove: (id: string) => void;
  onUpdate: (id: string, value: number) => void;
}

export function Counter({
  id,
  label,
  initialValue = 0,
  maxValue,
  onRemove,
  onUpdate,
}: CounterProps) {
  const [value, setValue] = useState(initialValue);

  const increment = () => {
    if (maxValue === undefined || value < maxValue) {
      const newValue = value + 1;
      setValue(newValue);
      onUpdate(id, newValue);
    }
  };

  const decrement = () => {
    if (value > 0) {
      const newValue = value - 1;
      setValue(newValue);
      onUpdate(id, newValue);
    }
  };

  const reset = () => {
    setValue(initialValue);
    onUpdate(id, initialValue);
  };

  const remove = () => {
    onRemove(id);
  };

  return (
    <div className="counter">
      <div className="counter-header">
        <h3 className="counter-label">{label}</h3>
        <button
          type="button"
          className="counter-remove"
          onClick={remove}
          aria-label={`Remove ${label} counter`}
        >
          ×
        </button>
      </div>

      <div className="counter-value">{value}</div>

      {maxValue && (
        <div className="counter-max">Max: {maxValue}</div>
      )}

      <div className="counter-controls">
        <button
          type="button"
          className="counter-button counter-decrement"
          onClick={decrement}
          disabled={value <= 0}
          aria-label={`Decrease ${label}`}
        >
          −
        </button>

        <button
          type="button"
          className="counter-button counter-reset"
          onClick={reset}
          aria-label={`Reset ${label} to ${initialValue}`}
        >
          Reset
        </button>

        <button
          type="button"
          className="counter-button counter-increment"
          onClick={increment}
          disabled={maxValue !== undefined && value >= maxValue}
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
    </div>
  );
}