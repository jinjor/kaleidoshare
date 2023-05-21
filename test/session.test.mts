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
    {
      const res = await fetch(origin + "/api/session");
      assert.strictEqual(res.status, 200);
      const body = await res.json();
      assert.strictEqual(body, null);
    }
  });
  await t.test("signup", async (t) => {
    const userName = "test";
    await t.test("create credential", async (t) => {
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
        id: "M6fxptH_hMYKP0dmgItcqG-T7p4",
        rawId: "M6fxptH_hMYKP0dmgItcqG-T7p4",
        response: {
          attestationObject:
            "o2NmbXRkbm9uZWdhdHRTdG10oGhhdXRoRGF0YViYSZYN5YgOjGh0NBcPZHZgW4_krrmihjLHmVzzuoMdl2NdAAAAAAAAAAAAAAAAAAAAAAAAAAAAFDOn8abR_4TGCj9HZoCLXKhvk-6epQECAyYgASFYIC_TQVrTHHDP-p7L_ZtdeTh6veDOJrwinrQiApTpn46BIlggIaK0EHoZeDbzXj2pqKww9wv26eXKmJYQdnERJbUwqjs",
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
});
