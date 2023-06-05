import React from "react";
import { register } from "../domain/io";
import schema from "../../schema/schema.json";

export default function SignupForm(props: {
  onSuccess: (userName: string) => void;
  onError: (error: Error) => void;
  onCancel: () => void;
}) {
  const { onSuccess, onError, onCancel } = props;
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const userName = data.get("name") as string;
    const done = await register(userName).catch(onError);
    if (done) {
      onSuccess(userName);
    }
  };
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
      <div style={{ zIndex: 1 }}>
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
              style={{ width: "100%", boxSizing: "border-box" }}
            />
            <div className="help">lowercase letters, numbers, and hyphens</div>
          </div>
          <input
            className="button wide primary form-item"
            type="submit"
            value="Signup"
          />
        </form>
      </div>
    </div>
  );
}
