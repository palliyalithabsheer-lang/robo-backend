import type { ContentStatus } from '../../types';

interface ContentStatusBadgeProps {
  status: ContentStatus;
}

const STATUS_CONFIG: Record<ContentStatus, { label: string; bg: string; color: string; emoji: string }> = {
  draft:     { label: 'Draft',     bg: '#f1f5f9', color: '#64748b', emoji: '✏️' },
  review:    { label: 'In Review', bg: '#fef3c7', color: '#d97706', emoji: '🔍' },
  published: { label: 'Published', bg: '#dcfce7', color: '#16a34a', emoji: '✅' },
  archived:  { label: 'Archived',  bg: '#f3e8ff', color: '#9333ea', emoji: '📦' },
};

const ContentStatusBadge = ({ status }: ContentStatusBadgeProps) => {
  const cfg = STATUS_CONFIG[status];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      background: cfg.bg, color: cfg.color,
      padding: '4px 10px', borderRadius: '20px',
      fontSize: '0.75rem', fontWeight: 700,
      textTransform: 'uppercase', letterSpacing: '0.04em',
      whiteSpace: 'nowrap',
    }}>
      {cfg.emoji} {cfg.label}
    </span>
  );
};

export default ContentStatusBadge;
