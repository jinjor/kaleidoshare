import React from "react";

export default function IconButton(props: {
  path: string;
  onClick: () => void;
}) {
  const { onClick, path: d } = props;
  return (
    <button
      className="button"
      style={{ border: "none", marginRight: -6, padding: 6 }}
      onClick={onClick}
    >
      <svg viewBox="0 0 24 24" style={{ width: 24, height: 24 }}>
        <path d={d} stroke="#eee" strokeWidth={1} fill="none" />
      </svg>
    </button>
  );
}
