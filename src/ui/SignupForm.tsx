import React from "react";
import { register } from "../domain/io";

export default function SignupForm(props: {
  onSuccess: (userName: string) => void;
  onError: (error: Error) => void;
}) {
  const { onSuccess, onError } = props;
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const userName = data.get("name") as string;
    await register(userName).catch(onError);
    onSuccess(userName);
  };
  return (
    <form className="form" onSubmit={handleSubmit}>
      <h1 className="form-title">Signup</h1>
      <label style={{ display: "block" }}>Name</label>
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

      <input className="button wide primary" type="submit" value="Signup" />
    </form>
  );
}
