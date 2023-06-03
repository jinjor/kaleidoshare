import React from "react";
import { login, logout } from "../domain/io";
import { env } from "../domain/env";
import ErrorBar, { MessageContext } from "./MessageBar";
import { User } from "../../schema/user.mjs";

export default function Nav(props: {
  user: User | null;
  children?: React.ReactNode;
}) {
  const { user, children } = props;

  const messageContext = React.useContext(MessageContext)!;

  const handleLogin = async (event: React.FormEvent<HTMLButtonElement>) => {
    event.preventDefault();
    try {
      const done = await login();
      if (done) {
        location.reload();
      }
    } catch (e) {
      messageContext.setError(e);
    }
  };
  const handleLogout = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    try {
      await logout();
      location.reload();
    } catch (e) {
      messageContext.setError(e);
    }
  };
  return (
    <>
      <nav className="horizontal-center">
        <div className="container nav-contents">
          <a className="nav-brand" href="/">
            <img
              src="/icon.svg"
              width="30"
              height="30"
              style={{ marginRight: 10 }}
            />
            <img src="/logo.png" width={200} />
          </a>
          <ul>
            {children}
            {env.prod ? (
              <></>
            ) : user ? (
              <>
                <li>
                  <a href="/account">{user.name}</a>
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
      <ErrorBar />
    </>
  );
}
