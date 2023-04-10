import {observatoryActor} from "../utils/actor.utils.js";
import {filterStatuses} from "../utils/status.utils";

export const collectStatuses = async () => {
  try {
    const now = BigInt(Date.now() * 1e6);
    const oneMin = 60_000_000_000n;

    const actor = await observatoryActor();
    const statuses = await actor.collect_statuses({
      collected_after: [now - oneMin],
    });

    console.log("Statuses collected: ", statuses.filter(filterStatuses));
  } catch (err: unknown) {
    console.error(err);
  }

  return null;
};
