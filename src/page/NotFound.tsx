import React from "react";
import Nav from "../ui/Nav";
import { User } from "../../schema/schema.js";
import NotFoundBody from "../ui/NotFound";
import Footer from "../ui/Footer";

export default function NotFound(props: { user: User | null | undefined }) {
  const { user } = props;
  return (
    <>
      <Nav user={user}></Nav>
      <NotFoundBody />
      <Footer />
    </>
  );
}
