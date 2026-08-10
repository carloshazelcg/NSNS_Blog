export async function onRequest(context) {
  const { env, request } = context;
  
  const rangeHeader = request.headers.get('range');
  let options = {};

  if (rangeHeader) {
    const parts = rangeHeader.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    
    const headObj = await env.MY_BUCKET.head('IMG_0340.MP4');
    if (!headObj) {
      return new Response("Video no encontrado", { status: 404 });
    }
    
    const totalSize = headObj.size;
    const end = parts[1] ? parseInt(parts[1], 10) : totalSize - 1;
    const chunkLength = (end - start) + 1;

    options = {
      range: {
        offset: start,
        length: chunkLength,
      },
    };
  }

  const object = await env.MY_BUCKET.get('IMG_0340.MP4', options);

  if (!object) {
    return new Response("Video no encontrado", { status: 404 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.etag);
  headers.set('accept-ranges', 'bytes');
  headers.set('content-type', 'video/mp4');

  let status = 200;

  if (object.range) {
    status = 206;
    const start = object.range.offset;
    const length = object.range.length;
    const total = object.size;
    
    headers.set('content-range', `bytes ${start}-${start + length - 1}/${total}`);
    headers.set('content-length', length);
  } else {
    headers.set('content-length', object.size);
  }

  return new Response(object.body, {
    status,
    headers,
  });
}