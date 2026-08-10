export function comparePatchVersions(a: string, b: string): number {
  if (a === b) {
    return 0;
  }

  if (a === "Unknown") {
    return 1;
  }

  if (b === "Unknown") {
    return -1;
  }

  const [aMajor = 0, aMinor = 0] = a.split(".").map(Number);
  const [bMajor = 0, bMinor = 0] = b.split(".").map(Number);

  if (aMajor !== bMajor) {
    return bMajor - aMajor;
  }

  return bMinor - aMinor;
}
