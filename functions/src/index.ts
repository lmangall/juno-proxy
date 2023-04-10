import * as functions from "firebase-functions";
import {collectStatuses} from "./statuses/statuses.js";

export const statuses = functions
  .runWith({secrets: ["CRON_CONTROLLER"]})
  .pubsub.schedule("every 1 minutes")
  .onRun(collectStatuses);
