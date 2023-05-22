import { test, before, after } from "node:test";
import * as assert from "assert";
import * as childProcess from "child_process";
import { createClient } from "./util.mjs";

// challenge = "test", user = "test" で登録時に生成した実際のデータ
const testCred1RegistrationResponse = {
  id: "MuJ1-f-99qJKxOvBQf0-fnwdYHA",
  rawId: "MuJ1-f-99qJKxOvBQf0-fnwdYHA",
  response: {
    attestationObject:
      "o2NmbXRkbm9uZWdhdHRTdG10oGhhdXRoRGF0YViYSZYN5YgOjGh0NBcPZHZgW4_krrmihjLHmVzzuoMdl2NdAAAAAAAAAAAAAAAAAAAAAAAAAAAAFDLidfn_vfaiSsTrwUH9Pn58HWBwpQECAyYgASFYILXCCOqzJPy5mE0NzGwEBpOqrOhBgiZndvEKozbOYq5kIlgg7Yt0QTUm7oNBOjH28MCccA8KNVSpZdD0G7YRgbfvydk",
    clientDataJSON:
      "eyJ0eXBlIjoid2ViYXV0aG4uY3JlYXRlIiwiY2hhbGxlbmdlIjoiZEdWemRBIiwib3JpZ2luIjoiaHR0cDovL2xvY2FsaG9zdDo1MTczIiwiY3Jvc3NPcmlnaW4iOmZhbHNlfQ",
    transports: [],
  },
  type: "public-key",
  clientExtensionResults: { credProps: {} },
  authenticatorAttachment: "cross-platform",
};
// 上の条件で登録後、challenge = "test", user = "test" で認証時に生成した実際のデータ
const testCred1AuthenticationResponse = {
  id: "MuJ1-f-99qJKxOvBQf0-fnwdYHA",
  rawId: "MuJ1-f-99qJKxOvBQf0-fnwdYHA",
  response: {
    authenticatorData: "SZYN5YgOjGh0NBcPZHZgW4_krrmihjLHmVzzuoMdl2MdAAAAAA",
    clientDataJSON:
      "eyJ0eXBlIjoid2ViYXV0aG4uZ2V0IiwiY2hhbGxlbmdlIjoiZEdWemRBIiwib3JpZ2luIjoiaHR0cDovL2xvY2FsaG9zdDo1MTczIiwiY3Jvc3NPcmlnaW4iOmZhbHNlfQ",
    signature:
      "MEUCIQCNVshPb4BqzlOSEWT34cctaBcGaGtxSY8xW8-w8PVl2wIgLu33uZkekVwlV2qf-CvEUqs9WyUpkpblUmf-1peT2pI",
    userHandle: "kaleidoshare/test",
  },
  type: "public-key",
  clientExtensionResults: {},
  authenticatorAttachment: "cross-platform",
};
const testCred2RegistrationResponse = {
  id: "iheVmEdZThapXS5fU1rFMvJ1-0ptZHtSB7qBWjSiSlc",
  rawId: "iheVmEdZThapXS5fU1rFMvJ1-0ptZHtSB7qBWjSiSlc",
  response: {
    attestationObject:
      "o2NmbXRkbm9uZWdhdHRTdG10oGhhdXRoRGF0YVikSZYN5YgOjGh0NBcPZHZgW4_krrmihjLHmVzzuoMdl2NFAAAAAK3OAAI1vMYKZIsLJfHwVQMAIIoXlZhHWU4WqV0uX1NaxTLydftKbWR7Uge6gVo0okpXpQECAyYgASFYIJaOh8xlNSjNFOLAc_CKTcVHxQO24mNfA3by4TX7vnrNIlgg8bcCqx7Npss1ovRh2q189JjNODgEm8laoBMDuwz1B_E",
    clientDataJSON:
      "eyJ0eXBlIjoid2ViYXV0aG4uY3JlYXRlIiwiY2hhbGxlbmdlIjoiZEdWemRBIiwib3JpZ2luIjoiaHR0cDovL2xvY2FsaG9zdDo1MTczIiwiY3Jvc3NPcmlnaW4iOmZhbHNlfQ",
    transports: ["internal"],
  },
  type: "public-key",
  clientExtensionResults: { credProps: { rk: true } },
  authenticatorAttachment: "platform",
};
// 上の条件で登録後、challenge = "test", user = "test" で認証時に生成した実際のデータ
const testCred2AuthenticationResponse = {
  id: "iheVmEdZThapXS5fU1rFMvJ1-0ptZHtSB7qBWjSiSlc",
  rawId: "iheVmEdZThapXS5fU1rFMvJ1-0ptZHtSB7qBWjSiSlc",
  response: {
    authenticatorData: "SZYN5YgOjGh0NBcPZHZgW4_krrmihjLHmVzzuoMdl2MFAAAAAA",
    clientDataJSON:
      "eyJ0eXBlIjoid2ViYXV0aG4uZ2V0IiwiY2hhbGxlbmdlIjoiZEdWemRBIiwib3JpZ2luIjoiaHR0cDovL2xvY2FsaG9zdDo1MTczIiwiY3Jvc3NPcmlnaW4iOmZhbHNlfQ",
    signature:
      "MEUCIQCKmXpteyMxMs7vrL8fZlZrKI8bUArBN_VykY0GiCLLbwIgKu78s3r0Tv9sboKTg8mi4_OwlRenpdjIDwSib5SsCbQ",
    userHandle: "kaleidoshare/test",
  },
  type: "public-key",
  clientExtensionResults: {},
  authenticatorAttachment: "platform",
};

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
