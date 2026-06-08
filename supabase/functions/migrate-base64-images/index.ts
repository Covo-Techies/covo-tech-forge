import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async () => {
  const sb = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const { data: rows, error } = await sb
    .from("products")
    .select("id, image_url")
    .like("image_url", "data:%");
  if (error) return new Response(JSON.stringify({ error }), { status: 500 });

  const results: unknown[] = [];
  for (const r of rows ?? []) {
    const m = (r.image_url as string).match(/^data:(image\/[a-zA-Z0-9+]+);base64,(.+)$/);
    if (!m) { results.push({ id: r.id, skipped: true }); continue; }
    const mime = m[1];
    const ext = mime.split("/")[1].replace("jpeg", "jpg").replace("svg+xml", "svg");
    const bin = Uint8Array.from(atob(m[2]), (c) => c.charCodeAt(0));
    const path = `products/${r.id}.${ext}`;
    const up = await sb.storage.from("product-images").upload(path, bin, {
      contentType: mime, upsert: true,
    });
    if (up.error) { results.push({ id: r.id, error: up.error.message }); continue; }
    const { data: pub } = sb.storage.from("product-images").getPublicUrl(path);
    const upd = await sb.from("products").update({ image_url: pub.publicUrl }).eq("id", r.id);
    results.push({ id: r.id, url: pub.publicUrl, updateError: upd.error?.message });
  }
  return new Response(JSON.stringify({ results }), {
    headers: { "content-type": "application/json" },
  });
});
