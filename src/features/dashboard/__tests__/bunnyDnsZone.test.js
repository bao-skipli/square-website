import test from "node:test";
import assert from "node:assert/strict";
import {
  DNS_RECORD_TYPES,
  getRecordTypeLabel,
  resolveRecordType,
  filterSafeMigrationRecords,
  cleanRecordHost,
  parseBulkDnsText,
  deepScanDomain,
} from "../../../../agent/clients/bunnyDns.js";
import {
  getZoneRecordsService,
  scanDomainRecordsService,
  importSelectedRecordsService,
  createRecordService,
  deleteRecordService,
  batchDeleteRecordsService,
  parseBulkRecordsService,
} from "../../../../agent/services/domainService.js";

test("resolveRecordType maps string labels and numeric codes reliably", () => {
  assert.equal(resolveRecordType("A"), 0);
  assert.equal(resolveRecordType("AAAA"), 1);
  assert.equal(resolveRecordType("CNAME"), 2);
  assert.equal(resolveRecordType("TXT"), 3);
  assert.equal(resolveRecordType("MX"), 4);
  assert.equal(resolveRecordType("PULL_ZONE"), 7);
  assert.equal(resolveRecordType(7), 7);
  assert.equal(resolveRecordType("Unknown"), 0);
});

test("getRecordTypeLabel returns human readable names", () => {
  assert.equal(getRecordTypeLabel(0), "A");
  assert.equal(getRecordTypeLabel(2), "CNAME");
  assert.equal(getRecordTypeLabel(3), "TXT");
  assert.equal(getRecordTypeLabel(4), "MX");
  assert.equal(getRecordTypeLabel(7), "PullZone (PZ)");
});

test("cleanRecordHost strips apex domain and normalizes root @", () => {
  assert.equal(cleanRecordHost("@", "jobsnow.id.vn"), "");
  assert.equal(cleanRecordHost("", "jobsnow.id.vn"), "");
  assert.equal(cleanRecordHost("jobsnow.id.vn.", "jobsnow.id.vn"), "");
  assert.equal(cleanRecordHost("mail.jobsnow.id.vn.", "jobsnow.id.vn"), "mail");
  assert.equal(cleanRecordHost("sub.domain", "domain"), "sub");
});

test("filterSafeMigrationRecords isolates conflicting web records from safe email/TXT records", () => {
  const scanned = [
    { Name: "", Type: DNS_RECORD_TYPES.MX, Value: "mail.google.com", Priority: 10 },
    { Name: "google._domainkey", Type: DNS_RECORD_TYPES.TXT, Value: "v=DKIM1..." },
    { Name: "", Type: DNS_RECORD_TYPES.A, Value: "192.0.2.1" },
    { Name: "www", Type: DNS_RECORD_TYPES.CNAME, Value: "old-hosting.com" },
    { Name: "blog", Type: DNS_RECORD_TYPES.CNAME, Value: "sub.example.com" },
  ];

  const result = filterSafeMigrationRecords(scanned);

  assert.equal(result.safe.length, 3); // MX, TXT, and blog CNAME
  assert.equal(result.conflictingWeb.length, 2); // Root A and www CNAME

  // Safe records should be selected by default
  assert.equal(result.safe[0].selectedByDefault, true);
  assert.equal(result.safe[1].selectedByDefault, true);

  // Conflicting records should NOT be selected by default
  assert.equal(result.conflictingWeb[0].selectedByDefault, false);
  assert.equal(result.conflictingWeb[1].selectedByDefault, false);
});

