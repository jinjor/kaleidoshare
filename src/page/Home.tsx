import React from "react";
import Nav from "../ui/Nav";
import Editor from "../ui/Editor";
import { User } from "../../schema/schema.js";

export default function Home(props: { user: User | null | undefined }) {
  const { user } = props;
  if (user === undefined) {
    return null;
  }
  return (
    <>
      <Nav user={user}></Nav>
      <main className="horizontal-center" style={{ flexGrow: 1 }}>
        <div className="container editor-wrapper">
          <Editor user={user} initiallyPreview={false} content={null} />
        </div>
      </main>
    </>
  );
}
