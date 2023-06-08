export type Env = {
  prod: boolean;
  os: "mac" | "other";
  mobile: boolean;
};
export const env: Env = {
  prod: !["http://localhost:5173", "http://localhost:4173"].includes(
    location.origin
  ),
  os: navigator.userAgent.toLowerCase().includes("mac") ? "mac" : "other",
  mobile: "ontouchstart" in document.documentElement,
};
