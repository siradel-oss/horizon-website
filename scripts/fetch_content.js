#!/usr/bin/env node
"use strict";

import http from "node:http";
import https from "node:https";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execSync } from "node:child_process";

const HTTP_RE = /^https?:\/\//i;

const MAX_REDIRECTS = 10;

function requestWithRedirects(url, redirectsLeft = MAX_REDIRECTS) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith("https") ? https : http;
    const req = proto.get(
      url,
      {
        headers: {
          "User-Agent": "horizon-website-fetch-content",
          Accept: "*/*",
        },
      },
      (res) => {
        const { statusCode, headers } = res;
        if (statusCode >= 300 && statusCode < 400 && headers.location) {
          res.resume();
          if (redirectsLeft === 0) {
            reject(new Error(`Too many redirects for ${url}`));
            return;
          }
          const next = new URL(headers.location, url).toString();
          resolve(requestWithRedirects(next, redirectsLeft - 1));
          return;
        }
        if (statusCode !== 200) {
          res.resume();
          reject(new Error(`HTTP ${statusCode} for ${url}`));
          return;
        }
        resolve(res);
      },
    );
    req.on("error", reject);
  });
}

async function downloadFile(url, destPath) {
  const res = await requestWithRedirects(url);
  await new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    res.pipe(file);
    res.on("error", reject);
    file.on("error", reject);
    file.on("finish", () =>
      file.close((err) => (err ? reject(err) : resolve())),
    );
  }).catch((err) => {
    fs.rmSync(destPath, { force: true });
    throw err;
  });
}

function extractArchive(archivePath, extractDir) {
  const absArchive = path.resolve(archivePath);
  console.log("Extracting archive:", absArchive);
  fs.mkdirSync(extractDir, { recursive: true });
  execSync(
    `tar -xzf "${path.basename(absArchive)}" -C "${path.resolve(extractDir)}"`,
    {
      cwd: path.dirname(absArchive),
    },
  );
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
  let doc = null;
  let gallery = null;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--doc" && args[i + 1]) doc = args[++i];
    else if (args[i] === "--gallery" && args[i + 1]) gallery = args[++i];
  }
  return { doc, gallery };
}

async function fetchLatestUrls() {
  const latestReleaseApiUrl =
    "https://api.github.com/repos/siradel-oss/horizon/releases/latest";
  const manifest = await fetch(latestReleaseApiUrl, {
    headers: {
      "User-Agent": "horizon-website-fetch-content",
      Accept: "application/vnd.github.v3+json",
    },
  }).then((res) => res.json());

  console.log(`Latest version is: ${manifest.name}`);

  function findAssetUrl(assetPartialName) {
    const asset = manifest.assets.find((a) =>
      a.name.includes(assetPartialName),
    );
    if (!asset) {
      throw new Error(
        `Asset with name containing "${assetPartialName}" not found in latest release.`,
      );
    }
    return asset.browser_download_url;
  }

  return {
    doc: findAssetUrl("horizon-documentation"),
    gallery: findAssetUrl("horizon-gallery"),
  };
}

async function main() {
  if (!fs.existsSync("scripts/fetch_content.js")) {
    throw new Error(
      "This script must be executed from the root of the repository.",
    );
  }

  let { doc, gallery } = parseArgs();
  if (doc === null || gallery === null) {
    const { doc: latestDoc, gallery: latestGallery } = await fetchLatestUrls();
    doc = doc || latestDoc;
    gallery = gallery || latestGallery;
  }
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
