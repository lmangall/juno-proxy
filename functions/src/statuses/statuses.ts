import type {EventContext} from "firebase-functions";
import {observatoryActor} from "../utils/actor.utils.js";

export const collectStatuses = async (_context: EventContext) => {
  try {
    const actor = await observatoryActor();
    const statuses = await actor.collect_statuses({collected_after: []});

    console.log(statuses);
  } catch (err: unknown) {
    console.error(err);
  }

  return null;
};
