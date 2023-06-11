export type Env = {
  os: "mac" | "other";
  mobile: boolean;
};
export const env: Env = {
  os: navigator.userAgent.toLowerCase().includes("mac") ? "mac" : "other",
  mobile: "ontouchstart" in document.documentElement,
};
