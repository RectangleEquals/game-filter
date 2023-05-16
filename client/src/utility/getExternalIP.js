export default async function getExternalIP()
{
  let strExternalIP = "http://localhost";

  try{
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    strExternalIP = data.ip;
  } catch(err) {
    console.warn(`[getExternalIP]: ${err}`);
  }

  // Return the fully resolved URL
  return strExternalIP;
}