export async function onRequest(context) {
  const { env, request } = context;
  
  const rangeHeader = request.headers.get('range');
  
  const object = await env.MY_BUCKET.get('IMG_0340.MP4', {
    range: rangeHeader ? rangeHeader : undefined,
  });

  if (!object) {
    return new Response("Video no encontrado", { status: 404 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.etag);
  headers.set('accept-ranges', 'bytes');

  let status = 200;

  if (object.range) {
    status = 206;
    headers.set(
      'content-range',
      `bytes ${object.range.offset}-${object.range.offset + object.range.length - 1}/${object.size}`
    );
    headers.set('content-length', object.range.length);
  } else {
    headers.set('content-length', object.size);
  }

  return new Response(object.body, {
    status,
    headers,
  });
}