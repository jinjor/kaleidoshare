import React, { useCallback } from "react";
import Nav from "../ui/Nav";
import SignupForm from "../ui/SignupForm";
import { MessageContext } from "../ui/MessageBar";
import { User } from "../../schema/user.mjs";
import { RoutingContext } from "../Routing";

export default function Signup(props: { user: User | null }) {
  const { user } = props;
  const routingContext = React.useContext(RoutingContext)!;
  const messageContext = React.useContext(MessageContext)!;
  const handleSuccess = useCallback(() => {
    routingContext.goTo("/", true);
  }, [routingContext]);

  if (user !== null) {
    routingContext.goTo("/", false);
    return null;
  }
  return (
    <>
      <Nav user={user}></Nav>
      <main className="horizontal-center">
        <div className="container horizontal-center">
          <SignupForm
            onSuccess={handleSuccess}
            onError={messageContext.setError}
          />
        </div>
      </main>
    </>
  );
}
