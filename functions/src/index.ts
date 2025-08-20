import {onRequest} from "firebase-functions/v2/https";
import {initializeApp} from "firebase-admin/app";
import {app} from "./app.js";

initializeApp();

export const observatory = onRequest(
  {
    region: "europe-west6",
    timeoutSeconds: 30,
  },
  app
);
