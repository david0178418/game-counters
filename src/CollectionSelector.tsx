interface Collection {
  id: string;
  name: string;
  createdAt: number;
  lastModified: number;
  counters: any[];
}

interface CollectionSelectorProps {
  collections: Collection[];
  activeCollectionId: string | null;
  onCollectionSelect: (collectionId: string) => void;
  onManageCollections: () => void;
}

import { useState, useRef, useEffect } from "react";

export function CollectionSelector({
  collections,
  activeCollectionId,
  onCollectionSelect,
  onManageCollections,
}: CollectionSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const activeCollection = collections.find(c => c.id === activeCollectionId);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleCollectionSelect = (collectionId: string) => {
    onCollectionSelect(collectionId);
    setIsOpen(false);
  };

  const handleManageCollections = () => {
    onManageCollections();
    setIsOpen(false);
  };

  return (
    <div className="collection-selector" ref={dropdownRef}>
      <div className="collection-dropdown">
        <button
          type="button"
          className="collection-current"
          aria-label="Collection selector"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="collection-name">
            {activeCollection?.name || "No Collection"}
          </span>
          <span className={`collection-arrow ${isOpen ? 'open' : ''}`}>▼</span>
        </button>
        
        {isOpen && (
          <div className="collection-menu">
            <div className="collection-list">
              {collections.map((collection) => (
                <button
                  key={collection.id}
                  type="button"
                  className={`collection-item ${
                    collection.id === activeCollectionId ? "active" : ""
                  }`}
                  onClick={() => handleCollectionSelect(collection.id)}
                >
                  <div className="collection-item-main">
                    <span className="collection-item-name">{collection.name}</span>
                    <span className="collection-item-count">
                      {collection.counters.length} counters
                    </span>
                  </div>
                  {collection.id === activeCollectionId && (
                    <span className="collection-active-indicator">✓</span>
                  )}
                </button>
              ))}
            </div>
            
            <div className="collection-actions">
              <button
                type="button"
                className="collection-manage-button"
                onClick={handleManageCollections}
              >
                Manage Collections
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}