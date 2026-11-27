const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function money(amount) {
  const text = Number(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return '₹' + text;
}

function plural(count, word) {
  if (count === 1) {
    return count + ' ' + word;
  }
  return count + ' ' + word + 's';
}

function shortDate(date) {
  if (!date) {
    return 'No date';
  }
  const month = Number(date.slice(5, 7));
  const day = date.slice(8, 10);
  return MONTH_NAMES[month - 1].slice(0, 3) + ' ' + day;
}

function today() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return now.getFullYear() + '-' + month + '-' + day;
}

function statusName(status) {
  if (status === 'manager_approved') {
    return 'With finance';
  }
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function makeBadge(status) {
  const badge = document.createElement('span');
  badge.className = 'badge ' + status;
  badge.textContent = statusName(status);
  return badge;
}
