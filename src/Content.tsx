import React from "react";
import { User } from "./data/user";
import Nav from "./Nav";
import Editor from "./Editor";

export default function Content(props: {
  user: User | null;
  authorName: string;
  contentName: string;
}) {
  const { user, authorName, contentName } = props;
  const [preview, setPreview] = React.useState(true);
  const [config, setConfig] = React.useState({});
  const isSelf = user?.name === authorName;

  React.useEffect(() => {
    fetch(`/api/config/${authorName}/${contentName}`)
      .then((res) => res.json())
      .then((config) => setConfig(config));
    // TODO: error
  }, [authorName, contentName]);

  // TODO: loading
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
        {isSelf && !preview && (
          <li>
            <span>Save</span>
          </li>
        )}
      </Nav>
      <Editor preview={preview} />
    </>
  );
}
