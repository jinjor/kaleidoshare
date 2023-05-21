class CookieJar {
  private cookies = new Map<string, string>();
  read(headers: Headers) {
    this.cookies = new Map(
      (headers.get("set-cookie") ?? "")
        .split(",")
        .map((s) => s.split(";")[0])
        .map((s) => s.split("=") as [string, string])
    );
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
