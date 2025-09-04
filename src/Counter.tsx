
interface CounterProps {
  id: string;
  label: string;
  value: number;
  initialValue?: number;
  maxValue?: number;
  rotation: number;
  isMaximized?: boolean;
  onRemove: (id: string) => void;
  onUpdate: (id: string, value: number) => void;
  onRotate: (id: string, rotation: number) => void;
}

export function Counter({
  id,
  label,
  value,
  initialValue = 0,
  maxValue,
  rotation,
  isMaximized = false,
  onRemove,
  onUpdate,
  onRotate,
}: CounterProps) {

  const increment = () => {
    if (maxValue === undefined || value < maxValue) {
      const newValue = value + 1;
      onUpdate(id, newValue);
    }
  };

  const decrement = () => {
    if (value > 0) {
      const newValue = value - 1;
      onUpdate(id, newValue);
    }
  };

  const reset = () => {
    onUpdate(id, initialValue);
  };

  const remove = () => {
    onRemove(id);
  };

  const rotate = () => {
    const newRotation = (rotation + 90) % 360;
    onRotate(id, newRotation);
  };

  return (
    <div 
      className="counter" 
      style={{ transform: `rotate(${rotation}deg)` }}
      data-rotation={rotation}
    >
      <div className="counter-header">
        <h3 className="counter-label">{label}</h3>
        {!isMaximized && (
          <div className="counter-header-actions">
            <button
              type="button"
              className="counter-rotate"
              onClick={rotate}
              aria-label={`Rotate ${label} counter`}
            >
              ↻
            </button>
            <button
              type="button"
              className="counter-remove"
              onClick={remove}
              aria-label={`Remove ${label} counter`}
            >
              ×
            </button>
          </div>
        )}
      </div>

      <div className="counter-value-section">
        <div className="counter-value">{value}</div>
        {maxValue && (
          <div className="counter-max-small">/{maxValue}</div>
        )}
      </div>

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