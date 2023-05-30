// TODO: deps.ts に移動する
import { Application, Router } from "https://deno.land/x/oak@v12.2.0/mod.ts";
import {
  CookieStore,
  Session,
} from "https://deno.land/x/oak_sessions@v4.1.4/mod.ts";
import {
  AuthenticationNotVerifiedError,
  AuthenticatorNotRegisteredError,
  RegistrationNotVerifiedError,
  UserAlreadyExistsError,
  authenticate,
  createAuthentication,
  createCredential,
  deleteUser,
  register,
} from "./server/auth.ts";
import { randomHex } from "./server/util.ts";
import {
  AuthorDoesNotMatchError,
  createContent,
  getUserContent,
  listUserContents,
  removeAllUserContents,
  removeContent,
  updateContent,
} from "./server/content.ts";
import { openKv } from "./server/kv.ts";

const apiServerPort: number = parseInt(Deno.env.get("PORT") ?? "8000");

// デバッグのためにデータを全部消す
// TODO: デバッグの時だけにする
const kv = await openKv();
const iter = await kv.list({ prefix: [] });
for await (const res of iter) {
  console.log("delete", res.key);
  kv.delete(res.key);
}

type AppState = {
  session: Session;
};

const port = 5173;
const rpID = "localhost";
const expectedOrigin = `http://${rpID}:${port}`;

const router = new Router({
  prefix: "/api",
});
const routerWithAuth = new Router({
  prefix: "/api",
});
routerWithAuth.use(async (context, next) => {
  const userName = await context.state.session.get("login");
  if (userName == null) {
    context.response.status = 401;
    context.response.body = JSON.stringify({
      message: "not authenticated",
    });
    return;
  }
  await next();
});
router.post("/session/new", async (context) => {
  const options = await createAuthentication(rpID);
  context.response.status = 200;
  await context.state.session.flash("challenge", options.challenge);
  context.response.body = JSON.stringify(options);
});
router.post("/session", async (context) => {
  const response = await context.request.body({ type: "json" }).value;
  const challenge = await context.state.session.get("challenge");
  if (challenge == null) {
    throw new AuthenticationNotVerifiedError();
  }
  const userName = await authenticate(
    rpID,
    expectedOrigin,
    response,
    challenge
  );
  await context.state.session.set("login", userName);
  context.response.status = 200;
});
router.get("/session", async (context) => {
  const name = await context.state.session.get("login");
  const user = name == null ? null : { name };
  context.response.status = 200;
  context.response.body = JSON.stringify(user);
});
router.delete("/session", async (context) => {
  await context.state.session.deleteSession();
  context.response.status = 200;
});
router.post("/credential/new", async (context) => {
  const { name: userName } = await context.request.body({ type: "json" }).value;
  const options = await createCredential(rpID, userName, true);
  await context.state.session.flash("challenge", options.challenge);
  await context.state.session.flash("userName", userName);
  context.response.status = 200;
  context.response.body = JSON.stringify(options);
});
routerWithAuth.post("/credential/add", async (context) => {
  const userName = await context.state.session.get("login");
  const options = await createCredential(rpID, userName, false);
  await context.state.session.flash("challenge", options.challenge);
  await context.state.session.flash("userName", userName);
  context.response.status = 200;
  context.response.body = JSON.stringify(options);
});
router.post("/credential", async (context) => {
  const response = await context.request.body({ type: "json" }).value;
  const challenge: string = await context.state.session.get("challenge");
  const userName: string = await context.state.session.get("userName");
  if (challenge == null || userName == null) {
    throw new RegistrationNotVerifiedError();
  }
  await register(rpID, expectedOrigin, response, challenge, userName);
  await context.state.session.set("login", userName);
  context.response.status = 200;
});
routerWithAuth.delete("/user", async (context) => {
  const userName = await context.state.session.get("login");
  await removeAllUserContents(userName); // TODO: 消さなくてもいい？
  await deleteUser(userName);
  await context.state.session.deleteSession();
  context.response.status = 200;
});
routerWithAuth.post("/contents/:author", async (context) => {
  const author = context.params.author;
  const userName = await context.state.session.get("login");
  const { settings, output } = await context.request.body({ type: "json" })
    .value;
  const content = await createContent(userName, author, settings, output);
  context.response.status = 200;
  context.response.body = JSON.stringify(content);
});
routerWithAuth.put("/contents/:author/:contentId", async (context) => {
  const author = context.params.author;
  const userName = await context.state.session.get("login");
  const contentId = context.params.contentId;
  const { settings, output } = await context.request.body({ type: "json" })
    .value;
  const content = await updateContent(
    userName,
    author,
    contentId,
    settings,
    output
  );
  context.response.status = 200;
  context.response.body = JSON.stringify(content);
});
routerWithAuth.delete("/contents/:author/:contentId", async (context) => {
  const author = context.params.author;
  const userName = await context.state.session.get("login");
  const contentId = context.params.contentId;
  const content = await removeContent(userName, author, contentId);
  context.response.status = 200;
  context.response.body = JSON.stringify(content);
});
router.get("/contents/:author", async (context) => {
  const author = context.params.author;
  const contents = await listUserContents(author);
  context.response.status = 200;
  context.response.body = JSON.stringify(contents);
});
router.get("/contents/:author/:contentId", async (context) => {
  const author = context.params.author;
  const contentId = context.params.contentId;
  const content = await getUserContent(author, contentId);
  context.response.status = 200;
  context.response.body = JSON.stringify(content);
});

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
    if (e instanceof UserAlreadyExistsError) {
      context.response.status = 400;
      context.response.body = JSON.stringify({
        message: "User already exists",
      });
      return;
    }
    if (e instanceof RegistrationNotVerifiedError) {
      context.response.status = 401;
      context.response.body = JSON.stringify({
        message: "not verified",
      });
      return;
    }
    if (
      e instanceof AuthenticatorNotRegisteredError ||
      e instanceof AuthenticationNotVerifiedError
    ) {
      context.response.status = 401;
      context.response.body = JSON.stringify({
        message: "not verified",
      });
      return;
    }
    if (e instanceof AuthorDoesNotMatchError) {
      context.response.status = 403;
      context.response.body = JSON.stringify({
        message: "author does not match",
      });
      return;
    }
    console.error(e);
    context.response.status = 500;
    context.response.body = JSON.stringify({
      message: "Internal Server Error",
    });
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
