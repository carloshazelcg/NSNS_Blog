export async function onRequest(context) {
  const { env, request } = context;
  
  const object = await env.MY_BUCKET.get('IMG_0340.MP4');

  if (!object) {
    return new Response("Video no encontrado", { status: 404 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.etag);
  headers.set('accept-ranges', 'bytes');

  return new Response(object.body, {
    headers,
  });
}