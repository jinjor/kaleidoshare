import React from "react";
import { getContent } from "../domain/io";
import { User, Content } from "../../schema/schema.js";
import Nav from "../ui/Nav";
import Editor from "../ui/Editor";
import NotFound from "../ui/NotFound";

export default function ContentPage(props: {
  user: User | null;
  authorName: string;
  contentId: string;
  edit: boolean;
}) {
  const { user, authorName, contentId, edit } = props;
  const [content, setContent] = React.useState<Content | null | undefined>();

  React.useEffect(() => {
    getContent(authorName, contentId).then((content) => {
      setContent(content);
    });
  }, [authorName, contentId]);
  return (
    <>
      <Nav user={user}></Nav>
      {content === undefined ? null : content === null ? (
        <NotFound />
      ) : (
        <main className="horizontal-center" style={{ flexGrow: 1 }}>
          <div className="container editor-wrapper">
            <Editor user={user} initiallyPreview={!edit} content={content} />
          </div>
        </main>
      )}
    </>
  );
}
