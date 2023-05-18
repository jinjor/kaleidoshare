import React from "react";
import { User } from "./data/user";
import Nav from "./Nav";
import { startRegistration } from "@simplewebauthn/browser";

async function addCredential() {
  const res = await fetch("/api/credential/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
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

export default function Account(props: { user: User | null }) {
  const { user } = props;
  if (user == null) {
    // TODO: ログインして戻ってくる
    return (
      <>
        <Nav user={user}></Nav>
        <h1>Account</h1>
        <p>Please login</p>
      </>
    );
  }

  const handleAddCredential = async (
    event: React.FormEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    await addCredential();
  };

  const handleDeleteAccount = async (
    event: React.FormEvent<HTMLButtonElement>
  ) => {
    // TODO: confirm
    event.preventDefault();
    const res = await fetch("/api/user", {
      method: "DELETE",
    });
    if (res.status >= 400) {
      const { message } = await res.json();
      alert(message); // TODO
      throw new Error("Failed"); // TODO: handle error
    }
    location.href = "/";
  };

  return (
    <>
      <Nav user={user}></Nav>
      <h1>Account</h1>
      <li>
        <button onClick={handleAddCredential}>Add credential</button>
      </li>
      <li>
        <button onClick={handleDeleteAccount}>Delete account</button>
      </li>
    </>
  );
}
