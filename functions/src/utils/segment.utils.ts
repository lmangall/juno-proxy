import type {
  CronJobs,
  SegmentStatus,
} from "../../declarations/observatory/observatory.did.js";

const CYCLES_MIN_THRESHOLD = 500_000_000_000n as const;

export const lowCycles = ({
  status: {status, id},
  type,
  cron_jobs,
}: {
  status: SegmentStatus;
  cron_jobs: CronJobs;
  type: "mission_control" | "satellite" | "orbiter";
}): boolean => {
  const hasLowCycles = (threshold: bigint): boolean => {
    const minThreshold =
      threshold > CYCLES_MIN_THRESHOLD ? threshold : CYCLES_MIN_THRESHOLD;

    return status.cycles < minThreshold;
  };

  const defaultThreshold = cron_jobs.statuses.cycles_threshold[0] ?? 0n;

  if (type === "satellite") {
    const customConfig = cron_jobs.statuses.satellites.find(
      ([satelliteId]) => satelliteId.toString() === id.toText(),
    );

    return hasLowCycles(
      customConfig !== undefined
        ? customConfig[1].cycles_threshold[0] ?? defaultThreshold
        : defaultThreshold,
    );
  }

  if (type === "orbiter") {
    const customConfig = cron_jobs.statuses.orbiters.find(
      ([orbiterId]) => orbiterId.toString() === id.toText(),
    );

    return hasLowCycles(
      customConfig !== undefined
        ? customConfig[1].cycles_threshold[0] ?? defaultThreshold
        : defaultThreshold,
    );
  }

  return hasLowCycles(
    cron_jobs.statuses.mission_control_cycles_threshold[0] ?? defaultThreshold,
  );
};
