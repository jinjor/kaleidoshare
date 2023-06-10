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
      body: JSON.stringify({
        settings: { objects: [] },
        output: { spinner: { speed: 1, vertices: [] }, objects: [] },
      }),
    });
    assert.strictEqual(res.status, 403);
    await res.json();
  });
  await t.test("cannot update other's content", async (t) => {
    const res = await fetch(origin + `/api/contents/foo/bar`, {
      method: "PUT",
      body: JSON.stringify({
        settings: { objects: [] },
        output: { spinner: { speed: 1, vertices: [] }, objects: [] },
      }),
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
  const createBody = {
    settings: { background: "#123", objects: [] },
    output: {
      spinner: { speed: 1, vertices: [{ x: 1, y: 1 }] },
      objects: [],
    },
  };
  const updateBody = {
    settings: { background: "#456", objects: [] },
    output: {
      spinner: { speed: 1, vertices: [{ x: 2, y: 2 }] },
      objects: [],
    },
  };
  await t.test("create content", async (t) => {
    {
      const res = await fetch(origin + `/api/contents/${userName}`, {
        method: "POST",
        body: JSON.stringify(createBody),
      });
      assert.strictEqual(res.status, 200);
      const { id, author, createdAt, updatedAt, settings, output } =
        await res.json();
      content1Id = id;
      assert.strictEqual(typeof id, "string");
      assert.strictEqual(author, userName);
      assert.strictEqual(createdAt, updatedAt);
      assert.deepStrictEqual(settings, createBody.settings);
      assert.deepStrictEqual(output, createBody.output);
    }
    {
      const res = await fetch(origin + `/api/contents/${userName}`, {
        method: "POST",
        body: JSON.stringify(createBody),
      });
      assert.strictEqual(res.status, 200);
      const { id } = await res.json();
      content2Id = id;
    }
  });
  await t.test("cannot create invalid content", async (t) => {
    const res = await fetch(origin + `/api/contents/${userName}`, {
      method: "POST",
      body: JSON.stringify({
        settings: { objects: [] },
        output: {
          spinner: {
            speed: 1,
            vertices: new Array(100).fill({ x: 0, y: 0 }),
          },
          objects: [],
        },
      }),
    });
    assert.strictEqual(res.status, 400);
  });
  await t.test("update content", async (t) => {
    const res = await fetch(
      origin + `/api/contents/${userName}/${content1Id}`,
      {
        method: "PUT",
        body: JSON.stringify(updateBody),
      }
    );
    assert.strictEqual(res.status, 200);
    const { id, author, createdAt, updatedAt, settings, output } =
      await res.json();
    assert.strictEqual(id, content1Id);
    assert.strictEqual(author, userName);
    assert.notStrictEqual(createdAt, updatedAt);
    assert.deepStrictEqual(settings, updateBody.settings);
    assert.deepStrictEqual(output, updateBody.output);
  });
  await t.test("cannot update invalid content", async (t) => {
    const res = await fetch(
      origin + `/api/contents/${userName}/${content1Id}`,
      {
        method: "PUT",
        body: JSON.stringify({
          settings: { objects: [] },
          output: {
            spinner: {
              speed: 1,
              vertices: new Array(100).fill({ x: 0, y: 0 }),
            },
            objects: [],
          },
        }),
      }
    );
    assert.strictEqual(res.status, 400);
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
        body: JSON.stringify({}),
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
  await t.test("too many contents", async (t) => {
    {
      const currentNumberOfContents = 1;
      const maxNumberOfContents = 100;
      for (let i = 0; i < maxNumberOfContents - currentNumberOfContents; i++) {
        const res = await fetch(origin + `/api/contents/${userName}`, {
          method: "POST",
          body: JSON.stringify(createBody),
        });
        assert.strictEqual(res.status, 200);
      }
      const res = await fetch(origin + `/api/contents/${userName}`, {
        method: "POST",
        body: JSON.stringify(createBody),
      });
      assert.strictEqual(res.status, 400);
      await res.json();
    }
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
      assert.strictEqual(contents, null);
    }
  });
});
