import React from "react";
import { User } from "../domain/user";
import Nav from "../ui/Nav";
import SignupForm from "../ui/SignupForm";

export default function Signup(props: { user: User | null }) {
  const { user } = props;
  if (user !== null) {
    location.href = "/";
    return null;
  }
  return (
    <>
      <Nav user={user}></Nav>
      <div className="horizontal-center">
        <div className="container horizontal-center">
          <SignupForm redirect="/" />
        </div>
      </div>
    </>
  );
}
