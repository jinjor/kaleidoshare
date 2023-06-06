import React from "react";
import { User } from "../../schema/schema.js";
import Nav from "../ui/Nav";
import Gallery from "../ui/Gallery";

export default function GalleryPage(props: {
  user: User | null;
  authorName: string;
}) {
  const { user, authorName } = props;
  return (
    <>
      <Nav user={user}></Nav>
      <main className="horizontal-center" style={{ flexGrow: 1 }}>
        <div className="container">
          <Gallery authorName={authorName} />
        </div>
      </main>
    </>
  );
}
