class CookieJar {
  private cookies = new Map<string, string>();
  read(headers: any) {
    const entries = headers.getSetCookie() as string[];
    this.cookies = new Map();
    for (const entry of entries) {
      const [k, v] = entry.split(";")[0].split("=");
      if (entry.includes("1970 00:00:00 GMT")) {
        this.cookies.delete(k);
      } else {
        this.cookies.set(k, v);
      }
    }
  }
  write(headers: HeadersInit): HeadersInit {
    return {
      ...headers,
      cookie: [...this.cookies.entries()]
        .map(([k, v]) => `${k}=${v}`)
        .join(";"),
    };
  }
}

export function createClient() {
  const cookieJar = new CookieJar();
  return async (input: RequestInfo, init?: RequestInit): Promise<Response> => {
    const headers = cookieJar.write(init?.headers ?? {});
    const res = await fetch(input, { ...init, headers });
    cookieJar.read(res.headers);
    return res;
  };
}
