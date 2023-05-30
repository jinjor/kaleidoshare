import {
  startRegistration,
  startAuthentication,
} from "@simplewebauthn/browser";
import { Settings } from "./settings";
import { Output } from "./output";

async function request(
  input: RequestInfo | URL,
  init?: RequestInit | undefined
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, 10 * 1000);
  let res: Response;
  try {
    res = await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } catch (e) {
    if (controller.signal.aborted) {
      throw new Error("Timeout");
    }
    throw new Error(e.message);
  } finally {
    clearTimeout(timeout);
  }
  if (res.status >= 400) {
    const { message } = await res.json();
    throw new Error(message);
  }
  return res;
}

export async function register(name: string) {
  const res = await request("/api/credential/new", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });
  const registerOps = await res.json();
  const attResp = await startRegistration(registerOps);
  await request("/api/credential", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(attResp),
  });
}

export async function addCredential() {
  const res = await request("/api/credential/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const registerOps = await res.json();
  const attResp = await startRegistration(registerOps);
  await fetch("/api/credential", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(attResp),
  });
}

export async function deleteAccount() {
  await fetch("/api/user", {
    method: "DELETE",
  });
}

export async function login() {
  const res = await request("/api/session/new", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const authenticateOps = await res.json();
  const authResp = await startAuthentication(authenticateOps);
  await fetch("/api/session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(authResp),
  });
}

export async function logout() {
  await request("/api/session", {
    method: "DELETE",
  });
}

export async function publish(
  userName: string,
  settings: Settings,
  output: Output
): Promise<string> {
  // TODO: encode
  const res = await request(`/api/contents/${userName}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      settings,
      output,
    }),
  });
  const { id } = await res.json();
  return id;
}

export async function getSession(): Promise<User | null> {
  const res = await request("/api/session", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return await res.json();
}

export async function getContents(userName: string): Promise<Content[]> {
  const res = await request(`/api/contents/${userName}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return await res.json();
}

export async function getContent(
  userName: string,
  contentId: string
): Promise<Content | null> {
  const res = await request(`/api/contents/${userName}/${contentId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return await res.json();
}

export type User = {
  name: string;
};
export type Content = {
  id: string;
  settings: Settings;
  output: Output;
};
