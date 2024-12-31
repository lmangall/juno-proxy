import * as functionsV1 from "firebase-functions/v1";
import {collectStatuses} from "./statuses/statuses.js";

export const statuses = functionsV1
  .runWith({secrets: ["CRON_CONTROLLER", "MAIL_PWD"]})
  .pubsub.schedule("every 15 minutes")
  .onRun(collectStatuses);
