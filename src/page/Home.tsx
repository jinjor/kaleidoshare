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
      <div className="horizontal-center">
        <div
          className="container"
          style={{
            display: "flex",
            gap: 10,
            padding: 30,
            boxSizing: "border-box",
            fontSize: 12,
            color: "#999",
          }}
        >
          <div>Copyright © 2023-present @jinjor</div>
          <a href="https://github.com/jinjor/kaleidoshare">GitHub</a>
          <a href="https://twitter.com/kaleidoshare">Twitter</a>
        </div>
      </div>
    </>
  );
}
