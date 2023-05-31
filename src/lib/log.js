function formatDateTime(date) {
  const formattedDate = date.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    hourCycle: 'h12'
  });

  const datePart = formattedDate.slice(0, formattedDate.indexOf(','));
  const timePart = formattedDate.slice(formattedDate.indexOf(',') + 1);

  return `${datePart.trim()} (${timePart.trim().toLowerCase()})`;
}

function info(message) {
  const formattedDate = formatDateTime(new Date());
  console.info(`[${formattedDate}]: ${message}`);
}

function warning(message) {
  const formattedDate = formatDateTime(new Date());
  console.warn(`[${formattedDate}]: ${message}`);
}

function error(message) {
  const formattedDate = formatDateTime(new Date());
  console.error(`[${formattedDate}]: ${message}`);
}

module.exports = { info, warning, error };