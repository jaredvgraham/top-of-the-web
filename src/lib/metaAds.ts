/**
 * Meta Marketing API helpers for admin ads reporting.
 * Uses FB_AD_TOKEN (+ optional FB_AD_ACCOUNT_ID).
 */

const GRAPH_VERSION = "v21.0";
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;

export type MetaDatePreset =
  | "today"
  | "yesterday"
  | "last_7d"
  | "last_7d_incl_today"
  | "last_14d"
  | "last_28d"
  | "last_30d"
  | "this_month"
  | "last_month";

export type MetaInsightLevel = "account" | "campaign" | "adset" | "ad";

export type MetaAdAccount = {
  id: string;
  accountId: string;
  name: string;
  currency: string;
  timezone: string;
  status: number | null;
};

export type MetaInsightRow = {
  id: string;
  name: string;
  level: MetaInsightLevel;
  impressions: number;
  reach: number;
  clicks: number;
  spend: number;
  cpc: number | null;
  cpm: number | null;
  ctr: number | null;
  purchases: number;
  leads: number;
  purchaseValue: number;
  dateStart: string;
  dateStop: string;
};

export type MetaAdsDashboard = {
  account: MetaAdAccount;
  accounts: MetaAdAccount[];
  datePreset: MetaDatePreset;
  level: MetaInsightLevel;
  dateStart: string;
  dateStop: string;
  summary: {
    spend: number;
    impressions: number;
    reach: number;
    clicks: number;
    purchases: number;
    leads: number;
    purchaseValue: number;
    cpc: number | null;
    cpm: number | null;
    ctr: number | null;
    roas: number | null;
  };
  rows: MetaInsightRow[];
  currency: string;
};

function getToken() {
  return process.env.FB_AD_TOKEN?.trim() || "";
}

export function metaAdsConfigured() {
  return Boolean(getToken());
}

function asNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function actId(raw: string) {
  const cleaned = raw.trim().replace(/^act_/i, "");
  return cleaned ? `act_${cleaned}` : "";
}

