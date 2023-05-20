import { test, before, after } from "node:test";
import * as assert from "assert";
import * as childProcess from "child_process";

test("session", async (t) => {
  let p: childProcess.ChildProcess;
  before(async () => {
    p = childProcess.spawn("deno", ["run", "-A", "--unstable", "server.ts"], {
      stdio: "inherit",
    });
    for (const _ of Array(1000).keys()) {
      try {
        await fetch("http://localhost:8000");
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
  await t.test("guest", async () => {
    const res = await fetch("http://localhost:8000/api/session");
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body, null);
  });
});
