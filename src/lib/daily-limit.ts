const STORAGE_KEY = 'tarot-daily-limit';

interface DailyRecord {
  date: string;
  used: boolean;
}

function getTodayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function canDrawToday(): boolean {
  // 开发者模式：无限次抽牌，始终允许抽牌
  return true;
}

export function markDrawUsed(): void {
  const record: DailyRecord = { date: getTodayStr(), used: true };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
}

export function getRemainingDraws(): number {
  return canDrawToday() ? 1 : 0;
}
