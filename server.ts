import { Application } from "oak";
import { CookieStore, Session } from "oak_sessions";
import { randomHex } from "./server/util.ts";
import { openKv } from "./server/kv.ts";
import { createRouters, handleError } from "./server/api.ts";

const apiServerPort: number = parseInt(Deno.env.get("PORT") ?? "8000");

const DENO_DEPLOYMENT_ID = Deno.env.get("DENO_DEPLOYMENT_ID");

if (DENO_DEPLOYMENT_ID == null) {
  // デバッグのためにデータを全部消す
  const kv = await openKv();
  const iter = await kv.list({ prefix: [] });
  for await (const res of iter) {
    console.log("delete", res.key);
    kv.delete(res.key);
  }
}

type AppState = {
  session: Session;
};

// 以下では認証できない
// - https://kaleidoshare-${DENO_DEPLOYMENT_ID}.deno.dev
// - http://localhost:4173
const rpID = DENO_DEPLOYMENT_ID != null ? `kaleidoshare.deno.dev` : "localhost";
const expectedOrigin =
  DENO_DEPLOYMENT_ID != null ? `https://${rpID}` : `http://${rpID}:5173`;

const { router, routerWithAuth } = createRouters(rpID, expectedOrigin);

const app = new Application<AppState>();
app.addEventListener("error", (e) => {
  console.log(e.error);
});
const store = new CookieStore(randomHex(32));
app.use(
  Session.initMiddleware(store, {
    expireAfterSeconds: 24 * 60 * 60, // 1 day
  })
);
app.use(async (context, next) => {
  console.log(context.request.method, context.request.url.pathname);
  await next();
});
app.use(async (context, next) => {
  try {
    await next();
  } catch (e) {
    handleError(context, e);
  }
});
app.use(router.routes());
app.use(router.allowedMethods());
app.use(routerWithAuth.routes());
app.use(routerWithAuth.allowedMethods());
app.use(async (context, next) => {
  try {
    await context.send({
      root: `${Deno.cwd()}/dist`,
      index: "index.html",
    });
  } catch {
    await next();
  }
});
await app.listen({ port: apiServerPort });
