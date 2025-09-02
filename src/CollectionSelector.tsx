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

export function CollectionSelector({
  collections,
  activeCollectionId,
  onCollectionSelect,
  onManageCollections,
}: CollectionSelectorProps) {
  const activeCollection = collections.find(c => c.id === activeCollectionId);

  return (
    <div className="collection-selector">
      <div className="collection-dropdown">
        <button
          type="button"
          className="collection-current"
          aria-label="Collection selector"
        >
          <span className="collection-name">
            {activeCollection?.name || "No Collection"}
          </span>
          <span className="collection-arrow">▼</span>
        </button>
        
        <div className="collection-menu">
          <div className="collection-list">
            {collections.map((collection) => (
              <button
                key={collection.id}
                type="button"
                className={`collection-item ${
                  collection.id === activeCollectionId ? "active" : ""
                }`}
                onClick={() => onCollectionSelect(collection.id)}
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
              onClick={onManageCollections}
            >
              Manage Collections
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}