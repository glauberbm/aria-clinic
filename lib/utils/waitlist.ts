import { WaitlistEntry } from "@/lib/store/scheduler";

/**
 * Get the next patient in FIFO order from pending waitlist entries
 * @param waitlist Array of waitlist entries
 * @returns The first pending patient or null
 */
export const getNextWaitlistPatient = (waitlist: WaitlistEntry[]): WaitlistEntry | null => {
  const next = waitlist
    .filter((w) => w.status === "pending")
    .sort((a, b) => a.addedAt - b.addedAt)[0];
  return next || null;
};

/**
 * Filter waitlist entries by status
 * @param waitlist Array of waitlist entries
 * @param status Status to filter by
 * @returns Filtered entries sorted by FIFO order
 */
export const getWaitlistByStatus = (
  waitlist: WaitlistEntry[],
  status: string
): WaitlistEntry[] => {
  return waitlist
    .filter((w) => w.status === status)
    .sort((a, b) => a.addedAt - b.addedAt);
};

/**
 * Verify FIFO ordering of waitlist entries
 * @param entries Array of waitlist entries
 * @returns true if entries are in FIFO order, false otherwise
 */
export const verifyFIFOOrder = (entries: WaitlistEntry[]): boolean => {
  for (let i = 0; i < entries.length - 1; i++) {
    if (entries[i].addedAt > entries[i + 1].addedAt) {
      return false;
    }
  }
  return true;
};

/**
 * Search waitlist entries by patient name
 * @param waitlist Array of waitlist entries
 * @param query Search query (case-insensitive)
 * @returns Matching entries
 */
export const searchWaitlistByPatient = (
  waitlist: WaitlistEntry[],
  query: string
): WaitlistEntry[] => {
  const lowerQuery = query.toLowerCase();
  return waitlist.filter((e) =>
    e.patientName.toLowerCase().includes(lowerQuery)
  );
};

/**
 * Calculate waitlist statistics
 * @param waitlist Array of waitlist entries
 * @returns Object with stats
 */
export const calculateWaitlistStats = (
  waitlist: WaitlistEntry[]
): {
  total: number;
  pending: number;
  offered: number;
  accepted: number;
  declined: number;
  averageWaitTimeMs?: number;
} => {
  const stats = {
    total: waitlist.length,
    pending: 0,
    offered: 0,
    accepted: 0,
    declined: 0,
  };

  for (const entry of waitlist) {
    stats[entry.status]++;
  }

  // Calculate average wait time for pending entries
  const pendingEntries = waitlist.filter((e) => e.status === "pending");
  let averageWaitTimeMs: number | undefined;

  if (pendingEntries.length > 0) {
    const now = Date.now();
    const totalWaitTime = pendingEntries.reduce(
      (sum, entry) => sum + (now - entry.addedAt),
      0
    );
    averageWaitTimeMs = Math.round(totalWaitTime / pendingEntries.length);
  }

  return {
    ...stats,
    ...(averageWaitTimeMs !== undefined && { averageWaitTimeMs }),
  };
};
