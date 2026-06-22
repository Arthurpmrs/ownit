export function parseDate(value: string): Date {
  return new Date(value);
}

// ISO-8601 duration
export function parseDuration(value: string): string {
  if (!value) return '00:00:00';

  const isoMatch = value.match(
    /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?))?S?/,
  );
  
  if (isoMatch) {
    const [, hours = '0', minutes = '0', seconds = '0'] = isoMatch;

    const h = parseInt(hours, 10);
    const m = parseInt(minutes, 10);
    const s = parseInt(seconds, 10);

    const pad = (num: number) => String(num).padStart(2, '0');

    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  }

  return '00:00:00';
}

export function durationToIso(value: string): string {
  const [hoursStr, minutesStr] = value.split(':');

  const hours = Number(hoursStr);
  const minutes = Number(minutesStr);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    throw new Error(`Invalid duration: ${value}`);
  }

  let result = 'PT';

  if (hours > 0) {
    result += `${hours}H`;
  }

  if (minutes > 0) {
    result += `${minutes}M`;
  }

  return result === 'PT' ? 'PT0M' : result;
}

export function formatDuration(seconds: number): string {
  const totalMinutes = Math.round(seconds / 60);

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes} min`;
  }

  if (minutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes} min`;
}
