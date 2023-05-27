import { test, before, after } from "node:test";
import * as assert from "assert";
import * as childProcess from "child_process";
import { createClient } from "./util.mjs";
import {
  testCred1AuthenticationResponse,
  testCred1RegistrationResponse,
  waitForServer,
} from "./common.mjs";
import * as fs from "node:fs";

test("content", async (t) => {
  const kvPath = "tmp/" + t.name;
  const port = 8001;
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
  const userName = "test";
  await t.test("cannot create contents before login", async (t) => {
    const res = await fetch(origin + `/api/contents/foo`, {
      method: "POST",
      body: JSON.stringify({ name: userName }),
    });
    assert.strictEqual(res.status, 401);
    await res.json();
  });
  await t.test("cannot update contents before login", async (t) => {
    const res = await fetch(origin + `/api/contents/foo/bar`, {
      method: "PUT",
      body: JSON.stringify({ name: userName }),
    });
    assert.strictEqual(res.status, 401);
    await res.json();
  });
  await t.test("cannot delete contents before login", async (t) => {
    const res = await fetch(origin + `/api/contents/foo/bar`, {
      method: "DELETE",
      body: JSON.stringify({ name: userName }),
    });
    assert.strictEqual(res.status, 401);
    await res.json();
  });
  await t.test("signup", async (t) => {
    {
      const res = await fetch(origin + "/api/credential/new", {
        method: "POST",
        body: JSON.stringify({ name: userName }),
      });
      assert.strictEqual(res.status, 200);
      await res.json();
    }
    {
      const res = await fetch(origin + "/api/credential", {
        method: "POST",
        body: JSON.stringify(testCred1RegistrationResponse),
      });
      assert.strictEqual(res.status, 200);
    }
  });
  await t.test("cannot create other's content", async (t) => {
    const res = await fetch(origin + `/api/contents/foo`, {
      method: "POST",
      body: JSON.stringify({ settings: {} }),
    });
    assert.strictEqual(res.status, 403);
    await res.json();
  });
  await t.test("cannot update other's content", async (t) => {
    const res = await fetch(origin + `/api/contents/foo/bar`, {
      method: "PUT",
      body: JSON.stringify({ settings: {} }),
    });
    assert.strictEqual(res.status, 403);
    await res.json();
  });
  await t.test("cannot delete other's content", async (t) => {
    const res = await fetch(origin + `/api/contents/foo/bar`, {
      method: "DELETE",
    });
    assert.strictEqual(res.status, 403);
    await res.json();
  });
  let content1Id = "x";
  let content2Id = "y";
  await t.test("create content", async (t) => {
    {
      const res = await fetch(origin + `/api/contents/${userName}`, {
        method: "POST",
        body: JSON.stringify({ settings: {} }),
      });
      assert.strictEqual(res.status, 200);
      const { id, author, createdAt, updatedAt } = await res.json();
      content1Id = id;
      assert.strictEqual(typeof id, "string");
      assert.strictEqual(author, userName);
      assert.strictEqual(createdAt, updatedAt);
    }
    {
      const res = await fetch(origin + `/api/contents/${userName}`, {
        method: "POST",
        body: JSON.stringify({ settings: {} }),
      });
      assert.strictEqual(res.status, 200);
      const { id } = await res.json();
      content2Id = id;
    }
  });
  await t.test("update content", async (t) => {
    const res = await fetch(
      origin + `/api/contents/${userName}/${content1Id}`,
      {
        method: "PUT",
        body: JSON.stringify({ settings: {} }),
      }
    );
    assert.strictEqual(res.status, 200);
    const { id, author, createdAt, updatedAt } = await res.json();
    assert.strictEqual(id, content1Id);
    assert.strictEqual(author, userName);
    assert.notStrictEqual(createdAt, updatedAt);
  });
  await t.test("delete content", async (t) => {
    const res = await fetch(
      origin + `/api/contents/${userName}/${content2Id}`,
      {
        method: "DELETE",
      }
    );
    assert.strictEqual(res.status, 200);
  });
  await t.test("logout", async (t) => {
    const res = await fetch(origin + "/api/session", { method: "DELETE" });
    assert.strictEqual(res.status, 200);
  });
  await t.test("guest can get content", async (t) => {
    const res = await fetch(origin + `/api/contents/${userName}/${content1Id}`);
    assert.strictEqual(res.status, 200);
    const content = await res.json();
    assert.strictEqual(content.id, content1Id);
  });
  await t.test("guest can list content", async (t) => {
    const res = await fetch(origin + `/api/contents/${userName}`);
    assert.strictEqual(res.status, 200);
    const contents = await res.json();
    assert.strictEqual(contents.length, 1);
    assert.strictEqual(contents[0].id, content1Id);
  });
  await t.test("content not found", async (t) => {
    // TODO: 404?
    {
      const res = await fetch(origin + `/api/contents/${userName}/foo`);
      assert.strictEqual(res.status, 200);
      const content = await res.json();
      assert.strictEqual(content, null);
    }
    {
      const res = await fetch(origin + `/api/contents/foo/${content1Id}`);
      assert.strictEqual(res.status, 200);
      const content = await res.json();
      assert.strictEqual(content, null);
    }
    {
      const res = await fetch(
        origin + `/api/contents/${userName}/${content2Id}`
      );
      assert.strictEqual(res.status, 200);
      const content = await res.json();
      assert.strictEqual(content, null);
    }
  });
  await t.test("login", async (t) => {
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
  });
  await t.test("delete account", async (t) => {
    {
      const res = await fetch(origin + "/api/user", {
        method: "DELETE",
        body: JSON.stringify({ name: userName }),
      });
      assert.strictEqual(res.status, 200);
    }
    {
      const res = await fetch(origin + "/api/session");
      assert.strictEqual(res.status, 200);
      const body = await res.json();
      assert.deepStrictEqual(body, null);
    }
  });
  await t.test("content is also deleted", async (t) => {
    {
      const res = await fetch(
        origin + `/api/contents/${userName}/${content1Id}`
      );
      assert.strictEqual(res.status, 200);
      const content = await res.json();
      assert.strictEqual(content, null);
    }
    {
      const res = await fetch(origin + `/api/contents/${userName}`);
      assert.strictEqual(res.status, 200);
      const contents = await res.json();
      assert.strictEqual(contents.length, 0);
    }
  });
});