import { Application } from "oak";
import { CookieStore, Session } from "oak_sessions";
import { randomHex } from "./server/util.ts";
import { openKv } from "./server/kv.ts";
import { createRouters, handleError } from "./server/api.ts";

const apiServerPort: number = parseInt(Deno.env.get("PORT") ?? "8000");

const DENO_DEPLOYMENT_ID = Deno.env.get("DENO_DEPLOYMENT_ID");
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

// `kaleidoshare-${branch}.deno.dev` では認証できない
const expectedRPIDs = isDeploy
  ? [`kaleidoshare.deno.dev`, `kaleidoshare-${DENO_DEPLOYMENT_ID}.deno.dev`]
  : ["localhost"];
const expectedOrigins = isDeploy
  ? expectedRPIDs.map((rpID) => `https://${rpID}`)
  : [4173, 5173].map((port) => `http://localhost:${port}`);
const { router, routerWithAuth } = createRouters(
  expectedRPIDs,
  expectedOrigins
);

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
await app.listen({ port: apiServerPort, secure: isDeploy });
