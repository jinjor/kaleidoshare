import React from "react";
import { login, logout } from "../domain/io";
import { env } from "../domain/env";
import ErrorBar, { MessageContext } from "./MessageBar";
import { User } from "../../schema/schema.js";
import { RoutingContext } from "../Routing";
import SignupForm from "./SignupForm";

export default function Nav(props: { user: User | null }) {
  const { user } = props;

  const routingContext = React.useContext(RoutingContext)!;
  const messageContext = React.useContext(MessageContext)!;
  const [formKey, setFormKey] = React.useState(0);

  const handleSignup = async (event: React.FormEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setFormKey(Date.now());
  };
  const handleSignupSuccess = async (userName: string) => {
    setFormKey(0);
    routingContext.goTo(location.pathname, true);
  };
  const handleSignupFailure = async (error: any) => {
    setFormKey(0);
    messageContext.setError(error);
  };
  const handleSignupCancel = async () => {
    setFormKey(0);
  };

  const handleLogin = async (event: React.FormEvent<HTMLButtonElement>) => {
    event.preventDefault();
    try {
      const done = await login();
      if (done) {
        routingContext.goTo(location.pathname, true);
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
              width="26"
              height="26"
              style={{ marginRight: 10 }}
            />
            <img src="/logo.png" width={160} />
          </a>
          <ul>
            {env.prod ? null : user ? (
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
      <ErrorBar />
      {formKey > 0 && (
        <SignupForm
          key={formKey}
          onSuccess={handleSignupSuccess}
          onError={handleSignupFailure}
          onCancel={handleSignupCancel}
        />
      )}
    </>
  );
}
