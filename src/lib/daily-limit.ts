const STORAGE_KEY = 'tarot-daily-limit';

interface DailyRecord {
  date: string;
  used: boolean;
}

function getTodayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function canDrawToday(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return true;
    const record: DailyRecord = JSON.parse(raw);
    return record.date !== getTodayStr() || !record.used;
  } catch {
    return true;
  }
}

export function markDrawUsed(): void {
  const record: DailyRecord = { date: getTodayStr(), used: true };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
}

export function getRemainingDraws(): number {
  return canDrawToday() ? 1 : 0;
}
