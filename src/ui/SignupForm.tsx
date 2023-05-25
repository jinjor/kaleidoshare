import React from "react";
import { register } from "../domain/register";

export default function SignupForm(props: {
  onSuccess: (userName: string) => void;
}) {
  const { onSuccess } = props;
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const userName = data.get("name") as string;
    await register(userName);
    alert("ok"); // TODO
    onSuccess(userName);
  };
  return (
    <form className="form" onSubmit={handleSubmit}>
      <h1 className="form-title">Signup</h1>
      <label style={{ display: "block" }}>
        <div>Name</div>
        <input
          autoFocus
          required
          className="input"
          type="text"
          name="name"
          minLength={1}
          maxLength={39}
          // GitHub と同じルール
          pattern="^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$"
        />
      </label>
      <input className="button wide primary" type="submit" value="Signup" />
    </form>
  );
}
