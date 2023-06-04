export type Env = {
  prod: boolean;
  os: "mac" | "other";
  mobile: boolean;
};
export const env: Env = {
  prod: location.origin !== "http://localhost:5173",
  os: navigator.userAgent.toLowerCase().includes("mac") ? "mac" : "other",
  mobile: "ontouchstart" in document.documentElement,
};
