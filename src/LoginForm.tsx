import React from "react";
import { startAuthentication } from "@simplewebauthn/browser";

async function login(name: string) {
  const res3 = await fetch("/api/session/new", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });
  if (res3.status >= 400) {
    const { message } = await res3.json();
    alert(message); // TODO
    throw new Error("Failed"); // TODO: handle error
  }
  const authenticateOps = await res3.json();
  console.log(authenticateOps);
  const authResp = await startAuthentication(authenticateOps);
  console.log(authResp);

  const res4 = await fetch("/api/session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(authResp),
  });
  if (res4.status >= 400) {
    const { message } = await res4.json();
    alert(message); // TODO
    throw new Error("Failed"); // TODO: handle error
  }
  location.href = "/";
}

export default function LoginForm(props: { redirect: string }) {
  const { redirect } = props;
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    await login(data.get("name") as string);
    location.href = redirect;
  };
  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <label>
          <span>Name</span>
          <input
            type="text"
            name="name"
            minLength={1}
            maxLength={39}
            // GitHub と同じルール
            pattern="^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$"
          />
        </label>
        <input type="submit" value="Submit" />
      </form>
    </div>
  );
}
