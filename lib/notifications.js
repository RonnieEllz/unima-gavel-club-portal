export function buildNotificationMessage(type, title) {
  const cleanTitle = typeof title === 'string' ? title.trim() : '';
  const safeTitle = cleanTitle || 'a club update';

  if (type === 'story') return `A new story was published: ${safeTitle}`;
  if (type === 'meeting') return `A new meeting has been posted: ${safeTitle}`;
  return `A new update was posted: ${safeTitle}`;
}
