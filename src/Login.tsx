import React from "react";
import { User } from "./data/user";
import Nav from "./Nav";
import { startAuthentication } from "@simplewebauthn/browser";

export default function Login(props: { user: User | null }) {
  const { user } = props;

  async function login() {
    const res3 = await fetch("/api/session/new", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: "test4" }),
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
    setTimeout(() => {
      location.href = "/";
    }, 1000);
  }

  return (
    <>
      <Nav user={user}></Nav>
      <h1>Login</h1>
      <button onClick={login}>Login</button>
    </>
  );
}
