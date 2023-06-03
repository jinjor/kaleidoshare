import React from "react";
import { getContent } from "../domain/io";
import { User, Content } from "../../schema/schema.js";
import Nav from "../ui/Nav";
import Editor from "../ui/Editor";
import NotFound from "./NotFound";
import { MessageContext } from "../ui/MessageBar";

export default function ContentPage(props: {
  user: User | null;
  authorName: string;
  contentId: string;
  edit: boolean;
}) {
  const { user, authorName, contentId, edit } = props;
  const [content, setContent] = React.useState<Content | null | undefined>();
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
  return (
    <>
      <Nav user={user}></Nav>
      <main className="horizontal-center" style={{ flexGrow: 1 }}>
        <div className="container editor-wrapper">
          <Editor user={user} initiallyPreview={!edit} content={content} />
        </div>
      </main>
    </>
  );
}
