import React from "react";
import { User } from "./data/user";
import Nav from "./Nav";
import SignupForm from "./SignupForm";

export default function Signup(props: { user: User | null }) {
  const { user } = props;
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
