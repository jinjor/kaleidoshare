import React, { useCallback } from "react";
import { User } from "../domain/io";
import Nav from "../ui/Nav";
import SignupForm from "../ui/SignupForm";
import { MessageContext } from "../ui/MessageBar";

export default function Signup(props: { user: User | null }) {
  const { user } = props;
  if (user !== null) {
    location.href = "/";
    return null;
  }
  const messageContext = React.useContext(MessageContext)!;
  const handleSuccess = useCallback(() => {
    location.href = "/";
  }, []);
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
