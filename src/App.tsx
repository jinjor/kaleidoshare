import React, { useEffect } from "react";
import Content from "./page/Content";
import { getSession } from "./domain/io";
import NotFound from "./page/NotFound";
import Home from "./page/Home";
import Account from "./page/Account";
import { MessageContext, useMessage } from "./ui/MessageBar";
import { env } from "./domain/env";
import { User } from "../schema/schema.js";
import { RoutingContext, useSPARouting } from "./Routing";
import Gallery from "./page/Gallery";

type Route =
  | {
      type: "home";
    }
  | {
      type: "account";
    }
  | {
      type: "gallery";
      authorName: string;
    }
  | {
      type: "content";
      authorName: string;
      contentId: string;
      edit: boolean;
    };

function getRoute(pathname: string): Route | null {
  if (pathname === "/") {
    return { type: "home" };
  }
  if (pathname === "/account") {
    return { type: "account" };
  }
  {
    const match = pathname.match(/^\/contents\/([^\/]+)$/);
    if (match) {
      const [, authorName] = match;
      return { type: "gallery", authorName };
    }
  }
  {
    const match = pathname.match(/^\/contents\/([^\/]+)\/([^\/]+)$/);
    if (match) {
      const [, authorName, contentId] = match;
      return { type: "content", authorName, contentId, edit: true };
    }
  }
  {
    const match = pathname.match(/^\/contents\/([^\/]+)\/([^\/]+)\/show$/);
    if (match) {
      const [, authorName, contentId] = match;
      return { type: "content", authorName, contentId, edit: false };
    }
  }
  return null;
}

export default function App() {
  const initialRoute = getRoute(window.location.pathname);
  const [user, setUser] = React.useState<User | null | undefined>(undefined);
  const [route, setRoute] = React.useState<Route | null>(initialRoute);
  const [sessionKey, setSessionKey] = React.useState<number>(Date.now());
  const [navigationKey, setNavigationKey] = React.useState<number>(0);

  const messageContext = useMessage();
  const routingContext = useSPARouting((refreshSession) => {
    const route = getRoute(window.location.pathname);
    setRoute(route);
    if (refreshSession) {
      setSessionKey(Date.now());
    }
    setNavigationKey((key) => key + 1);
  });
  useEffect(() => {
    // TODO: 直す
    if (env.prod) {
      setUser(null);
    } else {
      getSession().then((user) => setUser(user));
    }
  }, [sessionKey]);
  useEffect(() => {
    const handler = (e) => {
      messageContext.setError(e.error ?? e.reason);
    };
    window.addEventListener("error", handler);
    window.addEventListener("unhandledrejection", handler);
    return () => {
      window.removeEventListener("error", handler);
      window.removeEventListener("unhandledrejection", handler);
    };
  }, [messageContext]);
  if (user === undefined) {
    return null;
  }
  return (
    <RoutingContext.Provider value={routingContext}>
      <MessageContext.Provider value={messageContext}>
        <div className="top" key={navigationKey}>
          {route?.type === "home" ? (
            <Home user={user} />
          ) : route?.type === "account" ? (
            <Account user={user} />
          ) : route?.type === "gallery" ? (
            <Gallery user={user} authorName={route.authorName} />
          ) : route?.type === "content" ? (
            <Content
              user={user}
              authorName={route.authorName}
              contentId={route.contentId}
              edit={route.edit}
            />
          ) : (
            <NotFound user={user} />
          )}
        </div>
      </MessageContext.Provider>
    </RoutingContext.Provider>
  );
}
