export type Env = {
  prod: Boolean;
  os: "mac" | "other";
};
export const env: Env = {
  prod: location.origin !== "http://localhost:5173",
  os: navigator.userAgent.toLowerCase().includes("mac") ? "mac" : "other",
};
