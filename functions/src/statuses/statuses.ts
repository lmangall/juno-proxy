import {observatoryActor} from "../utils/actor.utils.js";
import {filterStatuses} from "../utils/status.utils.js";

export const collectStatuses = async () => {
  try {
    const oneMin = 60_000_000_000n;

    const actor = await observatoryActor();
    const statuses = await actor.collect_statuses({
      time_delta: [oneMin],
    });

    console.log("Statuses collected: ", statuses.filter(filterStatuses));
  } catch (err: unknown) {
    console.error(err);
  }

  return null;
};
