const { google } = require("googleapis");
const path = require("path");

const SCOPES = ["https://www.googleapis.com/auth/drive"]; //

// Use environment variable for credentials path (more secure)
const KEYFILEPATH = path.join(__dirname, "../../credentials.json");

const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: SCOPES,
});

const drive = google.drive({ version: "v3", auth });

module.exports = drive;