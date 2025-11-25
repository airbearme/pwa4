export const onRequestGet: PagesFunction = async () => {
  return new Response(JSON.stringify({ ok: true, env: "pages-functions" }), {
    headers: { "content-type": "application/json" },
  });
};
