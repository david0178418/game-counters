import { useState, useEffect } from "react";
import { Counter } from "./Counter";
import { CollectionSelector } from "./CollectionSelector";
import { CollectionManager } from "./CollectionManager";
import { ThemeToggle } from "./ThemeToggle";
import "./index.css";

interface CounterData {
  id: string;
  label: string;
  value: number;
  initialValue: number;
  maxValue?: number;
  rotation: number;
}

interface Collection {
  id: string;
  name: string;
  createdAt: number;
  lastModified: number;
  counters: CounterData[];
}

interface AppSettings {
  lastActiveCollectionId: string | null;
  theme: 'light' | 'dark';
  isMaximized: boolean;
}

export function App() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCollectionManager, setShowCollectionManager] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newMaxValue, setNewMaxValue] = useState("");
  const [newDefaultValue, setNewDefaultValue] = useState("0");
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isMaximized, setIsMaximized] = useState(false);

  const activeCollection = collections.find(c => c.id === activeCollectionId);
  const counters = activeCollection?.counters || [];

  // Collection utility functions
  const createCollection = (name: string, initialCounters: CounterData[] = []): Collection => {
    const now = Date.now();
    return {
      id: now.toString(),
      name: name.trim(),
      createdAt: now,
      lastModified: now,
      counters: initialCounters,
    };
  };

  const updateActiveCollection = (updatedCounters: CounterData[]) => {
    if (!activeCollectionId) return;
    
    setCollections(prevCollections =>
      prevCollections.map(collection =>
        collection.id === activeCollectionId
          ? { ...collection, counters: updatedCounters, lastModified: Date.now() }
          : collection
      )
    );
  };

  const switchToCollection = (collectionId: string) => {
    setActiveCollectionId(collectionId);
    setShowAddForm(false);
    setShowCollectionManager(false);
  };

  const duplicateCollection = (sourceCollection: Collection, newName: string): Collection => {
    return createCollection(newName, sourceCollection.counters.map(counter => ({
      ...counter,
      id: Date.now() + Math.random().toString(),
      rotation: counter.rotation || 0,
    })));
  };

  const isValidCounterData = (data: any): data is CounterData => {
    return (
      data &&
      typeof data.id === "string" &&
      typeof data.label === "string" &&
      typeof data.value === "number" &&
      typeof data.initialValue === "number" &&
      (data.maxValue === undefined || typeof data.maxValue === "number") &&
      typeof data.rotation === "number"
    );
  };

  // Migration and loading logic
  useEffect(() => {
    try {
      // Try to load collections first
      const savedCollections = localStorage.getItem("collections-data");
      const savedSettings = localStorage.getItem("app-settings");
      
      if (savedCollections) {
        // Load existing collections
        const parsedCollections = JSON.parse(savedCollections);
        if (Array.isArray(parsedCollections)) {
          setCollections(parsedCollections);
          
          // Load last active collection and theme
          if (savedSettings) {
            const settings: AppSettings = JSON.parse(savedSettings);
            
            // Load active collection
            const lastActiveExists = parsedCollections.find(c => c.id === settings.lastActiveCollectionId);
            if (lastActiveExists) {
              setActiveCollectionId(settings.lastActiveCollectionId);
            } else if (parsedCollections.length > 0) {
              setActiveCollectionId(parsedCollections[0].id);
            }
            
            // Load theme
            if (settings.theme) {
              setTheme(settings.theme);
            }
            
            // Load maximized state
            if (settings.isMaximized !== undefined) {
              setIsMaximized(settings.isMaximized);
            }
          } else if (parsedCollections.length > 0) {
            setActiveCollectionId(parsedCollections[0].id);
          }
        }
      } else {
        // Migration from old format
        const oldCounters = localStorage.getItem("game-counters");
        if (oldCounters) {
          const parsed = JSON.parse(oldCounters);
          if (Array.isArray(parsed)) {
            const migratedCounters = parsed.map(counter => ({
              ...counter,
              rotation: counter.rotation || 0
            }));
            const validCounters = migratedCounters.filter(isValidCounterData);
            const defaultCollection = createCollection("My Counters", validCounters);
            
            setCollections([defaultCollection]);
            setActiveCollectionId(defaultCollection.id);
            
            // Clean up old storage
            localStorage.removeItem("game-counters");
            
            console.log("Migrated counters to collections format");
          }
        } else {
          // Create default collection for new users
          const defaultCollection = createCollection("My Counters");
          setCollections([defaultCollection]);
          setActiveCollectionId(defaultCollection.id);
        }
      }
    } catch (error) {
      console.error("Failed to load collections:", error);
      // Fallback: create default collection
      const defaultCollection = createCollection("My Counters");
      setCollections([defaultCollection]);
      setActiveCollectionId(defaultCollection.id);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save collections to localStorage
  useEffect(() => {
    if (collections.length > 0) {
      try {
        localStorage.setItem("collections-data", JSON.stringify(collections));
      } catch (error) {
        console.error("Failed to save collections:", error);
        if (error instanceof DOMException && error.name === "QuotaExceededError") {
          alert("Storage quota exceeded. Please remove some collections or counters.");
        }
      }
    }
  }, [collections]);

  // Save app settings (active collection and theme)
  useEffect(() => {
    if (activeCollectionId) {
      try {
        const settings: AppSettings = {
          lastActiveCollectionId: activeCollectionId,
          theme: theme,
          isMaximized: isMaximized,
        };
        localStorage.setItem("app-settings", JSON.stringify(settings));
      } catch (error) {
        console.error("Failed to save app settings:", error);
      }
    }
  }, [activeCollectionId, theme, isMaximized]);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Handle fullscreen change events (e.g., user presses Escape key)
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      
      // If we're no longer in fullscreen but our state says we're maximized,
      // update our state to match
      if (!isCurrentlyFullscreen && isMaximized) {
        setIsMaximized(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isMaximized]);

  // Theme toggle function
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

  // Maximize/minimize toggle function
  const toggleMaximized = async () => {
    const newMaximizedState = !isMaximized;
    
    if (newMaximizedState) {
      // Entering maximized mode - request fullscreen
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      } catch (error) {
        console.warn('Fullscreen request failed:', error);
        // Continue with maximized mode even if fullscreen fails
      }
    } else {
      // Exiting maximized mode - exit fullscreen
      try {
        if (document.fullscreenElement && document.exitFullscreen) {
          await document.exitFullscreen();
        }
      } catch (error) {
        console.warn('Exit fullscreen failed:', error);
        // Continue with normal mode even if exit fullscreen fails
      }
    }
    
    setIsMaximized(newMaximizedState);
  };

  const addCounter = () => {
    if (newLabel.trim() && activeCollectionId) {
      const maxVal = newMaxValue ? parseInt(newMaxValue) : undefined;
      const defaultVal = parseInt(newDefaultValue) || 0;
      
      const newCounter: CounterData = {
        id: Date.now().toString(),
        label: newLabel.trim(),
        value: defaultVal,
        initialValue: defaultVal,
        maxValue: maxVal,
        rotation: 0,
      };
      
      const updatedCounters = [...counters, newCounter];
      updateActiveCollection(updatedCounters);
      
      setNewLabel("");
      setNewMaxValue("");
      setNewDefaultValue("0");
      setShowAddForm(false);
    }
  };

  const removeCounter = (id: string) => {
    const updatedCounters = counters.filter((counter) => counter.id !== id);
    updateActiveCollection(updatedCounters);
  };

  const updateCounter = (id: string, value: number) => {
    const updatedCounters = counters.map((counter) =>
      counter.id === id ? { ...counter, value } : counter
    );
    updateActiveCollection(updatedCounters);
  };

  const rotateCounter = (id: string, rotation: number) => {
    const updatedCounters = counters.map((counter) =>
      counter.id === id ? { ...counter, rotation } : counter
    );
    updateActiveCollection(updatedCounters);
  };

  const resetAllCounters = () => {
    const updatedCounters = counters.map((counter) => ({
      ...counter,
      value: counter.initialValue,
    }));
    updateActiveCollection(updatedCounters);
  };

  // Collection management functions
  const handleCreateCollection = (name: string, duplicateFromId?: string) => {
    let newCollection: Collection;
    
    if (duplicateFromId) {
      const sourceCollection = collections.find(c => c.id === duplicateFromId);
      if (sourceCollection) {
        newCollection = duplicateCollection(sourceCollection, name);
      } else {
        newCollection = createCollection(name);
      }
    } else {
      newCollection = createCollection(name);
    }
    
    setCollections([...collections, newCollection]);
    switchToCollection(newCollection.id);
  };

  const handleDeleteCollection = (collectionId: string) => {
    if (collections.length <= 1) return;
    
    const updatedCollections = collections.filter(c => c.id !== collectionId);
    setCollections(updatedCollections);
    
    // If we deleted the active collection, switch to the first available
    if (collectionId === activeCollectionId) {
      const firstCollection = updatedCollections[0];
      if (firstCollection) {
        setActiveCollectionId(firstCollection.id);
      }
    }
  };

  const handleRenameCollection = (collectionId: string, newName: string) => {
    setCollections(collections.map(collection =>
      collection.id === collectionId
        ? { ...collection, name: newName, lastModified: Date.now() }
        : collection
    ));
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
    <div className={`app ${isMaximized ? 'maximized' : ''}`}>
      {!isMaximized && (
        <header className="app-header">
        <div className="header-main">
          <h1>Game Counters</h1>
          <CollectionSelector
            collections={collections}
            activeCollectionId={activeCollectionId}
            onCollectionSelect={switchToCollection}
            onManageCollections={() => setShowCollectionManager(true)}
          />
        </div>
        <div className="header-buttons">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
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
      )}

      {isMaximized && (
        <button
          type="button"
          className="floating-minimize-button"
          onClick={toggleMaximized}
          aria-label="Exit fullscreen"
          title="Exit fullscreen"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="20" 
            height="20" 
            fill="currentColor" 
            viewBox="0 0 16 16"
            className="fullscreen-exit-icon"
          >
            <path d="M5.5 0a.5.5 0 0 1 .5.5v4A1.5 1.5 0 0 1 4.5 6h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5m5 0a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 10 4.5v-4a.5.5 0 0 1 .5-.5M0 10.5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 6 11.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5m10 1a1.5 1.5 0 0 1 1.5-1.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0z"/>
          </svg>
        </button>
      )}

      {!isMaximized && showAddForm && (
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

      {!isMaximized && counters.length === 0 && !showAddForm && (
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
            value={counter.value}
            initialValue={counter.initialValue}
            maxValue={counter.maxValue}
            rotation={counter.rotation || 0}
            isMaximized={isMaximized}
            onRemove={removeCounter}
            onUpdate={updateCounter}
            onRotate={rotateCounter}
          />
        ))}
      </div>

      {!isMaximized && counters.length > 0 && (
        <button
          type="button"
          className="floating-maximize-button"
          onClick={toggleMaximized}
          aria-label="Enter fullscreen"
          title="Enter fullscreen"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="20" 
            height="20" 
            fill="currentColor" 
            viewBox="0 0 16 16"
            className="fullscreen-enter-icon"
          >
            <path d="M1.5 1a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4A1.5 1.5 0 0 1 1.5 0h4a.5.5 0 0 1 0 1zM10 .5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 16 1.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5M.5 10a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 0 14.5v-4a.5.5 0 0 1 .5-.5m15 0a.5.5 0 0 1 .5.5v4a1.5 1.5 0 0 1-1.5 1.5h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5"/>
          </svg>
        </button>
      )}

      {!isMaximized && showCollectionManager && (
        <CollectionManager
          collections={collections}
          activeCollectionId={activeCollectionId}
          onClose={() => setShowCollectionManager(false)}
          onCreateCollection={handleCreateCollection}
          onDeleteCollection={handleDeleteCollection}
          onRenameCollection={handleRenameCollection}
          onSwitchCollection={switchToCollection}
        />
      )}
    </div>
  );
}

export default App;
