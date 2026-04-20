import { useState } from "react";
import { Phone, MessageSquare, CheckCircle2, XCircle, Clock, Filter, ExternalLink, Pencil, X, BookOpen, Bot, User, AlertCircle, Brain, ArrowLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import type { RLSession } from "@shared/schema";

const SEED_RL_SESSIONS: RLSession[] = [
  {
    id: "rl-001",
    channel: "calls",
    customerName: "Sarah Chen",
    customerCompany: "Golden Wok Restaurant",
    agentName: "Priya Sharma",
    timestamp: "2026-04-19T09:14:00.000Z",
    status: "pending",
    topic: "P400 Terminal Not Connecting",
    issueSummary: "Customer reported that their Verifone P400 terminal lost connectivity after a recent firmware push. The device was unable to establish a tunnel connection and was showing an offline status in the Commander dashboard. Customer was unable to process card payments for approximately 2 hours during peak breakfast service.",
    aiResolution: "The Lyzr Agent identified the root cause as a failed firmware rollback that corrupted the network certificate store. Recommended steps: (1) Force-restart the terminal using the 3-key combination (F1+F3+Cancel). (2) Navigate to Admin > Network > Certificate Reset. (3) Re-provision the device using the Commander App v4.2 or later. (4) Validate tunnel IP assignment via the service portal.",
    agentResolution: "Walked the customer through the hard reset and certificate reset procedure. Device came back online after step 2. Confirmed tunnel IP was re-assigned successfully. No need for full reprovisioning. Customer was able to resume transactions. Created a follow-up ticket for firmware rollback investigation by the platform team.",
    kbLinks: [
      { id: "kb-l-001", title: "P400 Firmware Rollback Procedure", source: "Internal KB", url: "#" },
      { id: "kb-l-002", title: "Network Certificate Reset Guide", source: "Verifone Docs", url: "#" },
      { id: "kb-l-003", title: "Commander App Tunnel Re-provisioning", source: "Internal KB", url: "#" },
    ],
  },
  {
    id: "rl-002",
    channel: "chats",
    customerName: "Michael Rodriguez",
    customerCompany: "Urban Style Boutique",
    agentName: "Alex Kim",
    timestamp: "2026-04-19T11:32:00.000Z",
    status: "pending",
    topic: "Batch Settlement Failure",
    issueSummary: "Customer contacted support via chat reporting that their end-of-day batch settlement had failed twice in a row. Transactions from the past 48 hours were in a pending state and their bank was not receiving the settlement file.",
    aiResolution: "Lyzr Agent detected the issue as a time-zone misconfiguration in the batch settlement schedule combined with an expired SSL handshake token to the payment processor. Recommended: (1) Log into Verifone Central. (2) Navigate to Settings > Batch Schedule and verify the timezone matches the merchant's local time. (3) Trigger a manual settlement via the Force Settlement option.",
    agentResolution: "Confirmed the timezone was incorrectly set to UTC instead of EST. Corrected it in Verifone Central. Triggered manual force settlement — all 48 hours of pending transactions settled successfully within 8 minutes. SSL token appeared valid and was not the cause.",
    editedAiResolution: "The root cause was a timezone misconfiguration (UTC instead of EST) in the batch settlement schedule — the SSL token was not involved. Steps: (1) Log into Verifone Central > Settings > Batch Schedule. (2) Correct timezone to match merchant local time. (3) Trigger Force Settlement. (4) Verify all pending transactions settle within ~10 minutes.",
    kbLinks: [
      { id: "kb-l-004", title: "Batch Settlement Troubleshooting Guide", source: "Internal KB", url: "#" },
      { id: "kb-l-005", title: "Verifone Central Timezone Configuration", source: "Verifone Docs", url: "#" },
    ],
  },
  {
    id: "rl-003",
    channel: "calls",
    customerName: "Emma Thompson",
    customerCompany: "BrewCraft Coffee Chain",
    agentName: "Priya Sharma",
    timestamp: "2026-04-18T14:05:00.000Z",
    status: "approved",
    topic: "VX 820 NFC Contactless Not Working",
    issueSummary: "Customer reported that the contactless payment feature on their VX 820 terminals (5 units across 3 locations) stopped functioning after the latest OS update. Tap-to-pay transactions were being declined at the reader level before even reaching the payment processor.",
    aiResolution: "Lyzr Agent recommended an NFC calibration reset and re-enabling the contactless payment module via the terminal service menu. Steps: (1) Access Admin Mode. (2) Go to System > NFC > Recalibrate. (3) Disable and re-enable NFC. (4) Run a test transaction.",
    agentResolution: "Performed the NFC recalibration on all 5 terminals remotely via Commander. All units came back online. No firmware reflash was required. The OS update had disabled NFC as a default — this is a known issue flagged to the engineering team.",
    kbLinks: [
      { id: "kb-l-006", title: "VX 820 NFC Reader Calibration", source: "Verifone Docs", url: "#" },
      { id: "kb-l-007", title: "Contactless Payment Module Reset", source: "Internal KB", url: "#" },
    ],
  },
  {
    id: "rl-004",
    channel: "chats",
    customerName: "David Park",
    customerCompany: "Sunrise Pharmacy",
    agentName: "Alex Kim",
    timestamp: "2026-04-18T16:48:00.000Z",
    status: "rejected",
    topic: "Commander App License Expired",
    issueSummary: "Customer reported that the Commander App displayed a license expired error, blocking all remote management capabilities. The expiry occurred without any prior warning email or in-app notification.",
    aiResolution: "Lyzr Agent suggested the customer purchase a new license directly through the Verifone portal and provided a self-service renewal link. Estimated renewal time: 24–48 hours.",
    agentResolution: "The license had actually auto-renewed but the renewal flag was not propagated to the local Commander App cache. Cleared the cache via Settings > License > Force Sync. License status updated immediately. No new purchase required.",
    kbLinks: [
      { id: "kb-l-008", title: "Commander App License Renewal Steps", source: "Internal KB", url: "#" },
      { id: "kb-l-009", title: "License Cache Sync Troubleshooting", source: "Verifone Docs", url: "#" },
    ],
  },
  {
    id: "rl-005",
    channel: "calls",
    customerName: "Lisa Park",
    customerCompany: "FreshMart Grocery",
    agentName: "Priya Sharma",
    timestamp: "2026-04-17T10:20:00.000Z",
    status: "pending",
    topic: "V240m Wi-Fi Certificate Error",
    issueSummary: "Customer reported that two V240m terminals at checkout lanes 3 and 5 were displaying a Wi-Fi certificate validation error after a router firmware update. Terminals were falling back to ethernet but that was creating latency issues during peak hours.",
    aiResolution: "Lyzr Agent identified the cause as an expired or mismatched Wi-Fi security certificate after the router update changed the security protocol from WPA2 to WPA3. Steps: (1) Access terminal Admin > Network > Wi-Fi Security. (2) Delete the existing certificate. (3) Re-download and install the updated WPA3 certificate. (4) Reconnect and validate.",
    agentResolution: "Confirmed the router had been updated to WPA3. Walked customer through the certificate replacement on both terminals. Both reconnected on Wi-Fi successfully. Suggested the customer update all remaining terminals proactively.",
    kbLinks: [
      { id: "kb-l-010", title: "V240m Wi-Fi Certificate Reset", source: "Verifone Docs", url: "#" },
      { id: "kb-l-011", title: "WPA3 Migration for Verifone Terminals", source: "Internal KB", url: "#" },
    ],
  },
  {
    id: "rl-006",
    channel: "chats",
    customerName: "Robert Chen",
    customerCompany: "TechFlow Solutions",
    agentName: "Alex Kim",
    timestamp: "2026-04-17T13:55:00.000Z",
    status: "pending",
    topic: "E285 Display Malfunction",
    issueSummary: "Customer reported their E285 mobile terminal screen was showing partial display corruption — the bottom third of the screen was flickering and unreadable. The device was otherwise functional and could process transactions by touch.",
    aiResolution: "Lyzr Agent recommended a screen calibration reset via the diagnostic menu and, if that failed, to initiate a warranty replacement claim as the E285 has a known display connector issue in units manufactured before Q3 2024.",
    agentResolution: "Performed remote diagnostic scan — confirmed the display issue matched the known connector defect. Immediately initiated a warranty replacement without attempting the screen calibration. Customer to receive a replacement unit in 2–3 business days.",
    kbLinks: [
      { id: "kb-l-012", title: "E285 Screen Replacement Instructions", source: "Field Service Manual", url: "#" },
      { id: "kb-l-013", title: "E285 Known Issues Registry", source: "Internal KB", url: "#" },
      { id: "kb-l-014", title: "Warranty Replacement Process", source: "Verifone Docs", url: "#" },
    ],
  },
];

const statusMeta = {
  pending: { label: "Pending Review", icon: Clock, color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20" },
  approved: { label: "Approved", icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20" },
  rejected: { label: "Rejected", icon: XCircle, color: "text-red-400", bg: "bg-red-400/10 border-red-400/20" },
};

const channelMeta = {
  calls: { label: "Call", icon: Phone, color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/20" },
  chats: { label: "Chat", icon: MessageSquare, color: "text-violet-400", bg: "bg-violet-400/10 border-violet-400/20" },
};

function formatTs(ts: string) {
  const d = new Date(ts);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) + " · " + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

export default function FeedbackRLApprovalPage() {
  const [sessions, setSessions] = useState<RLSession[]>(SEED_RL_SESSIONS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [channelFilter, setChannelFilter] = useState<"all" | "calls" | "chats">("all");
  const [editingAi, setEditingAi] = useState(false);
  const [editDraft, setEditDraft] = useState("");

  const filtered = channelFilter === "all" ? sessions : sessions.filter(s => s.channel === channelFilter);
  const pendingCount = sessions.filter(s => s.status === "pending").length;
  const approvedCount = sessions.filter(s => s.status === "approved").length;
  const rejectedCount = sessions.filter(s => s.status === "rejected").length;

  const selected = selectedId ? sessions.find(s => s.id === selectedId) ?? null : null;

  const handleApprove = () => {
    setSessions(prev => prev.map(s => s.id === selectedId ? {
      ...s, status: "approved",
      editedAiResolution: editingAi ? editDraft : s.editedAiResolution,
    } : s));
    setEditingAi(false);
  };

  const handleReject = () => {
    setSessions(prev => prev.map(s => s.id === selectedId ? { ...s, status: "rejected" } : s));
    setEditingAi(false);
  };

  const handleEditSave = () => {
    setSessions(prev => prev.map(s => s.id === selectedId ? { ...s, editedAiResolution: editDraft } : s));
    setEditingAi(false);
  };

  const startEditing = () => {
    setEditDraft(selected?.editedAiResolution ?? selected?.aiResolution ?? "");
    setEditingAi(true);
  };

  const handleBack = () => {
    setSelectedId(null);
    setEditingAi(false);
  };

  return (
    <div className="flex flex-col h-full" data-testid="page-feedback-rl-approval">
      {/* Page header */}
      <div className="px-6 py-4 glass-header mx-4 mt-4 rounded-2xl shrink-0">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          <div>
            <h2 className="text-lg font-semibold">RL Approval</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Review and approve AI resolutions to reinforce model learning</p>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="px-6 py-4 grid grid-cols-3 gap-4 shrink-0">
        <Card className="p-4" data-testid="card-rl-metric-pending">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-400" data-testid="text-rl-pending">{pendingCount}</p>
              <p className="text-xs text-muted-foreground">Pending Review</p>
            </div>
          </div>
        </Card>
        <Card className="p-4" data-testid="card-rl-metric-approved">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-400" data-testid="text-rl-approved">{approvedCount}</p>
              <p className="text-xs text-muted-foreground">Approved</p>
            </div>
          </div>
        </Card>
        <Card className="p-4" data-testid="card-rl-metric-rejected">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-400/10 border border-red-400/20 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-400" data-testid="text-rl-rejected">{rejectedCount}</p>
              <p className="text-xs text-muted-foreground">Rejected</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex-1 min-h-0 px-6 pb-4">
        {!selected ? (
          /* ── Queue view ─────────────────────────────────────── */
          <div className="flex flex-col h-full gap-3">
            {/* Channel filter */}
            <div className="flex items-center gap-2 shrink-0" data-testid="rl-channel-filter">
              <span className="text-xs text-muted-foreground font-medium">Channel:</span>
              {(["all", "calls", "chats"] as const).map((ch) => {
                const isActive = channelFilter === ch;
                const Icon = ch === "calls" ? Phone : ch === "chats" ? MessageSquare : Filter;
                return (
                  <button
                    key={ch}
                    onClick={() => setChannelFilter(ch)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors border ${isActive ? "bg-primary/15 text-primary border-primary/30" : "bg-muted/30 text-muted-foreground border-border/30 hover:bg-primary/5 hover:text-primary/80"}`}
                    data-testid={`button-rl-filter-${ch}`}
                  >
                    <Icon className="w-3 h-3" />
                    {ch === "all" ? "All" : ch === "calls" ? "Calls" : "Chats"}
                    <span className={`text-[10px] ${isActive ? "text-primary/70" : "text-muted-foreground/60"}`}>
                      {ch === "all" ? sessions.length : sessions.filter(s => s.channel === ch).length}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Queue list */}
            <ScrollArea className="flex-1 min-h-0">
              <div className="space-y-2 pr-1">
                {filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <Brain className="w-10 h-10 mb-3 opacity-20 text-primary" />
                    <p className="text-sm">No sessions for this channel</p>
                  </div>
                ) : filtered.map((s) => {
                  const st = statusMeta[s.status];
                  const ch = channelMeta[s.channel];
                  return (
                    <button
                      key={s.id}
                      onClick={() => { setSelectedId(s.id); setEditingAi(false); }}
                      className="w-full text-left glass-panel rounded-xl p-4 border border-border/20 hover:border-primary/25 hover:bg-primary/5 transition-all group"
                      data-testid={`button-rl-queue-${s.id}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="w-9 h-9 rounded-lg glass-bubble-primary flex items-center justify-center text-xs font-bold text-primary shrink-0">
                            {s.customerName.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="text-sm font-semibold">{s.customerName}</span>
                              <span className="text-xs text-muted-foreground">{s.customerCompany}</span>
                            </div>
                            <p className="text-sm text-foreground/80 truncate mb-2">{s.topic}</p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full border ${ch.bg} ${ch.color}`}>
                                <ch.icon className="w-2.5 h-2.5" />
                                {ch.label}
                              </span>
                              <span className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full border ${st.bg} ${st.color}`}>
                                <st.icon className="w-2.5 h-2.5" />
                                {st.label}
                              </span>
                              <span className="text-[11px] text-muted-foreground">Agent: {s.agentName}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[11px] text-muted-foreground">{formatTs(s.timestamp)}</span>
                          <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary/60 transition-colors" />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        ) : (
          /* ── Detail view ─────────────────────────────────────── */
          <div className="flex flex-col h-full gap-4">
            {/* Detail header with back + approve/reject */}
            <div className="flex items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleBack}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
                  data-testid="button-rl-back"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  All Sessions
                </button>
                <span className="text-muted-foreground/30">·</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{selected.customerName}</span>
                  <span className="text-xs text-muted-foreground">{selected.customerCompany}</span>
                  <span className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full border ${channelMeta[selected.channel].bg} ${channelMeta[selected.channel].color}`}>
                    {selected.channel === "calls" ? <Phone className="w-2.5 h-2.5" /> : <MessageSquare className="w-2.5 h-2.5" />}
                    {channelMeta[selected.channel].label}
                  </span>
                  <span className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full border ${statusMeta[selected.status].bg} ${statusMeta[selected.status].color}`}>
                    {selected.status === "pending" ? <Clock className="w-2.5 h-2.5" /> : selected.status === "approved" ? <CheckCircle2 className="w-2.5 h-2.5" /> : <XCircle className="w-2.5 h-2.5" />}
                    {statusMeta[selected.status].label}
                  </span>
                </div>
              </div>
              {selected.status === "pending" && (
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="h-8 gap-1.5 border-red-400/30 text-red-400 hover:bg-red-400/10" onClick={handleReject} data-testid="button-rl-reject">
                    <XCircle className="w-3.5 h-3.5" />
                    Reject
                  </Button>
                  <Button size="sm" className="h-8 gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-white" onClick={handleApprove} data-testid="button-rl-approve">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Approve
                  </Button>
                </div>
              )}
            </div>

            <ScrollArea className="flex-1 min-h-0">
              <div className="space-y-4 pr-1">
                {/* 1. Issue Summary */}
                <div data-testid="section-issue-summary">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-primary" />
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Issue Summary</h3>
                  </div>
                  <Card className="p-4 glass-panel border-border/30">
                    <div className="flex items-center gap-2 mb-2 flex-wrap text-xs text-muted-foreground">
                      <span className="font-medium text-foreground/80">{selected.topic}</span>
                      <span className="text-muted-foreground/40">·</span>
                      <span>Agent: {selected.agentName}</span>
                      <span className="text-muted-foreground/40">·</span>
                      <span>{formatTs(selected.timestamp)}</span>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">{selected.issueSummary}</p>
                  </Card>
                </div>

                {/* 2. Side-by-side resolutions */}
                <div className="grid grid-cols-2 gap-4" data-testid="section-resolutions">
                  {/* AI Resolution */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Bot className="w-4 h-4 text-primary" />
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">AI Resolution</h3>
                        {selected.editedAiResolution && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary/70">Edited</span>
                        )}
                      </div>
                      {selected.status === "pending" && !editingAi && (
                        <button onClick={startEditing} className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors" data-testid="button-edit-ai-resolution">
                          <Pencil className="w-3 h-3" /> Edit
                        </button>
                      )}
                      {editingAi && (
                        <button onClick={() => setEditingAi(false)} className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-red-400 transition-colors">
                          <X className="w-3 h-3" /> Cancel
                        </button>
                      )}
                    </div>
                    <Card className="p-4 glass-panel border-primary/15 min-h-[160px]" data-testid="card-ai-resolution">
                      {editingAi ? (
                        <div className="flex flex-col gap-2">
                          <Textarea value={editDraft} onChange={e => setEditDraft(e.target.value)} className="text-sm min-h-[140px] bg-transparent border-primary/20 focus:border-primary/50 resize-none" data-testid="textarea-ai-resolution-edit" />
                          <Button size="sm" className="self-end h-7 text-xs" onClick={handleEditSave} data-testid="button-save-ai-edit">Save Edit</Button>
                        </div>
                      ) : (
                        <p className="text-sm text-foreground leading-relaxed">{selected.editedAiResolution ?? selected.aiResolution}</p>
                      )}
                    </Card>
                  </div>

                  {/* Agent Resolution */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-violet-400" />
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Support Agent Resolution</h3>
                    </div>
                    <Card className="p-4 glass-panel border-violet-400/15 min-h-[160px]" data-testid="card-agent-resolution">
                      <p className="text-sm text-foreground leading-relaxed">{selected.agentResolution}</p>
                    </Card>
                  </div>
                </div>

                {/* 3. KB Articles */}
                {selected.kbLinks.length > 0 && (
                  <div data-testid="section-kb-links">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="w-4 h-4 text-primary" />
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">KB Articles Shared</h3>
                      <Badge variant="secondary" className="text-xs px-1.5 py-0 h-4 ml-1">{selected.kbLinks.length}</Badge>
                    </div>
                    <div className="space-y-2">
                      {selected.kbLinks.map((link) => (
                        <div key={link.id} className="flex items-center justify-between gap-3 p-3 rounded-xl glass-panel border border-border/25 hover:border-primary/20 transition-colors" data-testid={`card-kb-link-${link.id}`}>
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-7 h-7 rounded-lg glass-bubble-primary flex items-center justify-center shrink-0">
                              <BookOpen className="w-3.5 h-3.5 text-primary" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-medium truncate">{link.title}</p>
                              <p className="text-[11px] text-muted-foreground">{link.source}</p>
                            </div>
                          </div>
                          <a href={link.url ?? "#"} className="flex items-center gap-1 text-[11px] text-primary/70 hover:text-primary transition-colors shrink-0" data-testid={`link-kb-${link.id}`}>
                            <ExternalLink className="w-3 h-3" /> View
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
}
