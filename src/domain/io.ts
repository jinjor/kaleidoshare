import {
  startRegistration,
  startAuthentication,
} from "@simplewebauthn/browser";
import { Settings, Output, Content, User } from "../../schema/schema.js";
import { AppError } from "./error.js";

function encode(strings, ...params) {
  if (strings.length !== params.length + 1) {
    throw new Error("assertion error");
  }
  let s = "";
  for (const [i, str] of strings.entries()) {
    s += str;
    if (i < params.length) {
      s += encodeURIComponent(params[i]);
    }
  }
  return s;
}

async function request(
  input: RequestInfo | URL,
  init?: RequestInit | undefined
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, 10 * 1000);
  let res: Response;
  const headers = { ...init?.headers };
  init = { ...init, headers: { ...headers, kaleidoshare: "true" } };
  try {
    res = await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } catch (e) {
    if (controller.signal.aborted) {
      throw new AppError("Timeout");
    }
    throw new AppError("Network error");
  } finally {
    clearTimeout(timeout);
  }
  if (res.status >= 400) {
    const { message } = await res.json();
    throw new AppError(message);
  }
  return res;
}

export async function register(name: string): Promise<boolean> {
  const res = await request("/api/credential/new", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });
  const registerOps = await res.json();
  try {
    const attResp = await startRegistration(registerOps);
    await request("/api/credential", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(attResp),
    });
    return true;
  } catch (e) {
    // ユーザーがキャンセルしたかタイムアウトした時 NotAllowedError が発生する
    // 前者の場合は何もする必要がない
    // 後者の場合も画面にエラーが表示されるのでやはり何もする必要がない
    if (e.name === "NotAllowedError") {
      return false;
    }
    throw e;
  }
}

export async function addCredential(): Promise<boolean> {
  const res = await request("/api/credential/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const registerOps = await res.json();
  try {
    const attResp = await startRegistration(registerOps);
    await request("/api/credential", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(attResp),
    });
    return true;
  } catch (e) {
    // 上と同様
    if (e.name === "NotAllowedError") {
      return false;
    }
    throw e;
  }
}

export async function deleteAccount(): Promise<void> {
  await request("/api/user", {
    method: "DELETE",
  });
}

export async function login(): Promise<User | null> {
  const name = localStorage.getItem("test_user") ?? undefined;
  const res = await request("/api/session/new", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });
  const authenticateOps = await res.json();
  try {
    const authResp = await startAuthentication(authenticateOps);
    const res = await request("/api/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(authResp),
    });
    return res.json();
  } catch (e) {
    // 上と同様
    if (e.name === "NotAllowedError") {
      return null;
    }
    throw e;
  }
}

export async function logout(): Promise<void> {
  await request("/api/session", {
    method: "DELETE",
  });
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
  const res = await request(encode`/api/contents/${userName}`, {
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
  const res = await request(encode`/api/contents/${userName}/${contentId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return await res.json();
}

export async function createContent(
  userName: string,
  settings: Settings,
  output: Output,
  thumbnail: string,
  image: string
): Promise<string> {
  const res = await request(encode`/api/contents/${userName}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      settings,
      output,
      thumbnail,
      image,
    }),
  });
  const { id } = await res.json();
  return id;
}

export async function updateContent(
  userName: string,
  contentId: string,
  settings: Settings,
  output: Output,
  thumbnail: string,
  image: string
): Promise<void> {
  await request(encode`/api/contents/${userName}/${contentId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      settings,
      output,
      thumbnail,
      image,
    }),
  });
}
