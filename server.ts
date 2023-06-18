import { Application } from "oak";
import { CookieStore, Session } from "oak_sessions";
import { randomHex } from "./server/util.ts";
import { openKv } from "./server/kv.ts";
import { createRouters, handleError } from "./server/api.ts";

const apiServerPort: number = parseInt(Deno.env.get("PORT") ?? "8000");

const DENO_DEPLOYMENT_ID = Deno.env.get("DENO_DEPLOYMENT_ID");
const isDeploy = DENO_DEPLOYMENT_ID != null;

const clearData = !isDeploy;
// const clearData = true;
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

// `kaleidoshare-${branch}.deno.dev` では認証できない
const expectedRPIDs = isDeploy
  ? [`kaleidoshare.deno.dev`, `kaleidoshare-${DENO_DEPLOYMENT_ID}.deno.dev`]
  : ["localhost"];
const expectedOrigins = isDeploy
  ? expectedRPIDs.map((rpID) => `https://${rpID}`)
  : [5173, 8000].map((port) => `http://localhost:${port}`);
const { router, routerWithAuth, routerForNonApi } = createRouters(
  expectedRPIDs,
  expectedOrigins
);

const app = new Application<AppState>();
app.addEventListener("error", (e) => {
  console.error(e.error);
});
const cookieStoreSecret = Deno.env.get("COOKIE_STORE_SECRET") ?? randomHex(32);
const cookieStoreKey = `${DENO_DEPLOYMENT_ID ?? ""}:${cookieStoreSecret}`;
const store = new CookieStore(cookieStoreKey);
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
app.use(routerForNonApi.routes());
app.use(async (context, next) => {
  try {
    const hasExtension = context.request.url.pathname
      .split("/")
      .at(-1)
      ?.includes(".");
    await context.send({
      root: `${Deno.cwd()}/dist`,
      path: hasExtension ? undefined : "index.html",
    });
  } catch {
    await next();
  }
});
await app.listen({ port: apiServerPort, secure: isDeploy });
