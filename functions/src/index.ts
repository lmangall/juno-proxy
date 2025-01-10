import {initializeApp} from "firebase-admin/app";
import * as functionsV1 from "firebase-functions/v1";
import {app} from "./app.js";
import {collectStatuses} from "./statuses/statuses.js";

initializeApp();

const runtimeOpts = {
  timeoutSeconds: 30,
};

export const statuses = functionsV1
  .runWith({secrets: ["CRON_CONTROLLER", "MAIL_PWD"]})
  .pubsub.schedule("every 15 minutes")
  .onRun(collectStatuses);

export const observatory = functionsV1
  .region("europe-west6")
  .runWith(runtimeOpts)
  .https.onRequest(app);
