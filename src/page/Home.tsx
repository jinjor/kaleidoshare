import React from "react";
import { User } from "../domain/user";
import Nav from "../ui/Nav";
import Editor from "../ui/Editor";

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
      <div className="horizontal-center">
        <div className="container">
          <Editor preview={preview} onQuitPreview={handleQuitPreview} />
        </div>
      </div>
    </>
  );
}
