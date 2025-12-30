export default function MoodSelector({ mood, setMood }) {
  const buttons = [
    { key: "school", label: "🏫 School / College" }, 
    { key: "food", label: "🍽 Hotel / Restaurant" },
    { key: "hospital", label: "🏥 Hospital" },
    { key: "theatre", label: "🎭 Theatre" },

    
  ];

  return (
    <div className="moods">
      {buttons.map((b) => (
        <button
          key={b.key}
          className={`mood-btn ${mood === b.key ? "active" : ""}`}
          onClick={() => setMood(b.key)}
        >
          {b.label}
        </button>
      ))}
    </div>
  );
}
