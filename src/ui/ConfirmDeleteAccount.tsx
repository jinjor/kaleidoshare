import React from "react";
import Modal from "./Modal";

export default function ConfirmDeleteAccount(props: {
  id: number | string | null;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const { id, onConfirm, onCancel } = props;
  const [input, setInput] = React.useState("");
  const hanldeInput = (event: React.FormEvent<HTMLInputElement>) => {
    setInput(event.currentTarget.value);
  };
  const handleOk = (event: React.FormEvent<HTMLButtonElement>) => {
    event.preventDefault();
    onConfirm();
  };
  if (id == null) {
    return null;
  }
  const disabled = input !== "delete";
  return (
    <Modal key={id} onCancel={onCancel}>
      <div className="form">
        <h1 className="form-title">Are you sure?</h1>
        <p style={{ margin: 0 }}>
          This will delete your account and all of your data. This cannot be
          undone.
        </p>
        <div className="form-item">
          <p>Type "delete" to confirm.</p>
          <input
            className="input"
            type="text"
            onInput={hanldeInput}
            style={{ width: "100%" }}
          />
        </div>
        <button
          className="button wide danger"
          disabled={disabled}
          onClick={handleOk}
        >
          Ok, delete my account.
        </button>
      </div>
    </Modal>
  );
}
