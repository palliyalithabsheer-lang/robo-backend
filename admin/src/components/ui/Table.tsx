import React from 'react';
import './Table.css';

interface Column<T> {
  key: string;
  title: string;
  render?: (item: T) => React.ReactNode;
}

interface TableProps<T> {
  title: string;
  data: T[];
  columns: Column<T>[];
  onAdd?: () => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  addButtonLabel?: string;
}

function Table<T extends { id: string }>({ 
  title, data, columns, onAdd, onEdit, onDelete, addButtonLabel = "Add New" 
}: TableProps<T>) {
  return (
    <div className="table-container">
      <div className="table-header">
        <h2 className="table-title">{title}</h2>
        {onAdd && (
          <div className="table-actions">
            <button onClick={onAdd}>➕ {addButtonLabel}</button>
          </div>
        )}
      </div>
      
      <table className="data-table">
        <thead>
          <tr>
            {columns.map(col => <th key={col.key}>{col.title}</th>)}
            {(onEdit || onDelete) && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 1} style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
                No records found.
              </td>
            </tr>
          ) : (
            data.map(item => (
              <tr key={item.id}>
                {columns.map(col => (
                  <td key={col.key}>
                    {col.render ? col.render(item) : (item as any)[col.key]}
                  </td>
                ))}
                {(onEdit || onDelete) && (
                  <td>
                    <div className="action-btns">
                      {onEdit && (
                        <button className="btn-icon btn-edit" onClick={() => onEdit(item)} title="Edit">
                          ✏️
                        </button>
                      )}
                      {onDelete && (
                        <button className="btn-icon btn-delete" onClick={() => onDelete(item)} title="Delete">
                          🗑️
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
