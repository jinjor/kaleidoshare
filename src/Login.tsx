import React from "react";
import { User } from "./data/user";
import Nav from "./Nav";

export default function Login(props: { user: User | null }) {
  const { user } = props;
  return (
    <>
      <Nav user={user}></Nav>
      <h1>Login</h1>
    </>
  );
}
