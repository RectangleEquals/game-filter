export default function setSession(name, value, maxAge, domain, path, expires)
{
  let cookie = {};
  cookie.name = encodeURIComponent(name);
  cookie.value = encodeURIComponent(value);
  cookie.maxAge = maxAge;
  cookie.domain = domain
  cookie.path = path;

  if (expires) {
    const date = new Date(expires);
    cookie.expires = date.toUTCString();
  }

  sessionStorage.setItem(name, JSON.stringify(cookie));
}