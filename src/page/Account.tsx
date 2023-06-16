import React from "react";
import Nav from "../ui/Nav";
import { addCredential, deleteAccount, getContents } from "../domain/io";
import { MessageContext } from "../ui/MessageBar";
import { Content, User } from "../../schema/schema.js";
import { RoutingContext } from "../Routing";
import ConfirmDeleteAccount from "../ui/ConfirmDeleteAccount";
import Gallery from "../ui/Gallery";
import Footer from "../ui/Footer";

export default function Account(props: { user: User | null | undefined }) {
  const { user } = props;

  const routingContext = React.useContext(RoutingContext)!;
  const messageContext = React.useContext(MessageContext)!;
  const [popupId, setPopupId] = React.useState<number | null>(null);
  const [contents, setContents] = React.useState<
    Content[] | undefined | null
  >();
  React.useEffect(() => {
    if (user == null) {
      return;
    }
    getContents(user.name).then((contents) => {
      setContents(contents);
    });
  }, [user]);
  const handleAddCredential = async (
    event: React.FormEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    const done = await addCredential();
    if (done) {
      messageContext.setMessage("Credential added");
    }
  };
  const handleDeleteAccount = async () => {
    await deleteAccount();
    messageContext.setMessage("Account deleted");
    routingContext.goTo("/", true);
  };
  const handleBeginDeleteAccount = (
    event: React.FormEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    setPopupId(Date.now());
  };
  const handleCancelDeleteAccount = () => {
    setPopupId(null);
  };
  if (user === undefined) {
    return null;
  }
  if (user == null) {
    routingContext.goTo("/", false);
    return null;
  }
  return (
    <>
      <Nav user={user}></Nav>
      {contents && (
        <main className="horizontal-center">
          <div className="container">
            <Gallery authorName={user.name} contents={contents} />
            <div className="horizontal-center" style={{ marginTop: 10 }}>
              <div className="form">
                <h1 className="form-title">Account</h1>
                <button className="button wide" onClick={handleAddCredential}>
                  Add credential
                </button>
                <hr></hr>
                <h1 className="form-title">Danger Zone</h1>
                <button
                  className="button wide danger"
                  onClick={handleBeginDeleteAccount}
                >
                  Delete account
                </button>
              </div>
            </div>
          </div>
        </main>
      )}
      <ConfirmDeleteAccount
        id={popupId}
        onConfirm={handleDeleteAccount}
        onCancel={handleCancelDeleteAccount}
      />
      <Footer />
    </>
  );
}
