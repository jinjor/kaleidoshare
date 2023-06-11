import React from "react";
import { login, logout } from "../domain/io";
import { env } from "../domain/env";
import MessageBar, { MessageContext } from "./MessageBar";
import { User } from "../../schema/schema.js";
import { RoutingContext } from "../Routing";
import SignupForm from "./SignupForm";

export default function Nav(props: { user: User | null }) {
  const { user } = props;

  const routingContext = React.useContext(RoutingContext)!;
  const messageContext = React.useContext(MessageContext)!;
  const [signupFormId, setSignupFormId] = React.useState<number | null>(null);

  const handleSignup = async (event: React.FormEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setSignupFormId(Date.now());
  };
  const handleSignupSuccess = async (_userName: string, isLogin: boolean) => {
    setSignupFormId(null);
    messageContext.setMessage(isLogin ? "Hello" : "Welcome");
    routingContext.refreshSession();
  };
  const handleSignupFailure = async (error: any) => {
    setSignupFormId(null);
    messageContext.setError(error);
  };
  const handleSignupCancel = async () => {
    setSignupFormId(null);
  };
  const handleLogin = async (event: React.FormEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const done = await login();
    if (done) {
      messageContext.setMessage("Hello");
      routingContext.refreshSession();
    }
  };
  const handleLogout = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    await logout();
    messageContext.setMessage("Bye");
    routingContext.refreshSession();
  };
  return (
    <>
      <nav className="horizontal-center">
        <div className="container nav-contents">
          <a className="nav-brand" href="/">
            <img
              src="/icon.svg"
              width="26"
              height="26"
              style={{ marginRight: 10 }}
            />
            <img src="/logo.png" width={160} />
          </a>
          <ul>
            {user ? (
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
                  <button className="button primary" onClick={handleSignup}>
                    Signup
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </nav>
      <MessageBar />
      <SignupForm
        id={signupFormId}
        onSuccess={handleSignupSuccess}
        onError={handleSignupFailure}
        onCancel={handleSignupCancel}
      />
    </>
  );
}
