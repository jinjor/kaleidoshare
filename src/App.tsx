import React, { useEffect } from "react";
import Content from "./page/Content";
import { User, getSession } from "./domain/io";
import Signup from "./page/Signup";
import NotFound from "./page/NotFound";
import Home from "./page/Home";
import Account from "./page/Account";
import { MessageContext, useMessage } from "./ui/MessageBar";

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
      contentId: string;
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
  const match = pathname.match(/^\/contents\/([^\/]+)\/([^\/]+)$/);
  if (match) {
    const [, authorName, contentId] = match;
    return { type: "content", authorName, contentId };
  }
  return null;
}

export default function App() {
  const route = getRoute(window.location.pathname);
  const [user, setUser] = React.useState<User | null | undefined>(undefined);

  const messageContext = useMessage();
  useEffect(() => {
    getSession()
      .then((user) => setUser(user))
      .catch(messageContext.setError);
  }, []);
  if (user === undefined) {
    return null;
  }
  return (
    <MessageContext.Provider value={messageContext}>
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
          contentId={route.contentId}
        />
      ) : (
        <NotFound user={user} />
      )}
    </MessageContext.Provider>
  );
}
