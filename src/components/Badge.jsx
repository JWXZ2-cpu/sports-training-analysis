export default function Badge({ text, style }) {
  return (
    <span style={{
      fontSize: 11, padding: "2px 9px", borderRadius: 20,
      border: "0.5px solid", display: "inline-block",
      ...style
    }}>{text}</span>
  );
}
