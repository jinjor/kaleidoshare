import React from "react";
import { User } from "./data/user";
import Nav from "./Nav";
import LoginForm from "./LoginForm";

export default function Login(props: { user: User | null }) {
  const { user } = props;
  return (
    <>
      <Nav user={user}></Nav>
      <LoginForm redirect="/" />
    </>
  );
}
