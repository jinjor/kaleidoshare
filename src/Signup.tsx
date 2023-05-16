import React from "react";
import { User } from "./data/user";
import Nav from "./Nav";
import { startRegistration } from "@simplewebauthn/browser";

export default function Signup(props: { user: User | null }) {
  const { user } = props;

  async function register() {
    const res = await fetch("/api/credential/new", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: "test4" }),
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
  return (
    <>
      <Nav user={user}></Nav>
      <h1>Signup</h1>
      <button onClick={register}>Register</button>
    </>
  );
}
