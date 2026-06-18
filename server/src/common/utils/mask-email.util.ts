export function maskEmail(email?: string): string {
  if (!email) return 'Unknown Email';

  const [name, domain] = email.split('@');

  if (!name || !domain) {
    return email;
  }

  let visibleLength = 1;

  if (name.length <= 2) {
    visibleLength = 1;
  } else if (name.length <= 4) {
    visibleLength = 2;
  } else if (name.length <= 6) {
    visibleLength = 3;
  } else if (name.length <= 10) {
    visibleLength = 4;
  } else {
    visibleLength = 5;
  }

  const visiblePart = name.slice(0, visibleLength);

  const hiddenLength = Math.max(
    name.length - visibleLength - 2,
    0,
  );

  const end =
    name.length > visibleLength
      ? name.slice(-2)
      : '';

  return `${visiblePart}${'*'.repeat(
    hiddenLength,
  )}${end}@${domain}`;
}