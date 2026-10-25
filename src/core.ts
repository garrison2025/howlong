export type CivilDate = { year: number; month: number; day: number };
export type ClockParts = CivilDate & { hour: number; minute: number; second: number };
export type Unit = 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years';
export const FIXED_UNITS = { seconds: 1, minutes: 60, hours: 3600, days: 86400, weeks: 604800 } as const;
const DAY = 86400000;
const formatters = new Map<string, Intl.DateTimeFormat>();

export function parseDate(value: string): CivilDate {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) throw new Error('Enter a complete date (YYYY-MM-DD).');
  const year = Number(match[1]), month = Number(match[2]), day = Number(match[3]);
  if (year < 100 || year > 9999 || month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)) throw new Error('Enter a valid date between years 0100 and 9999.');
  return { year, month, day };
}

export function dateISO(date: CivilDate): string {
  return `${String(date.year).padStart(4, '0')}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function dateEpoch(date: CivilDate): number { return Date.UTC(date.year, date.month - 1, date.day); }
export function fromEpoch(epoch: number): CivilDate {
  const date = new Date(epoch);
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() };
}

export function addDays(date: CivilDate, days: number): CivilDate {
  if (!Number.isInteger(days)) throw new Error('Calendar days must be a whole number.');
  const result = fromEpoch(dateEpoch(date) + days * DAY);
  if (result.year < 100 || result.year > 9999) throw new Error('The resulting date is outside years 0100–9999.');
  return result;
}

export function addMonths(date: CivilDate, months: number): CivilDate {
  if (!Number.isInteger(months)) throw new Error('Calendar months must be a whole number.');
  const index = date.year * 12 + date.month - 1 + months;
  const year = Math.floor(index / 12), month = ((index % 12) + 12) % 12 + 1;
  if (year < 100 || year > 9999) throw new Error('The resulting date is outside years 0100–9999.');
  return { year, month, day: Math.min(date.day, daysInMonth(year, month)) };
}

export function zonedParts(epoch: number, zone: string): ClockParts {
  let formatter = formatters.get(zone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-GB', { timeZone: zone, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
    formatters.set(zone, formatter);
  }
  const parts = Object.fromEntries(formatter.formatToParts(epoch).map(p => [p.type, p.value]));
  return { year: Number(parts.year), month: Number(parts.month), day: Number(parts.day), hour: Number(parts.hour), minute: Number(parts.minute), second: Number(parts.second) };
}

function wallStamp(p: ClockParts): number { return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second); }

/** Finds both instants in a repeated hour. Missing hours move forward by the DST gap. */
export function wallTimes(date: CivilDate, hour: number, minute: number, zone: string): { instants: number[]; adjusted: boolean } {
  if (!Number.isInteger(hour) || hour < 0 || hour > 23 || !Number.isInteger(minute) || minute < 0 || minute > 59) throw new Error('Enter a valid clock time.');
  const desired = Date.UTC(date.year, date.month - 1, date.day, hour, minute);
  const offsets = new Set<number>();
  for (let h = -48; h <= 48; h += 6) {
    const probe = desired + h * 3600000;
    offsets.add(wallStamp(zonedParts(probe, zone)) - probe);
  }
  const candidates = [...offsets].map(offset => desired - offset);
  const exact = candidates.filter(epoch => wallStamp(zonedParts(epoch, zone)) === desired).sort((a,b) => a-b);
  if (exact.length) return { instants: exact, adjusted: false };
  const forward = candidates.map(epoch => ({epoch, delta: wallStamp(zonedParts(epoch, zone)) - desired})).filter(x => x.delta > 0).sort((a,b) => a.delta-b.delta);
  if (!forward[0]) throw new Error('This local time cannot be resolved in the selected time zone.');
  return { instants: [forward[0].epoch], adjusted: true };
}

export function nextClock(now: number, hour: number, minute: number, zone: string, day: 'next' | 'today' | 'tomorrow' = 'next'): { epoch: number; adjusted: boolean; repeated: boolean; date: CivilDate; passed: boolean } {
  const today = zonedParts(now, zone);
  let date: CivilDate = day === 'tomorrow' ? addDays(today, 1) : today;
  let result = wallTimes(date, hour, minute, zone);
  let instant = result.instants.find(epoch => epoch >= now);
  if (day === 'today' && instant === undefined) return {epoch:result.instants[result.instants.length-1]!,adjusted:result.adjusted,repeated:result.instants.length>1,date,passed:true};
  if (instant === undefined) {
    date = addDays(date, 1);
    result = wallTimes(date, hour, minute, zone);
    instant = result.instants[0]!;
  }
  return {epoch:instant, adjusted:result.adjusted,repeated:result.instants.length>1,date,passed:false};
}

export function durationParts(milliseconds: number): { days: number; hours: number; minutes: number; seconds: number } {
  const s = Math.max(0, Math.ceil(milliseconds / 1000));
  return {days:Math.floor(s / 86400),hours:Math.floor(s / 3600) % 24,minutes:Math.floor(s / 60) % 60,seconds:s % 60};
}

export function fixedSeconds(value: number, unit: Unit): number {
  if (!Number.isFinite(value) || Math.abs(value) > 1e12) throw new Error('Enter a finite number no greater than 1 trillion in magnitude.');
  if (!(unit in FIXED_UNITS)) throw new Error('Months and years need a calendar start date.');
  return value * FIXED_UNITS[unit as keyof typeof FIXED_UNITS];
}

export function calendarEnd(start: CivilDate, value: number, unit: Unit): CivilDate {
  if (!Number.isInteger(value) || Math.abs(value) > 1000000) throw new Error('Use a whole number within ±1,000,000 for calendar calculations.');
  if (unit === 'months' || unit === 'years') return addMonths(start, value * (unit === 'years' ? 12 : 1));
  if (unit === 'weeks' || unit === 'days') return addDays(start, value * (unit === 'weeks' ? 7 : 1));
  throw new Error('Calendar mode accepts days, weeks, months and years.');
}

export function businessDays(start: CivilDate, count: number, options: {includeStart?: boolean; weekend?: number[]; excluded?: string[]} = {}): {end: CivilDate; steps: {date: string; counted: boolean; reason: string; number: number}[]} {
  if (!Number.isInteger(count) || Math.abs(count) > 10000) throw new Error('Enter a whole number between −10,000 and 10,000 business days.');
  const weekend = new Set(options.weekend ?? [0,6]);
  if (weekend.size >= 7) throw new Error('At least one weekday must remain a working day.');
  const excluded = new Set((options.excluded ?? []).map(x => dateISO(parseDate(x))));
  if (count === 0) return {end:start,steps:[]};
  const direction = Math.sign(count), target = Math.abs(count), steps = [];
  let cursor = start, done = 0;
  if (!options.includeStart) cursor = addDays(cursor,direction);
  while (done < target) {
    const iso = dateISO(cursor), day = new Date(dateEpoch(cursor)).getUTCDay();
    const reason = weekend.has(day) ? 'Weekend' : excluded.has(iso) ? 'Excluded date' : 'Business day';
    const counted = reason === 'Business day';
    if (counted) done++;
    steps.push({date:iso,counted,reason,number:done});
    if (done < target) cursor = addDays(cursor,direction);
    if (steps.length > 80000) throw new Error('This rule combination requires too many dates.');
  }
  return {end:cursor,steps};
}

export function dateDifference(start: CivilDate, end: CivilDate): { years: number; months: number; days: number; totalDays: number; future: boolean } {
  const future = dateEpoch(start) > dateEpoch(end);
  const a = future ? end : start, b = future ? start : end;
  let months = (b.year-a.year)*12+b.month-a.month;
  if (dateEpoch(addMonths(a,months)) > dateEpoch(b)) months--;
  const cursor = addMonths(a,months);
  return {years:Math.floor(months/12),months:months%12,days:Math.round((dateEpoch(b)-dateEpoch(cursor))/DAY),totalDays:Math.round((dateEpoch(b)-dateEpoch(a))/DAY),future};
}

export function thanksgiving(year: number): CivilDate {
  const first = new Date(Date.UTC(year,10,1)).getUTCDay();
  return {year,month:11,day:1+((4-first+7)%7)+21};
}

export function holidayTarget(now: number, holiday: 'halloween' | 'thanksgiving', zone: string): {epoch: number; date: CivilDate; adjusted: boolean} {
  const today = zonedParts(now, zone);
  let year = today.year;
  let date = holiday === 'halloween' ? {year,month:10,day:31} : thanksgiving(year);
  let target = wallTimes(date,0,0,zone);
  if (target.instants[0]! < now) {
    year++;
    date = holiday === 'halloween' ? {year,month:10,day:31} : thanksgiving(year);
    target = wallTimes(date,0,0,zone);
  }
  return {epoch:target.instants[0]!,date,adjusted:target.adjusted};
}

export function formatNumber(n: number): string { return new Intl.NumberFormat('en-US',{maximumFractionDigits:8}).format(n); }
export function prettyDate(date: CivilDate): string { return new Intl.DateTimeFormat('en-US',{dateStyle:'full',timeZone:'UTC'}).format(dateEpoch(date)); }
