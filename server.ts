import { Application } from "oak";
import { CookieStore, Session } from "oak_sessions";
import { randomHex } from "./server/util.ts";
import { openKv } from "./server/kv.ts";
import { createRouters, handleError } from "./server/api.ts";

const apiServerPort: number = parseInt(Deno.env.get("PORT") ?? "8000");

const DENO_DEPLOYMENT_ID = Deno.env.get("DENO_DEPLOYMENT_ID");

console.log("DENO_DEPLOYMENT_ID:", DENO_DEPLOYMENT_ID);
const isDeploy = DENO_DEPLOYMENT_ID != null;

// const clearData = !isDeploy;
const clearData = true;
if (clearData) {
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
const rpID = isDeploy
  ? //  `kaleidoshare.deno.dev`
    `kaleidoshare--esm-sh.deno.dev`
  : "localhost";
const originPort = Deno.env.get("ORIGIN_PORT") ?? "5173";
const expectedOrigin = isDeploy
  ? `https://${rpID}`
  : `http://${rpID}:${originPort}`;

const { router, routerWithAuth } = createRouters(rpID, expectedOrigin);

const app = new Application<AppState>();
app.addEventListener("error", (e) => {
  console.log(e.error);
});
const store = new CookieStore(randomHex(32));
app.use(
  Session.initMiddleware(store, {
    expireAfterSeconds: 24 * 60 * 60, // 1 day
    cookieSetOptions: {
      httpOnly: true,
      sameSite: "lax",
      secure: isDeploy,
    },
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
