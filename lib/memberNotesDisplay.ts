/** Parse legacy "Emergency Contact:" / Name / Relationship / Phone block from notes. */
export function parseEmergencyContactFromNotes(notes: string): {
  name: string;
  relationship: string;
  phone: string;
} | null {
  if (!notes?.trim() || !/emergency contact\s*:/i.test(notes)) {
    return null;
  }
  const fromHeader = notes.slice(notes.search(/emergency contact\s*:/i));
  const nameM = fromHeader.match(/^Name:\s*(.+)$/im);
  const relM = fromHeader.match(/^Relationship:\s*(.+)$/im);
  const phoneM = fromHeader.match(/^Phone:\s*(.+)$/im);
  const name = (nameM?.[1] ?? '').trim();
  const relationship = (relM?.[1] ?? '').trim();
  const phone = (phoneM?.[1] ?? '').trim();
  if (!name && !relationship && !phone) {
    return null;
  }
  return { name, relationship, phone };
}

/** Prefer model fields; if empty, fall back to legacy block embedded in notes. */
export function resolveEmergencyContact(member: {
  notes?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_relationship?: string | null;
  emergency_contact_phone?: string | null;
}): { name: string; relationship: string; phone: string } {
  const name = (member.emergency_contact_name ?? '').trim();
  const relationship = (member.emergency_contact_relationship ?? '').trim();
  const phone = (member.emergency_contact_phone ?? '').trim();
  if (name || relationship || phone) {
    return { name, relationship, phone };
  }
  const parsed = parseEmergencyContactFromNotes(member.notes || '');
  if (parsed) {
    return parsed;
  }
  return { name: '', relationship: '', phone: '' };
}

/**
 * Removes a pasted "Emergency Contact:" block from free-text notes so it does not
 * duplicate structured emergency fields on the profile (common in migrated data).
 */
export function stripEmergencyContactBlockFromNotes(raw: string): string {
  const lines = raw.split(/\r?\n/);
  const out: string[] = [];
  let skipping = false;

  for (const line of lines) {
    const t = line.trim();

    if (!skipping && /^emergency contact\s*:/i.test(t)) {
      skipping = true;
      continue;
    }

    if (skipping) {
      if (t === '') {
        continue;
      }
      if (/^(name|relationship|phone)\s*:/i.test(t)) {
        continue;
      }
      skipping = false;
    }

    out.push(line);
  }

  return out
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
