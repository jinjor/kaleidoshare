import React from "react";
import { Content, User } from "../../schema/schema.js";
import Nav from "../ui/Nav";
import Gallery from "../ui/Gallery";
import { getContents } from "../domain/io.js";
import NotFound from "../ui/NotFound";
import Footer from "../ui/Footer.js";

export default function GalleryPage(props: {
  user: User | null | undefined;
  authorName: string;
}) {
  const { user, authorName } = props;

  const [contents, setContents] = React.useState<
    Content[] | undefined | null
  >();

  React.useEffect(() => {
    getContents(authorName).then((contents) => {
      setContents(contents);
    });
  }, [authorName]);
  if (user === undefined) {
    return null;
  }
  return (
    <>
      <Nav user={user}></Nav>
      {contents === undefined ? null : contents === null ? (
        <NotFound />
      ) : (
        <main className="horizontal-center" style={{ flexGrow: 1 }}>
          <div className="container">
            <Gallery authorName={authorName} contents={contents} />
          </div>
        </main>
      )}
      <Footer />
    </>
  );
}
