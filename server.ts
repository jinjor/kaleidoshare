import { Application, Router } from "https://deno.land/x/oak@v12.2.0/mod.ts";
import {
  CookieStore,
  Session,
} from "https://deno.land/x/oak_sessions@v4.1.4/mod.ts";
import {
  AuthenticationNotVerifiedError,
  RegistrationNotVerifiedError,
  UserAlreadyExistsError,
  authenticate,
  createAuthentication,
  createCredential,
  deleteCredential,
  register,
} from "./server/auth.ts";
import { randomHex } from "./server/util.ts";

// デバッグのためにデータを全部消す
const kv = await Deno.openKv();
const iter = await kv.list({ prefix: [] });
for await (const res of iter) {
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
  const { name: userName } = await context.request.body({ type: "json" }).value;
  const options = await createAuthentication(rpID, userName);
  context.response.status = 200;
  await context.state.session.flash("challenge", options.challenge);
  await context.state.session.flash("userName", userName);
  context.response.body = JSON.stringify(options);
});
router.post("/session", async (context) => {
  const response = await context.request.body({ type: "json" }).value;
  const challenge = await context.state.session.get("challenge");
  const userName = await context.state.session.get("userName");
  try {
    if (challenge == null || userName == null) {
      throw new AuthenticationNotVerifiedError();
    }
    const res = await authenticate(
      rpID,
      expectedOrigin,
      response,
      challenge,
      userName
    );
    console.log("res", res);
    await context.state.session.set("login", userName);
    context.response.status = 200;
  } catch (e) {
    if (e instanceof AuthenticationNotVerifiedError) {
      context.response.status = 401;
      context.response.body = JSON.stringify({
        message: "not verified",
      });
      return;
    }
    throw e;
  }
});
router.get("/session", async (context) => {
  const name = await context.state.session.get("login");
  if (name == null) {
    context.response.status = 401;
    context.response.body = JSON.stringify({
      message: "not authenticated",
    });
    return;
  }
  context.response.status = 200;
  context.response.body = JSON.stringify({
    name,
  });
});
router.delete("/session", async (context) => {
  await context.state.session.deleteSession();
  context.response.status = 200;
});
router.post("/credential/new", async (context) => {
  const { name: userName } = await context.request.body({ type: "json" }).value;
  try {
    const options = await createCredential(rpID, userName);
    await context.state.session.flash("challenge", options.challenge);
    await context.state.session.flash("userName", userName);
    context.response.status = 200;
    context.response.body = JSON.stringify(options);
  } catch (e) {
    if (e instanceof UserAlreadyExistsError) {
      context.response.status = 400;
      context.response.body = JSON.stringify({
        message: "User already exists",
      });
      return;
    }
    throw e;
  }
});
router.post("/credential", async (context) => {
  const response = await context.request.body({ type: "json" }).value;
  const challenge = await context.state.session.get("challenge");
  const userName = await context.state.session.get("userName");
  try {
    if (challenge == null || userName == null) {
      throw new RegistrationNotVerifiedError();
    }
    await register(rpID, expectedOrigin, response, challenge, userName);
    await context.state.session.set("login", userName);
    context.response.status = 200;
  } catch (e) {
    if (e instanceof RegistrationNotVerifiedError) {
      context.response.status = 401;
      context.response.body = JSON.stringify({
        message: "not verified",
      });
      return;
    }
    throw e; // TODO: catch されて 500 になる？
  }
});

routerWithAuth.delete("/credential", async (context) => {
  const userName = await context.state.session.get("login");
  if (userName == null) {
    context.response.status = 401;
    context.response.body = JSON.stringify({
      message: "not authenticated",
    });
    return;
  }
  await deleteCredential(userName);
  await context.state.session.deleteSession();
  context.response.status = 200;
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
app.use(Session.initMiddleware());
app.use(async (context, next) => {
  try {
    await next();
  } catch (e) {
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
await app.listen({ port: 8000 });
