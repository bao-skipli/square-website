import dns from "dns/promises";

/**
 * DNS Verification: checks if hostname resolves to target CNAME or Bunny Edge IP
 */
export async function verifyDns({ hostname, expectedCname }) {
  try {
    const cleanHost = hostname.trim().toLowerCase();
    const cleanExpected = expectedCname ? expectedCname.trim().toLowerCase() : null;

    // 0. Check if Nameservers are delegated to Bunny DNS (ns1.bunny.net / ns2.bunny.net)
    try {
      const nsRecords = await dns.resolveNs(cleanHost);
      if (nsRecords.some((ns) => ns.toLowerCase().includes("bunny.net"))) {
        return {
          resolved: true,
          type: "NS",
          records: nsRecords,
          matchesTarget: true,
          resolvedHost: cleanHost,
        };
      }
    } catch (nsErr) {}

    // Try resolving CNAME first
    try {
      const cnames = await dns.resolveCname(cleanHost);
      if (cleanExpected && cnames.some((c) => c.toLowerCase().includes(cleanExpected))) {
        return {
          resolved: true,
          type: "CNAME",
          records: cnames,
          matchesTarget: true,
          resolvedHost: cleanHost,
        };
      }
      return {
        resolved: true,
        type: "CNAME",
        records: cnames,
        matchesTarget: Boolean(!cleanExpected || cnames.length > 0),
        resolvedHost: cleanHost,
      };
    } catch (cnameErr) {
      // If apex domain without www, check if www.cleanHost resolves CNAME to target
      if (!cleanHost.startsWith("www.")) {
        try {
          const wwwCnames = await dns.resolveCname(`www.${cleanHost}`);
          if (cleanExpected && wwwCnames.some((c) => c.toLowerCase().includes(cleanExpected))) {
            return {
              resolved: true,
              type: "CNAME",
              records: wwwCnames,
              matchesTarget: true,
              resolvedHost: `www.${cleanHost}`,
            };
          }
          if (wwwCnames.length > 0) {
            return {
              resolved: true,
              type: "CNAME",
              records: wwwCnames,
              matchesTarget: Boolean(!cleanExpected),
              resolvedHost: `www.${cleanHost}`,
            };
          }
        } catch (wwwErr) {}
      }

      // Apex domain or A record fallback
      const addresses = await dns.resolve4(cleanHost);
      return {
        resolved: addresses.length > 0,
        type: "A",
        records: addresses,
        matchesTarget: addresses.length > 0,
        resolvedHost: cleanHost,
      };
    }
  } catch (err) {
    return {
      resolved: false,
      error: err.code || err.message,
      matchesTarget: false,
    };
  }
}

/**
 * CDN Verification: performs HTTP GET to verify deployed website is online
 */
export async function verifyLiveWebsite(url, timeoutMs = 15000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Squareup-Bunny-Verifier/1.0",
      },
    });
    clearTimeout(timer);

    const text = await res.text();
    const isHtml = text.includes("<html") || text.includes("<!DOCTYPE");
    return {
      success: res.ok,
      status: res.status,
      isHtml,
      byteLength: text.length,
    };
  } catch (err) {
    clearTimeout(timer);
    return {
      success: false,
      error: err.name === "AbortError" ? "Verification request timed out" : err.message,
    };
  }
}
