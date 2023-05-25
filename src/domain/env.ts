export type Env = {
  prod: Boolean;
};
export const env: Env = {
  prod: location.origin !== "http://localhost:5173",
};
