export const MIN_TEAM_COUNT = 2;
export const MAX_TEAM_COUNT = 8;
const MAX_TEAM_NAME_LENGTH = 32;

export function normalizeTeamName(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

export function isAllowedTeamCount(teamCount: number) {
  return Number.isInteger(teamCount) && teamCount >= MIN_TEAM_COUNT && teamCount <= MAX_TEAM_COUNT;
}

export function validateTeamCount(teamCount: number) {
  if (!isAllowedTeamCount(teamCount)) {
    throw new Error(`Team count must be between ${MIN_TEAM_COUNT} and ${MAX_TEAM_COUNT}.`);
  }
}

export function validateMutableTeamCount(teamCount: number) {
  if (!isAllowedTeamCount(teamCount)) {
    throw new Error(`Team count must stay between ${MIN_TEAM_COUNT} and ${MAX_TEAM_COUNT}.`);
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
