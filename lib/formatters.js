/**
 * Format number to Indonesian Rupiah (e.g. Rp10.950.000)
 * @param {number|string} amount
 * @returns {string}
 */
export function formatCurrency(amount) {
  const num = Number(amount) || 0;
  return 'Rp' + num.toLocaleString('id-ID');
}

/**
 * Format to compact Rupiah (e.g. Rp10,95 JT)
 * @param {number|string} amount
 * @returns {string}
 */
export function formatCompactCurrency(amount) {
  const num = Number(amount) || 0;
  if (num >= 1000000) {
    const jt = num / 1000000;
    const formatted = jt.toLocaleString('id-ID', {
      minimumFractionDigits: jt % 1 === 0 ? 0 : 1,
      maximumFractionDigits: 2,
    });
    return `Rp${formatted} JT`;
  }
  return formatCurrency(num);
}

/**
 * Format percentage with Indonesian decimal comma (e.g. 21,9%)
 * @param {number} value
 * @param {number} decimals
 * @returns {string}
 */
export function formatPercentage(value, decimals = 1) {
  const num = Number(value) || 0;
  const clamped = Math.max(0, num);
  const formatted = clamped.toLocaleString('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
  return `${formatted}%`;
}

/**
 * Format date into Indonesian standard "05 Okt 2026"
 * @param {string|Date} dateInput
 * @returns {string}
 */
export function formatDate(dateInput) {
  if (!dateInput) return '-';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);

    const day = String(d.getDate()).padStart(2, '0');
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
      'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
    ];
    const month = months[d.getMonth()];
    const year = d.getFullYear();

    return `${day} ${month} ${year}`;
  } catch {
    return String(dateInput);
  }
}

/**
 * Format input string YYYY-MM-DD for standard html date input
 * @param {string|Date} dateInput
 * @returns {string}
 */
export function toISODate(dateInput) {
  if (!dateInput) return new Date().toISOString().split('T')[0];
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return new Date().toISOString().split('T')[0];
  return d.toISOString().split('T')[0];
}
