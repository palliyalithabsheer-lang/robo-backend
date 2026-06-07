import './MenuScreen.css';

interface TopicActionScreenProps {
  topicTitle: string;
  selectedIndex: number;
}

const TopicActionScreen = ({ topicTitle, selectedIndex }: TopicActionScreenProps) => {
  const options = ['Watch', 'Play'];

  return (
    <div className="menu-screen">
      <h2 className="menu-title">{topicTitle}</h2>
      <div className="menu-list">
        {options.map((option, index) => (
          <div
            key={option}
            className={`menu-item ${index === selectedIndex ? 'selected' : ''}`}
          >
            {option}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopicActionScreen;
