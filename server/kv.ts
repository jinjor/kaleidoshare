const kvPath: string | undefined = Deno.env.get("KV_PATH");

export async function openKv(): Promise<Deno.Kv> {
  return await Deno.openKv(kvPath); // TODO: ここだけであることを保証する
}
