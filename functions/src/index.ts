import * as functions from "firebase-functions";
import {collectStatuses} from "./statuses/statuses.js";

export const statuses = functions
  .runWith({secrets: ["CRON_CONTROLLER", "MAIL_PWD"]})
  .pubsub.schedule("every 15 minutes")
  .onRun(collectStatuses);
