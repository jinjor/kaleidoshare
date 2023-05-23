import React from "react";
import { startRegistration } from "@simplewebauthn/browser";

async function register(name: string) {
  const res = await fetch("/api/credential/new", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });
  if (res.status >= 400) {
    const { message } = await res.json();
    alert(message); // TODO
    throw new Error("Failed"); // TODO: handle error
  }
  const registerOps = await res.json();
  console.log(registerOps);
  const attResp = await startRegistration(registerOps);
  console.log(attResp);

  const res2 = await fetch("/api/credential", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(attResp),
  });
  if (res2.status >= 400) {
    const { message } = await res2.json();
    alert(message); // TODO
    throw new Error("Failed"); // TODO: handle error
  }
  alert("ok"); // TODO
}

export default function SignupForm(props: { redirect: string }) {
  const { redirect } = props;
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    await register(data.get("name") as string);
    location.href = redirect;
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
