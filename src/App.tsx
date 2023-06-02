import React, { useEffect } from "react";
import Content from "./page/Content";
import { getSession } from "./domain/io";
import Signup from "./page/Signup";
import NotFound from "./page/NotFound";
import Home from "./page/Home";
import Account from "./page/Account";
import { MessageContext, useMessage } from "./ui/MessageBar";
import { env } from "./domain/env";
import { User } from "../schema/user.mjs";

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

const useSPARouting = (callback: () => void) => {
  useEffect(() => {
    const handlePopState = () => {
      callback();
    };
    const handleAnchorClick = (e: MouseEvent) => {
      let target: EventTarget | null = e.target;
      while (true) {
        if (target instanceof HTMLAnchorElement) {
          break;
        }
        if (!(target instanceof HTMLElement)) {
          return;
        }
        const parent = target.parentElement;
        if (parent === target) {
          return;
        }
        target = parent;
      }
      const href = target.getAttribute("href");
      if (href?.startsWith("/") && target.target !== "_blank") {
        e.preventDefault();
        window.history.pushState(null, "", href);
        handlePopState();
      }
    };
    window.addEventListener("popstate", handlePopState);
    document.addEventListener("click", handleAnchorClick, true);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      document.removeEventListener("click", handleAnchorClick);
    };
  }, []);
};

export default function App() {
  const initialRoute = getRoute(window.location.pathname);
  const [user, setUser] = React.useState<User | null | undefined>(undefined);
  const [route, setRoute] = React.useState<Route | null>(initialRoute);

  const messageContext = useMessage();
  useSPARouting(() => {
    const route = getRoute(window.location.pathname);
    setRoute(route);
  });
  useEffect(() => {
    // TODO: 直す
    if (env.prod) {
      setUser(null);
    } else {
      getSession()
        .then((user) => setUser(user))
        .catch(messageContext.setError);
    }
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
