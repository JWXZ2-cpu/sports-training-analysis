export default function MicButton({ listening, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 120,
        height: 120,
        borderRadius: "50%",
        border: "none",
        background: listening
          ? "linear-gradient(135deg, var(--red) 0%, var(--red) 100%)"
          : "linear-gradient(135deg, var(--accent) 0%, var(--accent) 100%)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: listening
          ? "0 0 0 8px rgba(226,75,74,0.15), 0 4px 20px rgba(226,75,74,0.3)"
          : "0 4px 20px rgba(83,74,183,0.3)",
        transition: "all 0.3s ease",
        animation: listening ? "mic-pulse 1.5s infinite" : "none",
        position: "relative",
      }}
    >
      {/* Mic icon */}
      <svg
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
      </svg>

      {/* Pulse rings when listening */}
      {listening && (
        <style>{`
          @keyframes mic-pulse {
            0% { box-shadow: 0 0 0 0 rgba(226,75,74,0.4), 0 4px 20px rgba(226,75,74,0.3); }
            70% { box-shadow: 0 0 0 20px rgba(226,75,74,0), 0 4px 20px rgba(226,75,74,0.3); }
            100% { box-shadow: 0 0 0 0 rgba(226,75,74,0), 0 4px 20px rgba(226,75,74,0.3); }
          }
        `}</style>
      )}
    </button>
  );
}
