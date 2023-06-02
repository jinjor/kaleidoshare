import React from "react";
import Nav from "../ui/Nav";
import Editor from "../ui/Editor";
import { User } from "../../schema/user.mjs";

export default function Home(props: { user: User | null }) {
  const { user } = props;
  return (
    <>
      <Nav user={user}></Nav>
      <main className="horizontal-center" style={{ flexGrow: 1 }}>
        <div className="container editor-wrapper">
          <Editor user={user} initiallyPreview={false} authorName={null} />
        </div>
      </main>
    </>
  );
}
