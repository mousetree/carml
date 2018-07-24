const express = require("express");
const bodyParser = require("body-parser");
const { google } = require("googleapis");

const keysEnvVar = process.env["CREDS"];
if (!keysEnvVar) {
  throw new Error("The $CREDS environment variable was not found!");
}
const keys = JSON.parse(keysEnvVar);
const authClient = google.auth.fromJSON(keys);
const ml = google.ml({
  version: "v1"
});
authClient.scopes = ["https://www.googleapis.com/auth/cloud-platform"];
authClient.authorize();

const MODEL = "projects/cardamageautomldemo/models/car_damage";

const app = express();
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use("/", express.static("app"));
app.post("/api/process", handler);

async function handler(req, res) {
  try {
    const prediction = await predict(req.body.content);
    res.send({ status: "No damage from backend", prediction });
  } catch (e) {
    res.send({ status: "Something went wrong" });
  }
}

async function predict(b64img) {
  console.log("Attempting to predict...");
  const params = {
    auth: authClient,
    name: MODEL,
    // payload: { image: { imageBytes: b64img } }
    resource: {
      instances: [{ key: "0", image_bytes: { b64: b64img } }]
    }
  };

  return new Promise((reject, resolve) => {
    ml.projects.predict(params, (err, result) => {
      if (err) {
        console.error(err.errors);
        reject(err);
      } else {
        console.log(result.predictions[0]);
        resolve(result.predictions[0]);
      }
    });
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`CarML listening on port ${PORT}...`));
