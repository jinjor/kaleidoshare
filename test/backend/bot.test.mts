import { test, before, after } from "node:test";
import assert from "assert";
import * as childProcess from "child_process";
import { createClient } from "./util.mjs";
import { waitForServer } from "./common.mjs";
import * as fs from "node:fs";

test("bot", async (t) => {
  const kvPath = "tmp/" + t.name;
  const port = 8002;
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
  await t.test("special html for twitter bot", async () => {
    const authorName = "author";
    const contentId = "content";
    for (const url of [
      origin + `/contents/${authorName}/${contentId}`,
      origin + `/contents/${authorName}/${contentId}/show`,
      origin + `/contents/${authorName}/${contentId}/player`,
    ]) {
      const res = await fetch(url, {
        headers: {
          "user-agent": "Twitterbot",
        },
      });
      assert.strictEqual(res.status, 200);
      const html = await res.text();
      assert(html.includes("twitter:player"));
      assert(html.includes(`${authorName}/${contentId}`));
    }
  });
  await t.test("security", async () => {
    for (const { authorName, contentId, expectPlayer, ngWords } of [
      {
        authorName: "author",
        contentId: "<script></script>",
        expectPlayer: true,
        ngWords: [],
      },
      {
        authorName: "author",
        contentId: encodeURIComponent("<script></script>"),
        expectPlayer: true,
        ngWords: ["<script></script>"],
      },
      {
        authorName: encodeURIComponent("au/thor"),
        contentId: encodeURIComponent("con/tent"),
        expectPlayer: true,
        ngWords: ["/au/thor", "/con/tent"],
      },
    ]) {
      const url = origin + `/contents/${authorName}/${contentId}`;
      const res = await fetch(url, {
        headers: {
          "user-agent": "Twitterbot",
        },
      });
      assert.strictEqual(res.status, 200);
      const html = await res.text();
      if (expectPlayer) {
        assert(html.includes("twitter:player"), "twitter:player not found");
        for (const ngWord of ngWords) {
          assert(!html.includes(ngWord), ngWord + " found");
        }
      } else {
        assert(!html.includes("twitter:player"), "twitter:player found");
      }
    }
  });
});
