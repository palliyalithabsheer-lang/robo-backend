import './StatCard.css';

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  sub?: string;
  trend?: number;      // % change, positive = up
  accentColor: string;
  iconBg: string;
}

const StatCard = ({ icon, label, value, sub, trend, accentColor, iconBg }: StatCardProps) => {
  const trendDir = trend === undefined ? 'neutral' : trend >= 0 ? 'up' : 'down';
  const trendIcon = trendDir === 'up' ? '↑' : trendDir === 'down' ? '↓' : '—';

  return (
    <div
      className="stat-card"
      style={{ '--accent-color': accentColor, '--icon-bg': iconBg } as React.CSSProperties}
    >
      <div className="stat-card-top">
        <div className="stat-icon-wrap">{icon}</div>
        {trend !== undefined && (
          <div className={`stat-trend ${trendDir}`}>
            {trendIcon} {Math.abs(trend).toFixed(1)}%
          </div>
        )}
      </div>

      <div className="stat-card-body">
        <div className="stat-value">{typeof value === 'number' ? value.toLocaleString() : value}</div>
        <div className="stat-label">{label}</div>
        {sub && <div className="stat-sub">{sub}</div>}
      </div>
    </div>
  );
};

export default StatCard;
