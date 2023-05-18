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

  const handleLogout = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const res = await fetch("/api/session", {
      method: "DELETE",
    });
    if (res.status >= 400) {
      const { message } = await res.json();
      alert(message); // TODO
      throw new Error("Failed"); // TODO: handle error
    }
    location.reload();
  };
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
              <button onClick={handleLogout}>Logout</button>
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
