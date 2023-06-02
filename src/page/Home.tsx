import React from "react";
import Nav from "../ui/Nav";
import Editor from "../ui/Editor";
import { User } from "../../schema/user.mjs";

export default function Home(props: { user: User | null }) {
  const { user } = props;
  const [preview, setPreview] = React.useState(false);
  const handleQuitPreview = React.useCallback(() => setPreview(false), []);
  return (
    <>
      <Nav user={user}>
        {preview ? (
          <li>
            <a onClick={() => setPreview(false)}>Edit</a>
          </li>
        ) : (
          <li>
            <a onClick={() => setPreview(true)}>Preview</a>
          </li>
        )}
      </Nav>
      <main className="horizontal-center" style={{ flexGrow: 1 }}>
        <div className="container editor-wrapper">
          <Editor
            user={user}
            preview={preview}
            onQuitPreview={handleQuitPreview}
          />
        </div>
      </main>
    </>
  );
}
