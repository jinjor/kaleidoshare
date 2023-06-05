import { createContext, useEffect } from "react";

type RoutingContext = {
  goTo: (href: string, refreshSession: boolean) => void;
  changeUrl: (href: string) => void;
  refreshSession: () => void;
};

export const RoutingContext = createContext<RoutingContext | null>(null);

export function useSPARouting(
  callback: (refreshSession: boolean) => void
): RoutingContext {
  const goTo = (href: string, refreshSession: boolean) => {
    window.history.pushState(null, "", href);
    callback(refreshSession);
  };
  const changeUrl = (href: string) => {
    window.history.replaceState(null, "", href);
  };
  const refreshSession = () => {
    callback(true);
  };
  useEffect(() => {
    const handlePopState = () => {
      callback(false);
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
        goTo(href, false);
      }
    };
    window.addEventListener("popstate", handlePopState);
    document.addEventListener("click", handleAnchorClick, true);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      document.removeEventListener("click", handleAnchorClick, true);
    };
  }, []);
  return { goTo, changeUrl, refreshSession };
}
