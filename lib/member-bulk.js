export function normalizeBulkMemberIds(ids) {
  const seen = new Set();
  return ids
    .filter((value) => typeof value === 'string')
    .map((value) => value.trim())
    .filter((value) => {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
      if (!isUuid || seen.has(value)) return false;
      seen.add(value);
      return true;
    });
}

export function isValidMembershipStatus(value) {
  return ['pending', 'active', 'inactive', 'rejected', 'alumni'].includes(value);
}
