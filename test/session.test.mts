import { test, before, after } from "node:test";
import * as assert from "assert";
import * as childProcess from "child_process";
import { createClient } from "./util.mjs";

test("session", async (t) => {
  const origin = "http://localhost:8000";
  let p: childProcess.ChildProcess;
  before(async () => {
    p = childProcess.spawn("deno", ["run", "-A", "--unstable", "server.ts"], {
      env: { ...process.env, CHALLENGE: "test" },
      stdio: "inherit",
    });
    for (const _ of Array(1000).keys()) {
      try {
        await fetch(origin);
        break;
      } catch (e) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        continue;
      }
    }
  });
  after(() => {
    p.kill();
  });
  const fetch = createClient();
  await t.test("guest", async () => {
    const res = await fetch(origin + "/api/session");
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body, null);
  });
  await t.test("signup", async (t) => {
    const userName = "test";
    await t.test("request registration", async (t) => {
      const res = await fetch(origin + "/api/credential/new", {
        method: "POST",
        body: JSON.stringify({ name: userName }),
      });
      assert.strictEqual(res.status, 200);
      await res.json();
    });
    await t.test("verify response", async (t) => {
      // challenge = "test", user = "test" で生成した実際のデータ
      const response = {
        id: "anynpsaHhnUBtQKsoPJ1D6wGNcw",
        rawId: "anynpsaHhnUBtQKsoPJ1D6wGNcw",
        response: {
          attestationObject:
            "o2NmbXRkbm9uZWdhdHRTdG10oGhhdXRoRGF0YViYSZYN5YgOjGh0NBcPZHZgW4_krrmihjLHmVzzuoMdl2NdAAAAAAAAAAAAAAAAAAAAAAAAAAAAFGp8p6bGh4Z1AbUCrKDydQ-sBjXMpQECAyYgASFYIIawOn3tVwgWAX6IE-ynWytsnS1r9SydV9gXoAZKSasxIlggZpOsJ2Cx0pNT-WrI1GUytyKqSGoAIvbomCw43msMa8k",
          clientDataJSON:
            "eyJ0eXBlIjoid2ViYXV0aG4uY3JlYXRlIiwiY2hhbGxlbmdlIjoiZEdWemRBIiwib3JpZ2luIjoiaHR0cDovL2xvY2FsaG9zdDo1MTczIiwiY3Jvc3NPcmlnaW4iOmZhbHNlfQ",
          transports: [],
        },
        type: "public-key",
        clientExtensionResults: { credProps: {} },
        authenticatorAttachment: "cross-platform",
      };
      const res = await fetch(origin + "/api/credential", {
        method: "POST",
        body: JSON.stringify(response),
      });
      assert.strictEqual(res.status, 200);
    });
    await t.test("already logged in", async (t) => {
      const res = await fetch(origin + "/api/session");
      assert.strictEqual(res.status, 200);
      const body = await res.json();
      assert.deepStrictEqual(body, { name: userName });
    });
  });
  await t.test("login", async (t) => {
    const userName = "test";
    await t.test("request authentication", async (t) => {
      const res = await fetch(origin + "/api/session/new", {
        method: "POST",
      });
      assert.strictEqual(res.status, 200);
      await res.json();
    });
    await t.test("verify response", async (t) => {
      // challenge = "test", user = "test" で生成した実際のデータ
      const response = {
        id: "anynpsaHhnUBtQKsoPJ1D6wGNcw",
        rawId: "anynpsaHhnUBtQKsoPJ1D6wGNcw",
        response: {
          authenticatorData:
            "SZYN5YgOjGh0NBcPZHZgW4_krrmihjLHmVzzuoMdl2MdAAAAAA",
          clientDataJSON:
            "eyJ0eXBlIjoid2ViYXV0aG4uZ2V0IiwiY2hhbGxlbmdlIjoiZEdWemRBIiwib3JpZ2luIjoiaHR0cDovL2xvY2FsaG9zdDo1MTczIiwiY3Jvc3NPcmlnaW4iOmZhbHNlfQ",
          signature:
            "MEYCIQCT7OQDXOKANaY2fDmZ5LQDBpLQEBH3LSgrJeRkYW70cAIhAKqsJKT9NY0d4MrQQmTDVoqEB-uTNrXku4yUnxJ58Ne9",
          userHandle: "kaleidoshare/test",
        },
        type: "public-key",
        clientExtensionResults: {},
        authenticatorAttachment: "cross-platform",
      };
      const res = await fetch(origin + "/api/session", {
        method: "POST",
        body: JSON.stringify(response),
      });
      assert.strictEqual(res.status, 200);
    });
    await t.test("logged in", async (t) => {
      const res = await fetch(origin + "/api/session");
      assert.strictEqual(res.status, 200);
      const body = await res.json();
      assert.deepStrictEqual(body, { name: userName });
    });
  });
  await t.test("logout", async (t) => {
    await t.test("call api", async () => {
      const res = await fetch(origin + "/api/session", { method: "DELETE" });
      assert.strictEqual(res.status, 200);
    });
    await t.test("logged out", async (t) => {
      const res = await fetch(origin + "/api/session");
      assert.strictEqual(res.status, 200);
      const body = await res.json();
      assert.deepStrictEqual(body, null);
    });
  });
});
