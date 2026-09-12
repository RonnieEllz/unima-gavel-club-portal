export function normalizeAnnouncementInput(value) {
  const text = typeof value === 'string' ? value.trim() : '';
  return {
    text,
    valid: text.length > 0 && text.length <= 500,
  };
}
