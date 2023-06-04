import React from "react";
import Nav from "../ui/Nav";
import { addCredential, deleteAccount } from "../domain/io";
import { MessageContext } from "../ui/MessageBar";
import { User } from "../../schema/schema.js";
import { RoutingContext } from "../Routing";

export default function Account(props: { user: User | null }) {
  const { user } = props;

  const routingContext = React.useContext(RoutingContext)!;
  const messageContext = React.useContext(MessageContext)!;

  const handleAddCredential = async (
    event: React.FormEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    try {
      const done = await addCredential();
      if (done) {
        messageContext.setMessage("Credential added");
      }
    } catch (e) {
      messageContext.setError(e);
    }
  };

  const handleDeleteAccount = async (
    event: React.FormEvent<HTMLButtonElement>
  ) => {
    // TODO: confirm
    event.preventDefault();
    try {
      await deleteAccount();
      messageContext.setMessage("Account deleted");
      routingContext.goTo("/", true);
    } catch (e) {
      messageContext.setError(e);
    }
  };

  if (user == null) {
    routingContext.goTo("/", false);
    return null;
  }
  return (
    <>
      <Nav user={user}></Nav>
      <main className="horizontal-center">
        <div className="container horizontal-center">
          <div className="form">
            <h1 className="form-title">Account</h1>
            <button className="button wide" onClick={handleAddCredential}>
              Add credential
            </button>
            <hr></hr>
            <h1 className="form-title">Danger Zone</h1>
            <button
              className="button wide danger"
              onClick={handleDeleteAccount}
            >
              Delete account
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
