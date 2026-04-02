/**
 * Neutraliza payloads de CSV injection (formula injection) para Excel/Sheets.
 * Si el primer caracter no-espacio es = + - @ o control chars, se prefija con apostrofe.
 */
export const sanitizeCSVCell = (value) => {
  if (value === null || value === undefined) return '';

  if (typeof value === 'number') return value;

  const text = String(value).replace(/\u0000/g, '');
  const trimmedStart = text.replace(/^\s+/, '');
  const firstChar = trimmedStart.charAt(0);
  const isDangerous = ['=', '+', '-', '@', '\t', '\r', '\n'].includes(firstChar);

  return isDangerous ? `'${text}` : text;
};
