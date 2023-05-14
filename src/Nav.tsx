import React from "react";
import { User } from "./data/user";

export default function Nav(props: {
  user: User | null;
  children?: React.ReactNode;
}) {
  // TODO: feature flag 化
  if (location.origin !== "http://localhost:5173") {
    return <></>;
  }
  const { user, children } = props;
  return (
    <nav>
      <ul>
        <li>
          <a href="/">Home</a>
        </li>
        {children}
        {user ? (
          <>
            <li>{user.name}</li>
            <li>
              <a href="/logout">Logout</a>
            </li>
          </>
        ) : (
          <>
            <li>
              <a href="/signup">Signup</a>
            </li>
            <li>
              <a href="/login">Login</a>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}
