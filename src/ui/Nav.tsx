import React from "react";
import { User } from "../domain/user";
import { login } from "../domain/login";

export default function Nav(props: {
  user: User | null;
  children?: React.ReactNode;
}) {
  // TODO: feature flag 化
  if (location.origin !== "http://localhost:5173") {
    return <></>;
  }
  const { user, children } = props;

  const handleLogin = async (event: React.FormEvent<HTMLButtonElement>) => {
    event.preventDefault();
    await login();
    location.reload();
  };
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
    <nav className="horizontal-center">
      <div className="container nav-contents">
        <a className="nav-brand" href="/">
          <img src="/logo.png" width={200} />
        </a>
        <ul>
          {children}
          {user ? (
            <>
              <li>{user.name}</li>
              <li>
                <a href="/account">Account</a>
              </li>
              <li>
                <button className="button" onClick={handleLogout}>
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <button className="button" onClick={handleLogin}>
                  Login
                </button>
              </li>
              <li>
                <a className="button primary" href="/signup">
                  Signup
                </a>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}
