export function list(participants: readonly string[]): string {
  if (participants.length === 0) {
    return "";
  }

  if (participants.length === 1) {
    return participants[0];
  }

  const head = [...participants];
  const tail = head.pop()!;
  return head.join(", ") + " and " + tail;
}

export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}
