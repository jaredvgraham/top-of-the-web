"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { motion } from "framer-motion";
import AdminLeadCard from "@/components/admin/AdminLeadCard";
import {
  leadHasCampaignTag,
  leadMatchesCampaign,
  type AdminLeadRow,
} from "@/lib/adminLeads";

type InsightRow = {
  id: string;
  name: string;
  level: string;
  campaignId: string;
  campaignName: string;
  impressions: number;
  reach: number;
  clicks: number;
  spend: number;
  cpc: number | null;
  cpm: number | null;
  ctr: number | null;
  purchases: number;
  leads: number;
  initiateCheckouts: number;
  purchaseValue: number;
  dateStart: string;
  dateStop: string;
};

type Summary = {
  spend: number;
  impressions: number;
  reach: number;
  clicks: number;
  purchases: number;
  leads: number;
  initiateCheckouts: number;
  purchaseValue: number;
  cpc: number | null;
  cpm: number | null;
  ctr: number | null;
  roas: number | null;
};

type Dashboard = {
  configured: boolean;
  account: {
    id: string;
    accountId: string;
    name: string;
    currency: string;
    timezone: string;
  };
  accounts: Array<{
    id: string;
    accountId: string;
    name: string;
    currency: string;
  }>;
  datePreset: string;
  level: string;
  dateStart: string;
  dateStop: string;
  currency: string;
  summary: Summary;
  campaigns: InsightRow[];
  rows: InsightRow[];
  siteFunnel: {
    dateStart: string;
    dateStop: string;
    leads: number;
    withFbclid: number;
    purchased: number;
  };
  leads: AdminLeadRow[];
};

function summaryFromRow(row: InsightRow): Summary {
  const spend = row.spend;
  const impressions = row.impressions;
  const clicks = row.clicks;
  const purchaseValue = row.purchaseValue;
  return {
    spend,
    impressions,
    reach: row.reach,
    clicks,
    purchases: row.purchases,
    leads: row.leads,
    initiateCheckouts: row.initiateCheckouts,
    purchaseValue,
    cpc: row.cpc ?? (clicks > 0 ? spend / clicks : null),
    cpm: row.cpm ?? (impressions > 0 ? (spend / impressions) * 1000 : null),
    ctr: row.ctr ?? (impressions > 0 ? (clicks / impressions) * 100 : null),
    roas: spend > 0 ? purchaseValue / spend : null,
  };
}

const ease = [0.65, 0, 0.35, 1] as const;

const DATE_OPTIONS = [
  ["today", "Today"],
  ["yesterday", "Yesterday"],
  ["last_7d_incl_today", "7 days"],
  ["last_7d", "7 excl today"],
  ["last_14d", "14 days"],
  ["last_28d", "28 days"],
  ["last_30d", "30 days"],
  ["this_month", "This mo"],
  ["last_month", "Last mo"],
] as const;

const LEVEL_OPTIONS = [
  ["campaign", "Campaigns"],
  ["adset", "Ad sets"],
  ["ad", "Ads"],
  ["account", "Account"],
] as const;

function money(value: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `$${value.toFixed(2)}`;
  }
}

function num(value: number) {
  return new Intl.NumberFormat().format(Math.round(value));
}

function pct(value: number | null) {
  if (value == null || Number.isNaN(value)) return "—";
  return `${value.toFixed(2)}%`;
}

function MetaStat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink/40">
        {label}
      </p>
      <p className="mt-1 font-display text-xl font-medium tabular-nums text-ink sm:text-2xl">
        {value}
      </p>
      {hint ? <p className="mt-0.5 text-xs text-ink/40">{hint}</p> : null}
    </div>
  );
}

