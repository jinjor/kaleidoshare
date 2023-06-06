import React, { ReactNode } from "react";

export default function Modal(props: {
  onCancel: () => void;
  children: ReactNode;
}) {
  const { onCancel, children } = props;
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1,
      }}
    >
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          background: "black",
          opacity: 0.5,
        }}
        onClick={onCancel}
      ></div>
      <div style={{ zIndex: 1 }}>{children}</div>
    </div>
  );
}
