import { test, before, after } from "node:test";
import * as assert from "assert";
import * as childProcess from "child_process";
import { createClient } from "./util.mjs";
import {
  testCred1AuthenticationResponse,
  testCred1RegistrationResponse,
  testCred2AuthenticationResponse,
  testCred2RegistrationResponse,
  waitForServer,
} from "./common.mjs";
import * as fs from "node:fs";

test("session", async (t) => {
  const kvPath = "tmp/" + t.name;
  const port = 8000;
  const origin = `http://localhost:${port}`;
  let p: childProcess.ChildProcess;
  before(async () => {
    fs.mkdirSync("tmp", { recursive: true });
    p = childProcess.spawn("deno", ["run", "-A", "--unstable", "server.ts"], {
      env: {
        ...process.env,
        CHALLENGE: "test",
        PORT: String(port),
        KV_PATH: kvPath,
      },
      stdio: "inherit",
    });
    await waitForServer(origin);
  });
  after(() => {
    p.kill();
  });
  const fetch = createClient();

  await t.test("guest", async (t) => {
    await t.test("no session", async () => {
      const res = await fetch(origin + "/api/session");
      assert.strictEqual(res.status, 200);
      const body = await res.json();
      assert.strictEqual(body, null);
    });
    await t.test("request authentication", async (t) => {
      const res = await fetch(origin + "/api/session/new", {
        method: "POST",
      });
      assert.strictEqual(res.status, 200);
      await res.json();
    });
    await t.test("verify authentication response", async (t) => {
      const res = await fetch(origin + "/api/session", {
        method: "POST",
        body: JSON.stringify(testCred1AuthenticationResponse),
      });
      assert.strictEqual(res.status, 401); // まだ登録されていない
    });
    await t.test("call logout api", async () => {
      const res = await fetch(origin + "/api/session", { method: "DELETE" });
      assert.strictEqual(res.status, 200);
    });
    await t.test("call POST /credential/add api", async () => {
      const res = await fetch(origin + "/api/credential/add", {
        method: "POST",
      });
      assert.strictEqual(res.status, 401);
    });
    await t.test("call DELETE /user api", async () => {
      const res = await fetch(origin + "/api/user", {
        method: "DELETE",
      });
      assert.strictEqual(res.status, 401);
    });
  });
  const userName = "test";
  await t.test("signup", async (t) => {
    await t.test("request registration", async (t) => {
      const res = await fetch(origin + "/api/credential/new", {
        method: "POST",
        body: JSON.stringify({ name: userName }),
      });
      assert.strictEqual(res.status, 200);
      await res.json();
    });
    await t.test("verify response", async (t) => {
      const res = await fetch(origin + "/api/credential", {
        method: "POST",
        body: JSON.stringify(testCred1RegistrationResponse),
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
  await t.test("add credential", async (t) => {
    await t.test("request registration", async (t) => {
      const res = await fetch(origin + "/api/credential/add", {
        method: "POST",
        body: JSON.stringify({ name: userName }),
      });
      assert.strictEqual(res.status, 200);
      await res.json();
    });
    await t.test("verify response", async (t) => {
      const res = await fetch(origin + "/api/credential", {
        method: "POST",
        body: JSON.stringify(testCred2RegistrationResponse),
      });
      assert.strictEqual(res.status, 200);
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
      const res = await fetch(origin + "/api/session", {
        method: "POST",
        body: JSON.stringify(testCred1AuthenticationResponse),
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
    const res = await fetch(origin + "/api/session", { method: "DELETE" });
    assert.strictEqual(res.status, 200);
  });
  await t.test("login (cred 2)", async (t) => {
    const userName = "test";
    await t.test("request authentication", async (t) => {
      const res = await fetch(origin + "/api/session/new", {
        method: "POST",
      });
      assert.strictEqual(res.status, 200);
      await res.json();
    });
    await t.test("verify response", async (t) => {
      const res = await fetch(origin + "/api/session", {
        method: "POST",
        body: JSON.stringify(testCred2AuthenticationResponse),
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
  await t.test("delete account", async (t) => {
    await t.test("call api", async () => {
      const res = await fetch(origin + "/api/user", {
        method: "DELETE",
        body: JSON.stringify({ name: userName }),
      });
      assert.strictEqual(res.status, 200);
    });
    await t.test("logged out", async (t) => {
      const res = await fetch(origin + "/api/session");
      assert.strictEqual(res.status, 200);
      const body = await res.json();
      assert.deepStrictEqual(body, null);
    });
    await t.test("request authentication", async (t) => {
      const res = await fetch(origin + "/api/session/new", {
        method: "POST",
      });
      assert.strictEqual(res.status, 200);
      await res.json();
    });
    await t.test("verify authentication response", async (t) => {
      const res = await fetch(origin + "/api/session", {
        method: "POST",
        body: JSON.stringify(testCred1AuthenticationResponse),
      });
      assert.strictEqual(res.status, 401); // もういない
    });
    await t.test("verify authentication response", async (t) => {
      const res = await fetch(origin + "/api/session", {
        method: "POST",
        body: JSON.stringify(testCred2AuthenticationResponse),
      });
      assert.strictEqual(res.status, 401); // もういない
    });
  });
});
