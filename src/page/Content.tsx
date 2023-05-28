import React from "react";
import { User, getContent } from "../domain/io";
import Nav from "../ui/Nav";
import Editor from "../ui/Editor";
import { Settings } from "../domain/settings";
import NotFound from "./NotFound";
import { MessageContext } from "../ui/MessageBar";

export default function Content(props: {
  user: User | null;
  authorName: string;
  contentId: string;
}) {
  const { user, authorName, contentId } = props;
  const [preview, setPreview] = React.useState(true);
  const [content, setContent] = React.useState<
    { settings: Settings } | null | undefined
  >(undefined);
  const isSelf = user?.name === authorName;
  const handleQuitPreview = React.useCallback(() => setPreview(false), []);

  const messageContext = React.useContext(MessageContext)!;

  React.useEffect(() => {
    getContent(authorName, contentId)
      .then((content) => {
        setContent(content);
      })
      .catch(messageContext.setError);
  }, [authorName, contentId]);

  if (content === undefined) {
    return null;
  }
  if (content === null) {
    // TODO
    return <NotFound user={user} />;
  }

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
      <main className="horizontal-center">
        <div className="container">
          <Editor
            user={user}
            preview={preview}
            onQuitPreview={handleQuitPreview}
            settings={content.settings}
          />
        </div>
      </main>
    </>
  );
}
