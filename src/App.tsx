import React, { useEffect } from "react";
import Content from "./Content";
import { User } from "./data/user";
import Signup from "./Signup";
import NotFound from "./NotFound";
import Home from "./Home";
import Account from "./Account";

type Route =
  | {
      type: "home";
    }
  | {
      type: "signup";
    }
  | {
      type: "account";
    }
  | {
      type: "content";
      authorName: string;
      contentName: string;
    };

function getRoute(pathname: string): Route | null {
  if (pathname === "/") {
    return { type: "home" };
  }
  if (pathname === "/signup") {
    return { type: "signup" };
  }
  if (pathname === "/account") {
    return { type: "account" };
  }
  const match = pathname.match(/^\/content\/([^\/]+)\/([^\/]+)$/);
  if (match) {
    const [, authorName, contentName] = match;
    return { type: "content", authorName, contentName };
  }
  return null;
}

export default function App() {
  const route = getRoute(window.location.pathname);
  const [user, setUser] = React.useState<User | null>(null);

  useEffect(() => {
    fetch("/api/session")
      .then((res) => {
        if (res.status === 401) {
          return null;
        }
        if (res.status >= 400) {
          throw new Error("Failed to fetch user"); // TODO: handle error
        }
        return res.json();
      })
      .then((user) => setUser(user));
  }, []);
  return (
    <>
      {route?.type === "home" ? (
        <Home user={user} />
      ) : route?.type === "signup" ? (
        <Signup user={user} />
      ) : route?.type === "account" ? (
        <Account user={user} />
      ) : route?.type === "content" ? (
        <Content
          user={user}
          authorName={route.authorName}
          contentName={route.contentName}
        />
      ) : (
        <NotFound user={user} />
      )}
    </>
  );
}
