export function summarizeMembershipStatus(rows) {
  const summary = { total: 0, active: 0, pending: 0, inactive: 0, rejected: 0 };

  for (const row of rows ?? []) {
    const status = row?.membership_status;
    if (!status) continue;
    summary.total += 1;
    if (status in summary) summary[status] += 1;
  }

  return summary;
}
