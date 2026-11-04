// insights.js
// Opt-in, local-only usage insights: time and visits per domain, per day.
// Only the helpers below live here, so they can be tested without a browser.
// The collecting itself is in background.js.

var INSIGHTS_VERSION = 1;
// Never credit more than this between two checks (a closed laptop, a stalled worker).
var INSIGHTS_MAX_GAP_MS = 90 * 1000;
var INSIGHTS_DEFAULT_RETENTION_DAYS = 90;

/** Local calendar day as 'YYYY-MM-DD'. */
function insightsDayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * The site a page belongs to: the host name without "www.", and nothing else.
 * No path, no query, no title. Anything that is not http(s) is ignored.
 */
function insightsDomainFromUrl(url) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
    const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
    return host || null;
  } catch {
    return null;
  }
}

function emptyInsights() {
  return { v: INSIGHTS_VERSION, days: {} };
}

function insightsEnsureDay(insights, dayKey) {
  if (!insights.days[dayKey]) {
    insights.days[dayKey] = { sites: {}, blocks: { total: 0, byReason: {}, bySite: {} } };
  }
  return insights.days[dayKey];
}

function insightsAddTime(insights, dayKey, domain, ms) {
  if (!domain || !(ms > 0)) return insights;
  const day = insightsEnsureDay(insights, dayKey);
  const site = day.sites[domain] || (day.sites[domain] = { ms: 0, visits: 0 });
  site.ms += Math.round(ms);
  return insights;
}

function insightsAddVisit(insights, dayKey, domain) {
  if (!domain) return insights;
  const day = insightsEnsureDay(insights, dayKey);
  const site = day.sites[domain] || (day.sites[domain] = { ms: 0, visits: 0 });
  site.visits += 1;
  return insights;
}

function insightsAddBlock(insights, dayKey, domain, reason) {
  const day = insightsEnsureDay(insights, dayKey);
  day.blocks.total += 1;
  const why = reason || 'unknown';
  day.blocks.byReason[why] = (day.blocks.byReason[why] || 0) + 1;
  if (domain) day.blocks.bySite[domain] = (day.blocks.bySite[domain] || 0) + 1;
  return insights;
}

/** Drop every day older than keepDays (today counts as day one). */
function insightsPrune(insights, todayKey, keepDays = INSIGHTS_DEFAULT_RETENTION_DAYS) {
  const [y, m, d] = todayKey.split('-').map(Number);
  const cutoff = new Date(y, m - 1, d - (Math.max(1, keepDays) - 1), 12);
  const cutoffKey = insightsDayKey(cutoff);
  for (const key of Object.keys(insights.days)) {
    if (key < cutoffKey) delete insights.days[key];
  }
  return insights;
}

/**
 * Time is counted with checkpoints. The tracker remembers which site was being
 * viewed and since when. At each checkpoint the time that passed is credited to
 * that site, and the tracker moves on to whatever is being viewed now (or to
 * nothing, when the window is not focused, the user is idle, or the tab is private).
 */
function advanceTracker(tracker, currentDomain, now) {
  let credit = null;
  if (tracker && tracker.domain && tracker.since > 0) {
    const elapsed = Math.min(Math.max(now - tracker.since, 0), INSIGHTS_MAX_GAP_MS);
    if (elapsed > 0) credit = { domain: tracker.domain, ms: elapsed };
  }
  return {
    tracker: { domain: currentDomain || null, since: currentDomain ? now : 0 },
    credit
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    INSIGHTS_VERSION, INSIGHTS_MAX_GAP_MS, INSIGHTS_DEFAULT_RETENTION_DAYS,
    insightsDayKey, insightsDomainFromUrl, emptyInsights, insightsAddTime,
    insightsAddVisit, insightsAddBlock, insightsPrune, advanceTracker
  };
}
