import {
  startRegistration,
  startAuthentication,
} from "@simplewebauthn/browser";

export async function register(name: string) {
  const res = await fetch("/api/credential/new", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });
  if (res.status >= 400) {
    const { message } = await res.json();
    alert(message); // TODO
    throw new Error("Failed"); // TODO: handle error
  }
  const registerOps = await res.json();
  console.log(registerOps);
  const attResp = await startRegistration(registerOps);
  console.log(attResp);

  const res2 = await fetch("/api/credential", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(attResp),
  });
  if (res2.status >= 400) {
    const { message } = await res2.json();
    alert(message); // TODO
    throw new Error("Failed"); // TODO: handle error
  }
}

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

export async function publish(
  userName: string,
  settings: any
): Promise<string> {
  // TODO: encode
  const res = await fetch(`/api/contents/${userName}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(settings),
  });
  if (res.status >= 400) {
    const { message } = await res.json();
    alert(message); // TODO
    throw new Error("Failed"); // TODO: handle error
  }
  const { id } = await res.json();
  return id;
}
