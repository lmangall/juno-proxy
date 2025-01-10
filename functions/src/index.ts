import {initializeApp} from "firebase-admin/app";
import * as functionsV1 from "firebase-functions/v1";
import {app} from "./app.js";

initializeApp();

const runtimeOpts = {
  timeoutSeconds: 30,
};

export const observatory = functionsV1
  .region("europe-west6")
  .runWith(runtimeOpts)
  .https.onRequest(app);
