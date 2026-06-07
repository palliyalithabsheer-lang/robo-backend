import type { ContentStatus } from '../../types';

interface PublishActionsProps {
  status: ContentStatus;
  onPublish: () => void;
  onUnpublish: () => void;
  onArchive: () => void;
}

const PublishActions = ({ status, onPublish, onUnpublish, onArchive }: PublishActionsProps) => {
  const btnBase: React.CSSProperties = {
    border: 'none', padding: '5px 10px', borderRadius: '6px',
    fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
    transition: 'opacity 0.15s',
  };

  return (
    <div style={{ display: 'flex', gap: '6px' }}>
      {status !== 'published' && status !== 'archived' && (
        <button
          style={{ ...btnBase, background: '#dcfce7', color: '#16a34a' }}
          title="Publish"
          onClick={onPublish}
        >
          Publish
        </button>
      )}
      {status === 'published' && (
        <button
          style={{ ...btnBase, background: '#fef3c7', color: '#d97706' }}
          title="Unpublish back to Draft"
          onClick={onUnpublish}
        >
          Unpublish
        </button>
      )}
      {status !== 'archived' && (
        <button
          style={{ ...btnBase, background: '#f3e8ff', color: '#9333ea' }}
          title="Archive"
          onClick={onArchive}
        >
          Archive
        </button>
      )}
      {status === 'archived' && (
        <button
          style={{ ...btnBase, background: '#f1f5f9', color: '#64748b' }}
          title="Restore to Draft"
          onClick={onUnpublish}
        >
          Restore
        </button>
      )}
    </div>
  );
};

export default PublishActions;
