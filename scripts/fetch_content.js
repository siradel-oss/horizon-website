#!/usr/bin/env node
"use strict";

import http from "node:http";
import https from "node:https";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execSync } from "node:child_process";

const DEFAULT_DOCUMENTATION_URL = "";
const DEFAULT_GALLERY_URL = "";

const HTTP_RE = /^https?:\/\//i;

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith("https") ? https : http;
    const file = fs.createWriteStream(destPath);
    proto
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode} for ${url}`));
          return;
        }
        res.pipe(file);
        file.on("finish", () => file.close(resolve));
      })
      .on("error", (err) => {
        fs.unlink(destPath, () => {});
        reject(err);
      });
  });
}

function extractArchive(archivePath, extractDir) {
  console.log("Extracting archive:", archivePath);
  fs.mkdirSync(extractDir, { recursive: true });
  execSync(`tar -xzf "${archivePath}" -C "${extractDir}"`);
}

async function downloadExtractArchive(archiveUrl, tmpDir, extractDirName) {
  console.log("Downloading and extracting archive from:", archiveUrl);
  const extractDir = path.join(tmpDir, extractDirName);
  fs.mkdirSync(extractDir, { recursive: true });
  const archiveName = path.basename(new URL(archiveUrl).pathname);
  const archivePath = path.join(tmpDir, archiveName);
  await downloadFile(archiveUrl, archivePath);
  extractArchive(archivePath, extractDir);
}

function copyDirRecursive(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcEntry = path.join(src, entry.name);
    const dstEntry = path.join(dst, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcEntry, dstEntry);
    } else {
      fs.copyFileSync(srcEntry, dstEntry);
    }
  }
}

function extractGalleryData(galleryPath) {
  console.log("Extracting gallery data from:", galleryPath);

  const dstDataPath = "data/gallery";
  const dstStaticPath = "static/gallery";

  fs.rmSync(dstDataPath, { recursive: true, force: true });
  fs.rmSync(dstStaticPath, { recursive: true, force: true });

  fs.mkdirSync(dstDataPath, { recursive: true });
  for (const entry of fs.readdirSync(galleryPath)) {
    if (entry.endsWith(".json")) {
      fs.copyFileSync(
        path.join(galleryPath, entry),
        path.join(dstDataPath, entry),
      );
    }
  }

  fs.mkdirSync(dstStaticPath, { recursive: true });
  for (const dir of ["assets", "scene", "source"]) {
    copyDirRecursive(
      path.join(galleryPath, dir),
      path.join(dstStaticPath, dir),
    );
  }
}

function extractDocumentationData(docPath) {
  console.log("Extracting documentation data from:", docPath);

  const dstDocPath = "content/doc";

  fs.rmSync(dstDocPath, { recursive: true, force: true });
  copyDirRecursive(docPath, dstDocPath);
  fs.copyFileSync(path.join(docPath, "version.json"), "data/version.json");
}

function parseArgs() {
  const args = process.argv.slice(2);
  let doc = DEFAULT_DOCUMENTATION_URL;
  let gallery = DEFAULT_GALLERY_URL;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--doc" && args[i + 1]) doc = args[++i];
    else if (args[i] === "--gallery" && args[i + 1]) gallery = args[++i];
  }
  return { doc, gallery };
}

async function main() {
  if (!fs.existsSync("scripts/fetch_content.js")) {
    throw new Error(
      "This script must be executed from the root of the repository.",
    );
  }

  const { doc, gallery } = parseArgs();
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "fetch-content-"));

  try {
    if (HTTP_RE.test(doc)) {
      await downloadExtractArchive(doc, tmpDir, "doc");
    } else {
      extractArchive(doc, path.join(tmpDir, "doc"));
    }

    if (HTTP_RE.test(gallery)) {
      await downloadExtractArchive(gallery, tmpDir, "gallery");
    } else {
      extractArchive(gallery, path.join(tmpDir, "gallery"));
    }

    extractGalleryData(path.join(tmpDir, "gallery"));
    extractDocumentationData(path.join(tmpDir, "doc"));
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
