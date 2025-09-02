import { useState } from "react";

interface Collection {
  id: string;
  name: string;
  createdAt: number;
  lastModified: number;
  counters: any[];
}

interface CollectionManagerProps {
  collections: Collection[];
  activeCollectionId: string | null;
  onClose: () => void;
  onCreateCollection: (name: string, duplicateFrom?: string) => void;
  onDeleteCollection: (id: string) => void;
  onRenameCollection: (id: string, newName: string) => void;
  onSwitchCollection: (id: string) => void;
}

export function CollectionManager({
  collections,
  activeCollectionId,
  onClose,
  onCreateCollection,
  onDeleteCollection,
  onRenameCollection,
  onSwitchCollection,
}: CollectionManagerProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [duplicateFromId, setDuplicateFromId] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const handleCreate = () => {
    if (newCollectionName.trim()) {
      onCreateCollection(newCollectionName.trim(), duplicateFromId || undefined);
      setNewCollectionName("");
      setDuplicateFromId("");
      setShowCreateForm(false);
    }
  };

  const handleRename = (collection: Collection) => {
    setEditingId(collection.id);
    setEditingName(collection.name);
  };

  const handleSaveRename = () => {
    if (editingId && editingName.trim()) {
      onRenameCollection(editingId, editingName.trim());
      setEditingId(null);
      setEditingName("");
    }
  };

  const handleCancelRename = () => {
    setEditingId(null);
    setEditingName("");
  };

  const handleDelete = (collection: Collection) => {
    if (collections.length <= 1) {
      alert("Cannot delete the last collection.");
      return;
    }

    const confirmMessage = `Delete "${collection.name}" with ${collection.counters.length} counters?`;
    if (confirm(confirmMessage)) {
      onDeleteCollection(collection.id);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="collection-manager-overlay">
      <div className="collection-manager">
        <div className="collection-manager-header">
          <h2>Manage Collections</h2>
          <button
            type="button"
            className="collection-manager-close"
            onClick={onClose}
            aria-label="Close collection manager"
          >
            ×
          </button>
        </div>

        <div className="collection-manager-content">
          <div className="collection-manager-actions">
            <button
              type="button"
              className="collection-create-button"
              onClick={() => setShowCreateForm(true)}
            >
              + New Collection
            </button>
          </div>

          {showCreateForm && (
            <div className="collection-create-form">
              <h3>Create New Collection</h3>
              <input
                type="text"
                placeholder="Collection name"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                className="collection-name-input"
                autoFocus
              />
              
              <div className="collection-duplicate-section">
                <label>
                  <input
                    type="checkbox"
                    checked={!!duplicateFromId}
                    onChange={(e) => setDuplicateFromId(e.target.checked ? collections[0]?.id || "" : "")}
                  />
                  Copy counters from existing collection
                </label>
                {duplicateFromId && (
                  <select
                    value={duplicateFromId}
                    onChange={(e) => setDuplicateFromId(e.target.value)}
                    className="collection-duplicate-select"
                  >
                    {collections.map((collection) => (
                      <option key={collection.id} value={collection.id}>
                        {collection.name} ({collection.counters.length} counters)
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="collection-form-buttons">
                <button
                  type="button"
                  onClick={handleCreate}
                  className="collection-form-confirm"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewCollectionName("");
                    setDuplicateFromId("");
                  }}
                  className="collection-form-cancel"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="collection-list-manager">
            <h3>Your Collections</h3>
            <div className="collection-items">
              {collections.map((collection) => (
                <div
                  key={collection.id}
                  className={`collection-manager-item ${
                    collection.id === activeCollectionId ? "active" : ""
                  }`}
                >
                  <div className="collection-item-info">
                    {editingId === collection.id ? (
                      <div className="collection-edit-form">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="collection-edit-input"
                          autoFocus
                        />
                        <div className="collection-edit-buttons">
                          <button
                            type="button"
                            onClick={handleSaveRename}
                            className="collection-edit-save"
                          >
                            ✓
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelRename}
                            className="collection-edit-cancel"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="collection-item-main">
                          <h4 className="collection-item-name">
                            {collection.name}
                            {collection.id === activeCollectionId && (
                              <span className="collection-active-badge">Active</span>
                            )}
                          </h4>
                          <div className="collection-item-details">
                            <span>{collection.counters.length} counters</span>
                            <span>Created {formatDate(collection.createdAt)}</span>
                            {collection.lastModified !== collection.createdAt && (
                              <span>Modified {formatDate(collection.lastModified)}</span>
                            )}
                          </div>
                        </div>
                        <div className="collection-item-actions">
                          {collection.id !== activeCollectionId && (
                            <button
                              type="button"
                              onClick={() => onSwitchCollection(collection.id)}
                              className="collection-action-button collection-switch"
                            >
                              Switch
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRename(collection)}
                            className="collection-action-button collection-rename"
                          >
                            Rename
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(collection)}
                            className="collection-action-button collection-delete"
                            disabled={collections.length <= 1}
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}