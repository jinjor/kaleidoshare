import { Application, Router } from "https://deno.land/x/oak@v12.4.0/mod.ts";

const router = new Router();
router.get("/api/user", (context) => {
  context.response.body = JSON.stringify({
    name: "John Doe",
  });
});

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());
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