test("parseBulkDnsText parses BIND zone format, table format, and JSON accurately", () => {
  // 1. BIND zone format
  const bindText = `
jobsnow.id.vn. 3600 IN MX 10 s129d209.emailserver.vn.
jobsnow.id.vn. 3600 IN TXT "v=spf1 mx include:emailserver.vn -all"
mail 300 CNAME s129d209.emailserver.vn.
_dmarc 3600 TXT "v=DMARC1; p=none;"
`;
  const bindRes = parseBulkDnsText(bindText, "jobsnow.id.vn");
  assert.equal(bindRes.records.length, 4);
  assert.equal(bindRes.records[0].typeLabel, "MX");
  assert.equal(bindRes.records[0].Priority, 10);
  assert.equal(bindRes.records[1].typeLabel, "TXT");
  assert.equal(bindRes.records[1].Value, "v=spf1 mx include:emailserver.vn -all");
  assert.equal(bindRes.records[2].Name, "mail");

  // 2. Tabular format copied from registrar web dashboards
  const tableText = `
A\t@\t216.198.79.1\t3600
MX\t@\ts129d209.emailserver.vn\t10\t3600
CNAME\tcpanel\ts129d209.emailserver.vn\t300
`;
  const tableRes = parseBulkDnsText(tableText, "jobsnow.id.vn");
  assert.equal(tableRes.records.length, 3);
  assert.equal(tableRes.records[0].typeLabel, "MX");
  assert.equal(tableRes.records[1].typeLabel, "CNAME");
  assert.equal(tableRes.records[1].Name, "cpanel");
  assert.equal(tableRes.records[2].typeLabel, "A");

  // 3. JSON format
  const jsonText = JSON.stringify([
    { type: "TXT", name: "@", value: "v=spf1 ~all" },
    { type: "CNAME", name: "autodiscover", value: "mail.server.vn" },
  ]);
  const jsonRes = parseBulkDnsText(jsonText, "jobsnow.id.vn");
  assert.equal(jsonRes.records.length, 2);
  assert.equal(jsonRes.records[1].Name, "autodiscover");
  // 4. Registrar CSV format (Mắt Bão / cPanel export)
  const csvText = `Host,Type,Data,TTL
@,A,216.198.79.1,3600
autoconfig,CNAME,s129d209.emailserver.vn.,3600
autodiscover,CNAME,s129d209.emailserver.vn.,3600
cpanel,CNAME,s129d209.emailserver.vn.,3600
cpcalendars,CNAME,s129d209.emailserver.vn.,3600
cpcontacts,CNAME,s129d209.emailserver.vn.,3600
mail,CNAME,s129d209.emailserver.vn.,3600
webmail,CNAME,s129d209.emailserver.vn.,3600
@,MX,0 s129d209.emailserver.vn.,3600
send,MX,10 feedback-smtp.ap-northeast-1.amazonses.com.,3600
@,TXT,"""v=spf1 mx include:emailserver.vn include:spf.protection.outlook.com -all""",3600
_dmarc,TXT,"""v=DMARC1; p=none;""",3600
resend._domainkey,TXT,"""p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC6X9EdmN/P760LUAOMVtA70MjEjMKtVyTyztHzmh6Nafw1fVeSN5Vm2p93RNgcW5WORSd6qJl9qOvzkYZT5SDadGxjexxkdese1uoe1NJe2ly3wY5DEZKN2UgBk3Mcduqjuv6vP15kCv8xt7KH7VI4j0zRENBc3sXtTnZE8aPpXwIDAQAB""",3600
send,TXT,"""v=spf1 include:amazonses.com ~all""",3600
@,NS,ns2.matbao.vn.|ns1.matbao.vn.,3600
_autodiscover._tcp,SRV,0 0 443 s129d209.emailserver.vn.,3600`;

  const csvRes = parseBulkDnsText(csvText, "jobsnow.id.vn");
  assert.equal(csvRes.total, 16);
  assert.equal(csvRes.safeRecords.length, 14);
  assert.equal(csvRes.conflictingRecords.length, 2);

  const srvRec = csvRes.records.find((r) => r.typeLabel === "SRV");
  assert.ok(srvRec, "Should parse SRV record");
  assert.equal(srvRec.Port, 443);
  assert.equal(srvRec.Priority, 0);
  assert.equal(srvRec.Weight, 0);
  assert.equal(srvRec.Value, "s129d209.emailserver.vn");

  const sendMx = csvRes.records.find((r) => r.Name === "send" && r.typeLabel === "MX");
  assert.ok(sendMx, "Should parse send MX");
  assert.equal(sendMx.Priority, 10);
  assert.equal(sendMx.Value, "feedback-smtp.ap-northeast-1.amazonses.com");

  const dkim = csvRes.records.find((r) => r.Name === "resend._domainkey");
  assert.ok(dkim, "Should parse resend._domainkey");
  assert.ok(dkim.Value.startsWith("p=MIGfMA"));
});

