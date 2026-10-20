import test from "node:test";
import assert from "node:assert/strict";
import {
  cleanDomainName,
  isValidDomain,
  domainToKey,
  keyToDomain,
} from "../../../services/onlineStoreService.js";
import { getMimeType } from "../../../../agent/bunnyClient.js";

test("cleanDomainName normalizes URLs and hostnames correctly", () => {
  assert.equal(cleanDomainName("https://shop.mybrand.com/"), "shop.mybrand.com");
  assert.equal(cleanDomainName("http://SHOP.MYBRAND.COM"), "shop.mybrand.com");
  assert.equal(cleanDomainName("https://mybrand.com/path?foo=bar"), "mybrand.com");
  assert.equal(cleanDomainName("   mybrand.com:8080/  "), "mybrand.com");
  assert.equal(cleanDomainName(""), "");
  assert.equal(cleanDomainName(null), "");
});

test("isValidDomain validates RFC 1035 / FQDN format accurately", () => {
  // Valid domains
  assert.equal(isValidDomain("shop.mybrand.com"), true);
  assert.equal(isValidDomain("mybrand.com"), true);
  assert.equal(isValidDomain("sub.domain.co.uk"), true);
  assert.equal(isValidDomain("store-123.example.org"), true);

  // Invalid domains
  assert.equal(isValidDomain(""), false);
  assert.equal(isValidDomain(null), false);
  assert.equal(isValidDomain("localhost"), false); // No TLD dot
  assert.equal(isValidDomain("mybrand"), false);
  assert.equal(isValidDomain("example..com"), false);
  assert.equal(isValidDomain("bad domain.com"), false);
  assert.equal(isValidDomain("-invalid.com"), false);
  assert.equal(isValidDomain("invalid-.com"), false);
});

test("domainToKey and keyToDomain safely encode and decode RTDB keys", () => {
  const original = "shop.mybrand.com";
  const encoded = domainToKey(original);
  assert.equal(encoded, "shop,mybrand,com");
  assert.equal(keyToDomain(encoded), original);
});

test("getMimeType correctly detects static assets Content-Type for Bunny Storage upload", () => {
  assert.equal(getMimeType("index.html"), "text/html; charset=utf-8");
  assert.equal(getMimeType("assets/style.css"), "text/css; charset=utf-8");
  assert.equal(getMimeType("assets/main.js"), "application/javascript; charset=utf-8");
  assert.equal(getMimeType("assets/logo.svg"), "image/svg+xml");
  assert.equal(getMimeType("assets/image.png"), "image/png");
  assert.equal(getMimeType("assets/photo.webp"), "image/webp");
  assert.equal(getMimeType("assets/font.woff2"), "font/woff2");
  assert.equal(getMimeType("unknown.xyz"), "application/octet-stream");
});
