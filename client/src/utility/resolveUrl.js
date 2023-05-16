import { URL } from 'url';

export default function resolveUrl(...paths) {
  const url = new URL(paths.shift());

  paths.forEach((path) => {
    if (path.startsWith('/')) {
      path = path.substring(1);
    }
    if (path.endsWith('/')) {
      path = path.substring(0, path.length - 1);
    }
    url.pathname = url.pathname.endsWith('/') ? url.pathname + path : `${url.pathname}/${path}`;
  });

  return url.toString();
}
