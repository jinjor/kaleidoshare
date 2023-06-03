import React from "react";
import Nav from "../ui/Nav";
import { User } from "../../schema/schema.js";

export default function NotFound(props: { user: User | null }) {
  const { user } = props;
  return (
    <>
      <Nav user={user}></Nav>
      <main className="horizontal-center">
        <div className="container horizontal-center">
          <div className="form">
            <h1 className="form-title">Not Found</h1>
            <p>The page you are looking for does not exist.</p>
          </div>
        </div>
      </main>
    </>
  );
}
