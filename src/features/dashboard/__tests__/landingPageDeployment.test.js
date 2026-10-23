import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import os from "os";
import AdmZip from "adm-zip";
import { getMimeType } from "../../../../agent/bunnyClient.js";

test("getMimeType correctly detects all landing page assets", () => {
  assert.equal(getMimeType("index.html"), "text/html; charset=utf-8");
  assert.equal(getMimeType("landing.htm"), "text/html; charset=utf-8");
  assert.equal(getMimeType("css/styles.css"), "text/css; charset=utf-8");
  assert.equal(getMimeType("js/bundle.js"), "application/javascript; charset=utf-8");
  assert.equal(getMimeType("assets/hero.webp"), "image/webp");
  assert.equal(getMimeType("img/banner.jpg"), "image/jpeg");
  assert.equal(getMimeType("icons/logo.svg"), "image/svg+xml");
  assert.equal(getMimeType("fonts/inter.woff2"), "font/woff2");
});

test("AdmZip extracts flat zip package with index.html correctly", () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "landing-test-"));
  try {
    const zip = new AdmZip();
    zip.addFile("index.html", Buffer.from("<!DOCTYPE html><html><body><h1>Landing</h1></body></html>", "utf-8"));
    zip.addFile("styles.css", Buffer.from("body { color: red; }", "utf-8"));

    const zipBuffer = zip.toBuffer();
    assert.ok(zipBuffer.length > 0);

    const extractZip = new AdmZip(zipBuffer);
    extractZip.extractAllTo(tmpDir, true);

    assert.ok(fs.existsSync(path.join(tmpDir, "index.html")));
    assert.ok(fs.existsSync(path.join(tmpDir, "styles.css")));
    const content = fs.readFileSync(path.join(tmpDir, "index.html"), "utf-8");
    assert.ok(content.includes("Landing"));
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test("AdmZip nested single directory auto-flattening logic works", () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "landing-nested-"));
  try {
    const zip = new AdmZip();
    zip.addFile("my-campaign/index.html", Buffer.from("<h1>Nested Campaign</h1>", "utf-8"));
    zip.addFile("my-campaign/logo.svg", Buffer.from("<svg></svg>", "utf-8"));

    const zipBuffer = zip.toBuffer();
    const extractZip = new AdmZip(zipBuffer);
    extractZip.extractAllTo(tmpDir, true);

    // Apply auto-flattening logic
    const directIndex = path.join(tmpDir, "index.html");
    if (!fs.existsSync(directIndex)) {
      const entries = fs.readdirSync(tmpDir);
      const subdirs = entries.filter((e) => {
        const p = path.join(tmpDir, e);
        return fs.existsSync(p) && fs.statSync(p).isDirectory();
      });
      if (subdirs.length === 1 && fs.existsSync(path.join(tmpDir, subdirs[0], "index.html"))) {
        const innerDir = path.join(tmpDir, subdirs[0]);
        const innerItems = fs.readdirSync(innerDir);
        for (const item of innerItems) {
          fs.renameSync(path.join(innerDir, item), path.join(tmpDir, item));
        }
        fs.rmdirSync(innerDir);
      }
    }

    assert.ok(fs.existsSync(path.join(tmpDir, "index.html")), "index.html must be flattened to root");
    assert.ok(fs.existsSync(path.join(tmpDir, "logo.svg")), "logo.svg must be flattened to root");
    const content = fs.readFileSync(path.join(tmpDir, "index.html"), "utf-8");
    assert.ok(content.includes("Nested Campaign"));
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test("Single HTML landing page buffer write resolves as index.html", () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "landing-html-"));
  try {
    const htmlContent = "<html><body><h1>Direct HTML Landing</h1></body></html>";
    const fileBuffer = Buffer.from(htmlContent, "utf-8");

    // Write to stagingDir/index.html
    fs.writeFileSync(path.join(tmpDir, "index.html"), fileBuffer);

    assert.ok(fs.existsSync(path.join(tmpDir, "index.html")));
    const read = fs.readFileSync(path.join(tmpDir, "index.html"), "utf-8");
    assert.equal(read, htmlContent);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test("cleanStaleStorageFiles correctly identifies obsolete files and directories", async () => {
  const { cleanStaleStorageFiles } = await import("../../../../agent/bunnyClient.js");

  // Mock global fetch for this unit test
  const originalFetch = globalThis.fetch;
  const deletedPaths = [];

  globalThis.fetch = async (url, options) => {
    const urlStr = String(url);
    if (options?.method === "DELETE") {
      deletedPaths.push(urlStr);
      return { ok: true, status: 200, text: async () => "" };
    }

    if (options?.method === "GET") {
      // Root listing
      if (urlStr.endsWith("/test-zone/")) {
        return {
          ok: true,
          status: 200,
          json: async () => [
            { ObjectName: "index.html", IsDirectory: false },
            { ObjectName: "assets", IsDirectory: true },
            { ObjectName: "old-banner.png", IsDirectory: false },
          ],
        };
      }
      // Subdirectory listing for assets/
      if (urlStr.endsWith("/test-zone/assets/")) {
        return {
          ok: true,
          status: 200,
          json: async () => [
            { ObjectName: "new-main.js", IsDirectory: false },
            { ObjectName: "stale-chunk.js", IsDirectory: false },
          ],
        };
      }
    }

    return { ok: true, status: 200, json: async () => [] };
  };

  try {
    // Scenario 1: Deploying a landing page that only has index.html
    deletedPaths.length = 0;
    const res1 = await cleanStaleStorageFiles({
      storageZoneName: "test-zone",
      storagePassword: "test-pass",
      activeFilesList: ["index.html"],
    });

    assert.equal(res1.deletedCount, 2);
    assert.ok(deletedPaths.some((p) => p.includes("/test-zone/assets/")));
    assert.ok(deletedPaths.some((p) => p.includes("/test-zone/old-banner.png")));
    assert.ok(!deletedPaths.some((p) => p.includes("/test-zone/index.html")));

    // Scenario 2: Deploying Storefront that uses assets/new-main.js and index.html
    deletedPaths.length = 0;
    const res2 = await cleanStaleStorageFiles({
      storageZoneName: "test-zone",
      storagePassword: "test-pass",
      activeFilesList: ["index.html", "assets/new-main.js"],
    });

    assert.equal(res2.deletedCount, 2);
    assert.ok(deletedPaths.some((p) => p.includes("/test-zone/old-banner.png")));
    assert.ok(deletedPaths.some((p) => p.includes("/test-zone/assets/stale-chunk.js")));
    assert.ok(!deletedPaths.some((p) => p.includes("/test-zone/assets/new-main.js")));
  } finally {
    globalThis.fetch = originalFetch;
  }
});

