const ALLOWED_TEAM_COUNTS = [4, 6, 8] as const;
const MAX_TEAM_NAME_LENGTH = 32;

export function normalizeTeamName(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

export function validateTeamCount(teamCount: number) {
  if (!ALLOWED_TEAM_COUNTS.includes(teamCount as (typeof ALLOWED_TEAM_COUNTS)[number])) {
    throw new Error('Team count must be 4, 6, or 8.');
  }
}

export function validateMutableTeamCount(teamCount: number) {
  if (teamCount < 4 || teamCount > 8) {
    throw new Error('Team count must stay between 4 and 8.');
  }
}

export function validateTeamNames(names: string[], expectedCount?: number) {
  const normalized = names.map(normalizeTeamName);

  if (expectedCount !== undefined && normalized.length !== expectedCount) {
    throw new Error(`Expected ${expectedCount} team names.`);
  }

  if (normalized.some((name) => name.length === 0)) {
    throw new Error('Team names cannot be empty.');
  }

  if (normalized.some((name) => name.length > MAX_TEAM_NAME_LENGTH)) {
    throw new Error(`Team names must be ${MAX_TEAM_NAME_LENGTH} characters or fewer.`);
  }

  const keys = normalized.map((name) => name.toLowerCase());
  if (new Set(keys).size !== keys.length) {
    throw new Error('Team names must be unique.');
  }

  return normalized;
}
