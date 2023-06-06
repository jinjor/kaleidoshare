import React, { ReactNode } from "react";

export default function Modal(props: {
  onCancel: () => void;
  children: ReactNode;
}) {
  const { onCancel, children } = props;
  return (
    <div className="modal">
      <div className="modal-back" onClick={onCancel}></div>
      <div className="modal-front">{children}</div>
    </div>
  );
}
