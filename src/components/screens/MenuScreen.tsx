import { useEffect, useRef } from 'react';
import './MenuScreen.css';

interface MenuItem {
  id: string;
  title: string;
}

interface MenuScreenProps {
  title: string;
  items: MenuItem[];
  selectedIndex: number;
}

const MenuScreen = ({ title, items, selectedIndex }: MenuScreenProps) => {
  const selectedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedRef.current) {
      selectedRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedIndex]);

  return (
    <div className="menu-screen">
      <h2 className="menu-title">{title}</h2>
      <div className="menu-list">
        {items.length === 0 && <p className="empty-state">No items available</p>}
        {items.map((item, index) => (
          <div
            key={item.id}
            ref={index === selectedIndex ? selectedRef : null}
            className={`menu-item ${index === selectedIndex ? 'selected' : ''}`}
          >
            {item.title}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuScreen;
