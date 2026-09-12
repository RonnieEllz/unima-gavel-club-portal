import { createClient } from "@/lib/supabase/server";

export type AuditData = Record<string, unknown> | null;

export async function recordAuditEvent(input: {
  action: string;
  entityType: string;
  entityId?: string;
  beforeData?: AuditData;
  afterData?: AuditData;
  reason?: string;
}) {
  const supabase = createClient();
  const { error } = await supabase.rpc("record_audit_event", {
    event_action: input.action,
    event_entity_type: input.entityType,
    event_entity_id: input.entityId ?? null,
    event_before_data: input.beforeData ?? null,
    event_after_data: input.afterData ?? null,
    event_reason: input.reason ?? null,
  });

  if (error) {
    console.error("Audit event failed", error);
    return { error };
  }

  return { success: true as const };
}
