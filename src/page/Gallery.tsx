import React from "react";
import { getContents } from "../domain/io";
import { User, Content } from "../../schema/schema.js";
import Nav from "../ui/Nav";

export default function Gallery(props: {
  user: User | null;
  authorName: string;
}) {
  const { user, authorName } = props;
  const [contents, setContents] = React.useState<Content[] | undefined>();

  React.useEffect(() => {
    getContents(authorName).then((contents) => {
      setContents(contents);
    });
  }, [authorName]);

  if (contents === undefined) {
    return null;
  }
  return (
    <>
      <Nav user={user}></Nav>
      <main className="horizontal-center" style={{ flexGrow: 1 }}>
        <div className="container">
          {contents.map((content) => (
            <div key={content.id}>
              <img src={content.image} />
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