test("Domain service handles simulated zone 998877 scan, import, and CRUD", async () => {
  const zoneId = 998877;

  // 1. Fetch initial records
  const initialRecords = await getZoneRecordsService({ zoneId });
  assert.equal(initialRecords.success, true);
  assert.ok(initialRecords.records.length >= 2);

  // 2. Scan domain records
  const scanRes = await scanDomainRecordsService({ zoneId, domain: "testbrand.com" });
  assert.equal(scanRes.success, true);
  assert.ok(scanRes.safeRecords.length > 0);
  assert.ok(scanRes.conflictingRecords.length > 0);

  // 3. Import selected safe records
  const importRes = await importSelectedRecordsService({
    zoneId,
    records: scanRes.safeRecords,
  });
  assert.equal(importRes.success, true);
  assert.equal(importRes.importedCount, scanRes.safeRecords.length);

  // 4. Create a new custom record manually
  const createRes = await createRecordService({
    zoneId,
    record: {
      type: DNS_RECORD_TYPES.TXT,
      name: "_custom-verify",
      value: "square-verify-token-12345",
      ttl: 300,
    },
  });
  assert.equal(createRes.success, true);
  assert.ok(createRes.record.Id);

  // 5. Delete record
  const deleteRes = await deleteRecordService({
    zoneId,
    recordId: createRes.record.Id,
  });
  assert.equal(deleteRes.success, true);

  // 6. Test batchDeleteRecordsService
  const batchDelRes = await batchDeleteRecordsService({
    zoneId,
    recordIds: [initialRecords.records[0].Id],
  });
  assert.equal(batchDelRes.success, true);
  assert.equal(batchDelRes.deletedCount, 1);

  // 7. Test parseBulkRecordsService
  const bulkRes = await parseBulkRecordsService({
    rawText: "MX @ mail.server.vn 10 3600",
    domain: "testbrand.com",
  });
  assert.equal(bulkRes.success, true);
  assert.equal(bulkRes.records.length, 1);
});

test("deepScanDomain directly probes Mắt Bão for jobsnow.id.vn and retrieves active records", async () => {
  const scan = await deepScanDomain("jobsnow.id.vn", { customNs: "ns1.matbao.vn" });
  assert.equal(scan.success, true);
  assert.ok(scan.records.length >= 14, `Expected at least 14 records, got ${scan.records.length}`);

  const hasMx = scan.records.some((r) => r.typeLabel === "MX" && r.Value.includes("emailserver.vn"));
  const hasSpf = scan.records.some((r) => r.typeLabel === "TXT" && r.Value.includes("v=spf1"));
  const hasDmarc = scan.records.some((r) => r.Name === "_dmarc");
  const hasSrv = scan.records.some((r) => r.typeLabel === "SRV" && r.Name === "_autodiscover._tcp");
  const hasDkim = scan.records.some((r) => r.Name === "resend._domainkey");
  const hasSendMx = scan.records.some((r) => r.Name === "send" && r.typeLabel === "MX");

  assert.equal(hasMx, true, "Should discover MX record");
  assert.equal(hasSpf, true, "Should discover SPF TXT record");
  assert.equal(hasDmarc, true, "Should discover _dmarc TXT record");
  assert.equal(hasSrv, true, "Should discover SRV _autodiscover._tcp record");
  assert.equal(hasDkim, true, "Should discover resend._domainkey TXT record");
  assert.equal(hasSendMx, true, "Should discover send subdomain MX record");
});