/** YYYY-MM-DD in a specific IANA timezone. */
function ymdInTimeZone(date: Date, timeZone: string) {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: timeZone || "UTC",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

function addDaysYmd(ymd: string, days: number) {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

/**
 * Build Meta time_range.
 * Note: Meta's built-in last_7d excludes today — Ads Manager "Last 7 days"
 * usually includes today, so we use an explicit range for last_7d_incl_today.
 */
export function resolveInsightTimeParams(
  preset: MetaDatePreset,
  timeZone: string
): { date_preset?: string; time_range?: string } {
  const today = ymdInTimeZone(new Date(), timeZone || "America/New_York");

  if (preset === "last_7d_incl_today") {
    return {
      time_range: JSON.stringify({
        since: addDaysYmd(today, -6),
        until: today,
      }),
    };
  }

  if (preset === "today") {
    return { time_range: JSON.stringify({ since: today, until: today }) };
  }

  // Pass through Meta presets (last_7d = exclude today)
  return { date_preset: preset === "last_7d" ? "last_7d" : preset };
}

async function graphGet<T>(
  path: string,
  params: Record<string, string> = {}
): Promise<T> {
  const token = getToken();
  if (!token) {
    throw new Error("FB_AD_TOKEN is not configured");
  }

  const url = new URL(
    path.startsWith("http") ? path : `${GRAPH_BASE}/${path.replace(/^\//, "")}`
  );
  for (const [key, value] of Object.entries(params)) {
    if (value) url.searchParams.set(key, value);
  }
  url.searchParams.set("access_token", token);

  const response = await fetch(url.toString(), {
    method: "GET",
    cache: "no-store",
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      typeof payload?.error?.message === "string"
        ? payload.error.message
        : `Meta API error ${response.status}`;
    throw new Error(message);
  }
  return payload as T;
}

type GraphAccount = {
  id?: string;
  account_id?: string;
  name?: string;
  currency?: string;
  timezone_name?: string;
  account_status?: number;
};

function mapAccount(raw: GraphAccount): MetaAdAccount {
  const id = actId(String(raw.id || raw.account_id || ""));
  return {
    id,
    accountId: String(raw.account_id || id.replace(/^act_/, "")),
    name: raw.name || id,
    currency: raw.currency || "USD",
    timezone: raw.timezone_name || "",
    status: typeof raw.account_status === "number" ? raw.account_status : null,
  };
}

export async function listMetaAdAccounts(): Promise<MetaAdAccount[]> {
  const data = await graphGet<{ data?: GraphAccount[] }>("me/adaccounts", {
    fields: "id,account_id,name,currency,timezone_name,account_status",
    limit: "50",
  });
  return (data.data || []).map(mapAccount).filter((a) => Boolean(a.id));
}

export async function resolveMetaAdAccount(
  preferredId?: string
): Promise<{ account: MetaAdAccount; accounts: MetaAdAccount[] }> {
  const accounts = await listMetaAdAccounts();
  if (!accounts.length) {
    throw new Error(
      "No ad accounts found for this token. Check ads_read permission and Business access."
    );
  }

  const envId = actId(process.env.FB_AD_ACCOUNT_ID || "");
  const want = actId(preferredId || "") || envId;
  const account =
    accounts.find(
      (a) => a.id === want || a.accountId === want.replace(/^act_/, "")
    ) || accounts[0];

  return { account, accounts };
}

type GraphInsight = {
  campaign_id?: string;
  campaign_name?: string;
  adset_id?: string;
  adset_name?: string;
  ad_id?: string;
  ad_name?: string;
  account_id?: string;
  account_name?: string;
  impressions?: string;
  reach?: string;
  clicks?: string;
  spend?: string;
  cpc?: string;
  cpm?: string;
  ctr?: string;
  actions?: Array<{ action_type?: string; value?: string }>;
  action_values?: Array<{ action_type?: string; value?: string }>;
  date_start?: string;
  date_stop?: string;
};

/**
 * Meta often returns the same conversion under multiple action_type aliases.
 * Summing them double-counts — pick the best single type instead.
 */
function actionPick(
  actions: Array<{ action_type?: string; value?: string }> | undefined,
  preferredTypes: string[]
) {
  if (!actions?.length) return 0;
  for (const type of preferredTypes) {
    const match = actions.find((a) => a.action_type === type);
    if (match) return asNumber(match.value);
  }
  return 0;
}

function mapInsight(row: GraphInsight, level: MetaInsightLevel): MetaInsightRow {
  const purchases = actionPick(row.actions, [
    "offsite_conversion.fb_pixel_purchase",
    "purchase",
    "omni_purchase",
  ]);
  const leads = actionPick(row.actions, [
    "offsite_conversion.fb_pixel_lead",
    "lead",
    "onsite_conversion.lead_grouped",
  ]);
  const purchaseValue = actionPick(row.action_values, [
    "offsite_conversion.fb_pixel_purchase",
    "purchase",
    "omni_purchase",
  ]);

  let id = "";
  let name = "";
  if (level === "campaign") {
    id = row.campaign_id || "";
    name = row.campaign_name || id || "Campaign";
  } else if (level === "adset") {
    id = row.adset_id || "";
    name = row.adset_name || id || "Ad set";
  } else if (level === "ad") {
    id = row.ad_id || "";
    name = row.ad_name || id || "Ad";
  } else {
    id = row.account_id || "";
    name = row.account_name || "Account";
  }

  return {
    id,
    name,
    level,
    impressions: asNumber(row.impressions),
    reach: asNumber(row.reach),
    clicks: asNumber(row.clicks),
    spend: asNumber(row.spend),
    cpc: row.cpc != null ? asNumber(row.cpc) : null,
    cpm: row.cpm != null ? asNumber(row.cpm) : null,
    ctr: row.ctr != null ? asNumber(row.ctr) : null,
    purchases,
    leads,
    purchaseValue,
    dateStart: row.date_start || "",
    dateStop: row.date_stop || "",
  };
}

const INSIGHT_FIELDS = [
  "campaign_id",
  "campaign_name",
  "adset_id",
  "adset_name",
  "ad_id",
  "ad_name",
  "account_id",
  "account_name",
  "impressions",
  "reach",
  "clicks",
  "spend",
  "cpc",
  "cpm",
  "ctr",
  "actions",
  "action_values",
  "date_start",
  "date_stop",
].join(",");

async function fetchInsightsPages(input: {
  accountId: string;
  level: MetaInsightLevel;
  timeParams: { date_preset?: string; time_range?: string };
}): Promise<MetaInsightRow[]> {
  const accountId = actId(input.accountId);
  const rows: MetaInsightRow[] = [];
  let after: string | undefined;

  do {
    const params: Record<string, string> = {
      fields: INSIGHT_FIELDS,
      level: input.level,
      limit: "100",
      // Match Ads Manager default attribution more closely
      use_unified_attribution_setting: "true",
    };
    if (input.timeParams.date_preset) {
      params.date_preset = input.timeParams.date_preset;
    }
    if (input.timeParams.time_range) {
      params.time_range = input.timeParams.time_range;
    }
    if (after) params.after = after;

    const data = await graphGet<{
      data?: GraphInsight[];
      paging?: { cursors?: { after?: string }; next?: string };
    }>(`${accountId}/insights`, params);

    for (const row of data.data || []) {
      rows.push(mapInsight(row, input.level));
    }

    after = data.paging?.next ? data.paging.cursors?.after : undefined;
  } while (after);

  return rows.sort((a, b) => b.spend - a.spend);
}

export async function loadMetaAdsDashboard(input: {
  accountId?: string;
  datePreset?: MetaDatePreset;
  level?: MetaInsightLevel;
}): Promise<MetaAdsDashboard> {
  const datePreset = input.datePreset || "last_7d_incl_today";
  const level = input.level || "campaign";
  const { account, accounts } = await resolveMetaAdAccount(input.accountId);
  const timeParams = resolveInsightTimeParams(
    datePreset,
    account.timezone || "America/New_York"
  );

  // Account-level row is the source of truth for totals (matches Ads Manager account).
  // Breakdown rows are fetched separately and must not be summed for the summary.
  const [accountRows, breakdownRows] = await Promise.all([
    fetchInsightsPages({
      accountId: account.id,
      level: "account",
      timeParams,
    }),
    level === "account"
      ? Promise.resolve([] as MetaInsightRow[])
      : fetchInsightsPages({
          accountId: account.id,
          level,
          timeParams,
        }),
  ]);

  const accountRow = accountRows[0];
  const rows = level === "account" ? accountRows : breakdownRows;

  const spend = accountRow?.spend ?? 0;
  const impressions = accountRow?.impressions ?? 0;
  const reach = accountRow?.reach ?? 0;
  const clicks = accountRow?.clicks ?? 0;
  const purchases = accountRow?.purchases ?? 0;
  const leads = accountRow?.leads ?? 0;
  const purchaseValue = accountRow?.purchaseValue ?? 0;

  return {
    account,
    accounts,
    datePreset,
    level,
    dateStart: accountRow?.dateStart || rows[0]?.dateStart || "",
    dateStop: accountRow?.dateStop || rows[0]?.dateStop || "",
    currency: account.currency || "USD",
    rows,
    summary: {
      spend,
      impressions,
      reach,
      clicks,
      purchases,
      leads,
      purchaseValue,
      cpc: accountRow?.cpc ?? (clicks > 0 ? spend / clicks : null),
      cpm:
        accountRow?.cpm ??
        (impressions > 0 ? (spend / impressions) * 1000 : null),
      ctr:
        accountRow?.ctr ??
        (impressions > 0 ? (clicks / impressions) * 100 : null),
      roas: spend > 0 ? purchaseValue / spend : null,
    },
  };
}
