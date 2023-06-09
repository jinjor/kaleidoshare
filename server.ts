import { Application, Router } from "oak";
import { CookieStore, Session } from "oak_sessions";
import { randomHex } from "./server/util.ts";
import { openKv } from "./server/kv.ts";
// import { createRouters, handleError } from "./server/api.ts";

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
const rpID = DENO_DEPLOYMENT_ID != null ? `kaleidoshare.deno.dev` : "localhost";
const originPort = Deno.env.get("ORIGIN_PORT") ?? "5173";
const expectedOrigin =
  DENO_DEPLOYMENT_ID != null
    ? `https://${rpID}`
    : `http://${rpID}:${originPort}`;

// const { router, routerWithAuth } = createRouters(rpID, expectedOrigin);

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
// app.use(async (context, next) => {
//   try {
//     await next();
//   } catch (e) {
//     handleError(context, e);
//   }
// });
// app.use(router.routes());
// app.use(router.allowedMethods());
// app.use(routerWithAuth.routes());
// app.use(routerWithAuth.allowedMethods());
const routerForBot = new Router();
routerForBot.get("/contents/:author/:contentId", async (context, next) => {
  const isTwitterBot =
    context.request.headers.get("user-agent")?.includes("Twitterbot") ?? false;
  if (!isTwitterBot) {
    await next();
    return;
  }
  const author = context.params.author;
  const contentId = context.params.contentId;
  context.response.status = 200;
  context.response.body = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="Cache-Control" content="no-store" />
    <link rel="icon" type="image/svg+xml" href="/icon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta
      name="description"
      content="This is ${author}'s ${contentId}"
    />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Kaleidoshare" />
    <meta property="og:title" content="Kaleidoshare" />
    <meta property="og:url" content="https://kaleidoshare.deno.dev/" />
    <meta property="og:image" content="https://kaleidoshare.deno.dev/ogp.png" />
    <meta
      property="og:description"
      content="This is ${contentId} by ${author}"
    />
    <meta name="twitter:card" content="summary" />
    <title>${contentId}</title>
  </head>
  <body>
  </body>
</html>
`;
});
app.use(routerForBot.routes());
app.use(routerForBot.allowedMethods());
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
