import React from "react";
import { register } from "../domain/io";
import schema from "../../schema/schema.json";

export default function SignupForm(props: {
  onSuccess: (userName: string) => void;
  onError: (error: Error) => void;
}) {
  const { onSuccess, onError } = props;
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
    <form className="form" onSubmit={handleSubmit}>
      <h1 className="form-title">Signup</h1>
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
      />

      <input className="button wide primary" type="submit" value="Signup" />
    </form>
  );
}
