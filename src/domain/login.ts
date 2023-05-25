import { startAuthentication } from "@simplewebauthn/browser";

export async function login() {
  const res = await fetch("/api/session/new", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (res.status >= 400) {
    const { message } = await res.json();
    alert(message); // TODO
    throw new Error("Failed"); // TODO: handle error
  }
  const authenticateOps = await res.json();
  console.log(authenticateOps);
  const authResp = await startAuthentication(authenticateOps);
  console.log(authResp);

  const res2 = await fetch("/api/session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(authResp),
  });
  if (res2.status >= 400) {
    const { message } = await res2.json();
    alert(message); // TODO
    throw new Error("Failed"); // TODO: handle error
  }
}
