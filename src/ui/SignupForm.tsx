import React from "react";
import { login, register } from "../domain/io";
import schema from "../../schema/schema.json";
import Modal from "./Modal";

export default function SignupForm(props: {
  id: number | string | null;
  onSuccess: (userName: string, isLogin: boolean) => void;
  onError: (error: Error) => void;
  onCancel: () => void;
}) {
  const { id, onSuccess, onError, onCancel } = props;
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const userName = data.get("name") as string;
    try {
      const done = await register(userName);
      if (done) {
        onSuccess(userName, false);
      }
    } catch (e) {
      onError(e);
    }
  };
  const handleLogin = async (event: React.FormEvent<HTMLButtonElement>) => {
    event.preventDefault();
    try {
      const user = await login();
      if (user != null) {
        onSuccess(user.name, true);
      }
    } catch (e) {
      onError(e);
    }
  };
  if (id == null) {
    return null;
  }
  return (
    <Modal key={id} onCancel={onCancel}>
      <form className="form" onSubmit={handleSubmit}>
        <h1 className="form-title">Signup</h1>
        <div className="form-item">
          <label style={{ display: "block" }}>Name</label>
          <input
            autoFocus
            required
            className="input"
            type="text"
            name="name"
            minLength={schema.definitions.UserName.minLength}
            maxLength={schema.definitions.UserName.maxLength}
            pattern={schema.definitions.UserName.pattern}
            style={{ width: "100%" }}
          />
          <div className="help">lowercase letters, numbers, and hyphens</div>
        </div>
        <input
          className="button wide primary form-item"
          type="submit"
          value="Signup"
        />
        <div className="help">
          Already have an account? -{" "}
          <button className="link" onClick={handleLogin}>
            Login
          </button>
        </div>
      </form>
    </Modal>
  );
}
