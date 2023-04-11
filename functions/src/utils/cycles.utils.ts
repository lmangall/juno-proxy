export const formatNumber = (
  value: number,
  options?: {minFraction: number; maxFraction: number},
): string => {
  const {minFraction = 2, maxFraction = 2} = options || {};

  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: minFraction,
    maximumFractionDigits: maxFraction,
  })
    .format(value)
    .replace(/\s/g, "’")
    .replace(",", ".");
};

const ONE_TRILLION = 1_000_000_000_000;

export const formatTCycles = (cycles: bigint): string =>
  formatNumber(Number(cycles) / Number(ONE_TRILLION), {
    minFraction: 3,
    maxFraction: 3,
  });