function ChipRow({ children }: { children: ReactNode }) {
  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
      {children}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
  accent,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  accent?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] transition ${
        active
          ? accent
            ? "bg-accent text-paper"
            : "bg-ink text-paper"
          : "bg-ink/5 text-ink/55 active:bg-ink/10"
      }`}
    >
      {children}
    </button>
  );
}

export default function AdsAdmin() {
  const [datePreset, setDatePreset] = useState("last_7d_incl_today");
  const [level, setLevel] = useState("campaign");
  const [accountId, setAccountId] = useState("");
  const [campaignId, setCampaignId] = useState("");
  const [data, setData] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showInsights, setShowInsights] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        datePreset,
        level,
      });
      if (accountId) params.set("accountId", accountId);

      const res = await fetch(`/api/admin/ads?${params.toString()}`, {
        cache: "no-store",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error || "Failed to load ads data");
        setData(null);
        return;
      }
      setData(json as Dashboard);
      if (!accountId && json.account?.id) {
        setAccountId(json.account.id);
      }
      const campaignIds = new Set(
        ((json.campaigns || []) as InsightRow[]).map((c) => c.id)
      );
      setCampaignId((prev) => (prev && campaignIds.has(prev) ? prev : ""));
    } catch {
      setError("Could not reach the ads API.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [datePreset, level, accountId]);

  useEffect(() => {
    void load();
  }, [load]);

  const currency = data?.currency || "USD";
  const campaigns = data?.campaigns || [];

  const selectedCampaign = useMemo(
    () => campaigns.find((c) => c.id === campaignId) || null,
    [campaigns, campaignId]
  );

  const summary = useMemo(() => {
    if (!data) return null;
    if (selectedCampaign) return summaryFromRow(selectedCampaign);
    return data.summary;
  }, [data, selectedCampaign]);

  const breakdownRows = useMemo(() => {
    if (!data) return [];
    if (!campaignId) return data.rows;
    if (data.level === "campaign") {
      return data.rows.filter((r) => r.id === campaignId);
    }
    if (data.level === "account") return data.rows;
    return data.rows.filter((r) => r.campaignId === campaignId);
  }, [data, campaignId]);

  const leads = useMemo(() => {
    const all = data?.leads || [];
    if (!selectedCampaign) return all;
    return all.filter((lead) =>
      leadMatchesCampaign(
        lead,
        selectedCampaign.id,
        selectedCampaign.name
      )
    );
  }, [data?.leads, selectedCampaign]);

  const campaignLeadStats = useMemo(() => {
    if (!selectedCampaign || !data) {
      return {
        formLeads: data?.siteFunnel.leads ?? 0,
        purchased: data?.siteFunnel.purchased ?? 0,
        untagged: 0,
      };
    }
    const all = data.leads || [];
    const matched = leads;
    const untagged = all.filter((l) => !leadHasCampaignTag(l)).length;
    return {
      formLeads: matched.length,
      purchased: matched.filter((l) => l.status === "purchased").length,
      untagged,
    };
  }, [data, selectedCampaign, leads]);

  return (
    <div className="grain relative min-h-[calc(100dvh-57px)] max-w-[100vw] overflow-x-hidden bg-paper">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse 70% 45% at 0% 0%, rgba(91,46,158,0.1), transparent 50%), radial-gradient(ellipse 50% 35% at 100% 20%, rgba(31,182,214,0.08), transparent 45%)",
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-24 pt-6 sm:px-8 sm:pb-14 sm:pt-10">
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="mb-5 sm:mb-8"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.24em] text-ink/45">
                Meta Ads
              </p>
              <h1 className="font-display text-3xl font-medium tracking-tight text-ink sm:text-5xl">
                Ad performance
              </h1>
            </div>
            <button
              type="button"
              onClick={() => void load()}
              disabled={loading}
              className="mt-6 shrink-0 rounded-full border border-ink/15 px-3.5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-ink/60 disabled:opacity-50 sm:mt-8"
            >
              {loading ? "…" : "Refresh"}
            </button>
          </div>
          {data?.account ? (
            <p className="mt-2 text-xs text-ink/45">
              {data.account.name}
              {data.dateStart && data.dateStop
                ? ` · ${data.dateStart} → ${data.dateStop}`
                : ""}
            </p>
          ) : null}
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease, delay: 0.06 }}
          className="mb-6 space-y-3"
        >
          <ChipRow>
            {DATE_OPTIONS.map(([value, label]) => (
              <Chip
                key={value}
                active={datePreset === value}
                onClick={() => setDatePreset(value)}
              >
                {label}
              </Chip>
            ))}
          </ChipRow>

          <ChipRow>
            {LEVEL_OPTIONS.map(([value, label]) => (
              <Chip
                key={value}
                active={level === value}
                onClick={() => setLevel(value)}
                accent
              >
                {label}
              </Chip>
            ))}
          </ChipRow>

          {campaigns.length > 0 ? (
            <div>
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/45">
                Campaign
              </p>
              <ChipRow>
                <Chip
                  active={!campaignId}
                  onClick={() => setCampaignId("")}
                >
                  All
                </Chip>
                {campaigns.map((campaign) => (
                  <Chip
                    key={campaign.id}
                    active={campaignId === campaign.id}
                    onClick={() => setCampaignId(campaign.id)}
                  >
                    {campaign.name}
                  </Chip>
                ))}
              </ChipRow>
            </div>
          ) : null}

          {data?.accounts && data.accounts.length > 1 ? (
            <label className="block text-sm">
              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/45">
                Ad account
              </span>
              <select
                value={accountId || data.account.id}
                onChange={(e) => {
                  setCampaignId("");
                  setAccountId(e.target.value);
                }}
                className="min-h-11 w-full rounded-xl border border-ink/15 bg-white/70 px-3 outline-none focus:border-accent"
              >
                {data.accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </motion.div>

        {loading && !data ? (
          <p className="text-sm text-ink/50">Loading Meta ads data…</p>
        ) : error ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : data && summary ? (
          <>
            <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
              <MetaStat
                label="Spend"
                value={money(summary.spend, currency)}
                hint={selectedCampaign ? selectedCampaign.name : undefined}
              />
              <MetaStat label="Clicks" value={num(summary.clicks)} />
              <MetaStat label="Pixel leads" value={num(summary.leads)} />
              <MetaStat
                label="Initiate checkout"
                value={num(summary.initiateCheckouts)}
                hint="Demo generates"
              />
              <MetaStat
                label="Meta form leads"
                value={num(campaignLeadStats.formLeads)}
                hint={
                  selectedCampaign
                    ? campaignLeadStats.untagged > 0
                      ? `Tagged only · ${campaignLeadStats.untagged} untagged hidden`
                      : "Matched to campaign"
                    : undefined
                }
              />
              <MetaStat
                label="Purchased"
                value={num(campaignLeadStats.purchased)}
                hint={selectedCampaign ? "Matched to campaign" : undefined}
              />
              <MetaStat
                label="CTR"
                value={pct(summary.ctr)}
                hint={`${num(summary.impressions)} impr.`}
              />
            </div>

            <section className="mb-8">
              <div className="mb-1 flex items-end justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/45">
                    Meta ad leads
                  </p>
                  <p className="mt-1 text-xs text-ink/40">
                    {leads.length} shown
                    {!selectedCampaign &&
                    data.siteFunnel.leads > leads.length
                      ? ` of ${data.siteFunnel.leads}`
                      : ""}
                    {selectedCampaign
                      ? " · matched to this campaign"
                      : ""}{" "}
                    · organic leads live under{" "}
                    <a href="/admin/leads" className="underline">
                      Leads
                    </a>
                  </p>
                </div>
              </div>

              {leads.length === 0 ? (
                <p className="mt-4 text-sm text-ink/50">
                  {selectedCampaign
                    ? "No form leads matched this campaign. Matching uses campaign_id or utm_campaign on the landing URL."
                    : "No Meta-attributed form leads in this date window."}
                </p>
              ) : (
                <div className="mt-2 divide-y-0 border-t border-ink/10">
                  {leads.map((lead) => (
                    <AdminLeadCard key={lead.id} lead={lead} />
                  ))}
                </div>
              )}
            </section>

            <section className="mb-4">
              <button
                type="button"
                onClick={() => setShowInsights((v) => !v)}
                className="flex min-h-11 w-full items-center justify-between rounded-xl border border-ink/10 bg-white/60 px-4 text-left"
              >
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/55">
                  Campaign breakdown
                </span>
                <span className="text-xs text-ink/40">
                  {showInsights ? "Hide" : `${breakdownRows.length} rows`}
                </span>
              </button>

              {showInsights ? (
                breakdownRows.length === 0 ? (
                  <p className="mt-3 text-sm text-ink/50">
                    No insights for this range.
                  </p>
                ) : (
                  <div className="mt-3 space-y-3">
                    {breakdownRows.map((row) => (
                      <div
                        key={`${row.level}-${row.id}-${row.name}`}
                        className="border-b border-ink/10 pb-3 last:border-b-0"
                      >
                        <p className="font-medium leading-snug text-ink">
                          {row.name}
                        </p>
                        <div className="mt-2 grid grid-cols-3 gap-2 text-sm sm:grid-cols-6">
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.12em] text-ink/40">
                              Spend
                            </p>
                            <p className="tabular-nums">
                              {money(row.spend, currency)}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.12em] text-ink/40">
                              Clicks
                            </p>
                            <p className="tabular-nums">{num(row.clicks)}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.12em] text-ink/40">
                              CTR
                            </p>
                            <p className="tabular-nums">{pct(row.ctr)}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.12em] text-ink/40">
                              CPC
                            </p>
                            <p className="tabular-nums">
                              {row.cpc != null
                                ? money(row.cpc, currency)
                                : "—"}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.12em] text-ink/40">
                              Leads
                            </p>
                            <p className="tabular-nums">{num(row.leads)}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.12em] text-ink/40">
                              Checkout
                            </p>
                            <p className="tabular-nums">
                              {num(row.initiateCheckouts)}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.12em] text-ink/40">
                              Buys
                            </p>
                            <p className="tabular-nums">{num(row.purchases)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : null}
            </section>
          </>
        ) : null}
      </div>
    </div>
  );
}
