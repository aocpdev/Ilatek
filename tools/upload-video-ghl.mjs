// Upload a file to GoHighLevel media storage (/medias/upload-file, multipart/form-data)
// Uses ZJ_GHL_PIT from env or ../tmp-ghl-pit.txt (kept out of chat/git).
// Usage: node tools/upload-video-ghl.mjs <localPath> [name]
import fs from "node:fs";
import path from "node:path";

const API_VERSION = "2021-07-28";
const BASE_URL = "https://services.leadconnectorhq.com";
const LOCATION_ID = "8OxUENFVM60EKzqsTcoD";

let token = process.env.ZJ_GHL_PIT;
try {
  const envTxt = fs.readFileSync(new URL("../tmp-ghl-pit.txt", import.meta.url), "utf8");
  for (const line of envTxt.split("\n")) {
    if (line.startsWith("ZJ_GHL_PIT=")) {
      token = line.slice("ZJ_GHL_PIT=".length).trim();
      break;
    }
  }
} catch {}
if (!token) {
  console.error("No ZJ_GHL_PIT found in env or tmp-ghl-pit.txt");
  process.exit(3);
}

const fileArg = process.argv[2];
const nameArg = process.argv[3];
if (!fileArg) {
  console.error("Usage: node tools/upload-video-ghl.mjs <file> [name]");
  process.exit(1);
}

const buf = fs.readFileSync(fileArg);
const name = nameArg || path.basename(fileArg);
const ext = path.extname(name).toLowerCase();
const mime = ext === ".webm" ? "video/webm" : ext === ".mp4" ? "video/mp4" : "application/octet-stream";

// Build multipart/form-data body (Node 18+ FormData/Blob)
const form = new FormData();
form.append("locationId", LOCATION_ID);
form.append("name", name);
form.append("type", "video");
form.append("file", new Blob([buf], { type: mime }), name);

const res = await fetch(`${BASE_URL}/medias/upload-file`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    Version: API_VERSION,
    Accept: "application/json",
  },
  body: form,
});
const text = await res.text();
console.log(`HTTP ${res.status}: ${text}`);
if (!res.ok) process.exit(2);
