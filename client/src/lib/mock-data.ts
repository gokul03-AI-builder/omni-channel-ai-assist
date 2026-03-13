import type {
  Customer,
  DeviceInfo,
  Call,
  TranscriptEntry,
  AISuggestion,
  ChatMessage,
  Ticket,
  PastCall,
  ChatSession,
  ChatConversationMessage,
} from "@shared/schema";

export const customers: Record<string, Customer> = {
  "cust-001": {
    id: "cust-001",
    name: "Sarah Chen",
    email: "sarah.chen@goldenwok.com",
    phone: "+1 (415) 555-0142",
    company: "Golden Wok Restaurant",
    avatarInitials: "SC",
    accountType: "Premium",
    location: "San Francisco, CA",
    joinedDate: "2023-03-15",
  },
  "cust-002": {
    id: "cust-002",
    name: "Michael Rodriguez",
    email: "m.rodriguez@urbanstyle.com",
    phone: "+1 (212) 555-0387",
    company: "Urban Style Boutique",
    avatarInitials: "MR",
    accountType: "Enterprise",
    location: "New York, NY",
    joinedDate: "2022-08-22",
  },
  "cust-003": {
    id: "cust-003",
    name: "Emma Thompson",
    email: "emma@brewcraft.co",
    phone: "+1 (503) 555-0219",
    company: "BrewCraft Coffee Chain",
    avatarInitials: "ET",
    accountType: "Enterprise",
    location: "Portland, OR",
    joinedDate: "2021-11-08",
  },
  "cust-004": {
    id: "cust-004",
    name: "David Kim",
    email: "dkim@quickfuel.net",
    phone: "+1 (713) 555-0456",
    company: "QuickFuel Gas Stations",
    avatarInitials: "DK",
    accountType: "Premium",
    location: "Houston, TX",
    joinedDate: "2023-01-10",
  },
};

export const deviceInfo: Record<string, DeviceInfo> = {
  "cust-001": {
    serialNumber: "713-392-125",
    model: "V660p-A",
    deviceId: null,
    mid: "0",
    tid: null,
    status: "Active",
    softwareVersion: "V660P-T-6.8.2.1",
    agentVersion: "4.3.40.2",
    lastHeartbeat: "2026-03-13T06:46:31.688927",
    lastCommunication: "2026-03-13T06:46:31.688927",
    network: "WIFI",
    ipAddress: "10.0.0.6",
    macAddress: null,
    hierarchyId: "367063a0-e422-46c0-a4e4-769ac24f4765",
    hierarchyPath: null,
    refSetId: null,
  },
  "cust-002": {
    serialNumber: "845-217-463",
    model: "V400m-A",
    deviceId: "DEV-90214",
    mid: "44812",
    tid: "TID-7823",
    status: "Active",
    softwareVersion: "V400M-T-5.4.1.0",
    agentVersion: "4.2.38.1",
    lastHeartbeat: "2026-03-13T05:30:12.112000",
    lastCommunication: "2026-03-13T05:30:12.112000",
    network: "4G LTE",
    ipAddress: "192.168.1.15",
    macAddress: "A4:CF:12:8B:3E:01",
    hierarchyId: "c91b04e2-7d3a-4f19-b8e0-3a5c82d19f42",
    hierarchyPath: "/US/NY/Region-East",
    refSetId: null,
  },
  "cust-003": {
    serialNumber: "921-508-372",
    model: "e285-A",
    deviceId: "DEV-33087",
    mid: "55190",
    tid: null,
    status: "Maintenance",
    softwareVersion: "E285-T-3.1.0.5",
    agentVersion: "4.1.22.0",
    lastHeartbeat: "2026-03-12T22:15:44.330000",
    lastCommunication: "2026-03-12T22:15:44.330000",
    network: "Bluetooth",
    ipAddress: "10.10.5.21",
    macAddress: "B8:27:EB:4D:9A:FF",
    hierarchyId: "a82f1cd3-5e91-4b07-a634-1f8e2d47ac05",
    hierarchyPath: "/US/OR/Region-West",
    refSetId: "RS-00412",
  },
  "cust-004": {
    serialNumber: "302-674-819",
    model: "VX520-A",
    deviceId: null,
    mid: "0",
    tid: "TID-1192",
    status: "Active",
    softwareVersion: "VX520-T-2.9.4.0",
    agentVersion: "3.8.15.3",
    lastHeartbeat: "2026-03-13T04:10:08.501000",
    lastCommunication: "2026-03-13T04:10:08.501000",
    network: "Ethernet",
    ipAddress: "172.16.0.44",
    macAddress: null,
    hierarchyId: "f12ea94b-2c38-41d5-9a77-6b8c03e5df21",
    hierarchyPath: null,
    refSetId: null,
  },
};

export const initialCalls: Call[] = [
  {
    id: "call-001",
    customerId: "cust-001",
    customerName: "Sarah Chen",
    status: "incoming",
    startTime: "",
    duration: 0,
    topic: "P400 Contactless Payment Failure",
    priority: "high",
  },
  {
    id: "call-002",
    customerId: "cust-002",
    customerName: "Michael Rodriguez",
    status: "incoming",
    startTime: "",
    duration: 0,
    topic: "V240m Connectivity Issues",
    priority: "medium",
  },
];

export const simulatedTranscript: TranscriptEntry[] = [
  {
    id: "t1",
    callId: "call-001",
    speaker: "customer",
    text: "Hi, I'm having trouble with my Verifone P400 terminal. It keeps showing an error when customers try to tap their cards for contactless payments.",
    timestamp: "10:02:15",
  },
  {
    id: "t2",
    callId: "call-001",
    speaker: "agent",
    text: "I'm sorry to hear that, Sarah. Let me pull up your account details. Can you tell me when this issue first started?",
    timestamp: "10:02:28",
  },
  {
    id: "t3",
    callId: "call-001",
    speaker: "customer",
    text: "It started yesterday afternoon, around 3 PM. The chip reader works fine, but every time someone taps their card, we get error code E-301 on the screen.",
    timestamp: "10:02:45",
  },
  {
    id: "t4",
    callId: "call-001",
    speaker: "agent",
    text: "Thank you for that detail. Error E-301 is typically related to the NFC antenna configuration. I can see your terminal is running firmware v4.1.8. Let me check if there's a known issue with that version.",
    timestamp: "10:03:02",
  },
  {
    id: "t5",
    callId: "call-001",
    speaker: "customer",
    text: "We're a busy restaurant and losing contactless is really hurting us during the lunch rush. Is there a quick fix?",
    timestamp: "10:03:20",
  },
  {
    id: "t6",
    callId: "call-001",
    speaker: "agent",
    text: "I completely understand the urgency. I'm going to walk you through an NFC module reset first, which resolves this issue in about 80% of cases. Can you navigate to Settings on your terminal?",
    timestamp: "10:03:38",
  },
  {
    id: "t7",
    callId: "call-001",
    speaker: "customer",
    text: "Yes, I'm at the Settings menu now. What's the next step?",
    timestamp: "10:03:52",
  },
  {
    id: "t8",
    callId: "call-001",
    speaker: "agent",
    text: "Go to Hardware, then NFC, and select 'Reset Module'. This will restart the contactless reader without affecting your other payment methods.",
    timestamp: "10:04:05",
  },
  {
    id: "t9",
    callId: "call-001",
    speaker: "customer",
    text: "Okay, I see the option. It says 'NFC Module Reset - This will restart the contactless reader.' Should I press Confirm?",
    timestamp: "10:04:22",
  },
  {
    id: "t10",
    callId: "call-001",
    speaker: "agent",
    text: "Yes, go ahead and confirm. The terminal will briefly show a loading screen, then return to the main payment screen. This should take about 15-20 seconds.",
    timestamp: "10:04:35",
  },
  {
    id: "t11",
    callId: "call-001",
    speaker: "customer",
    text: "It's restarting now... Okay, it's back to the main screen. Should I try a test tap?",
    timestamp: "10:05:00",
  },
  {
    id: "t12",
    callId: "call-001",
    speaker: "agent",
    text: "Absolutely. If you have a contactless card or phone nearby, please try a test transaction. You can use the $0.01 test mode if you'd like.",
    timestamp: "10:05:12",
  },
];

export const simulatedTranscript2: TranscriptEntry[] = [
  {
    id: "t2-1",
    callId: "call-002",
    speaker: "customer",
    text: "Hello, my V240m terminal keeps disconnecting from the Wi-Fi network. It worked fine until we changed our router last week.",
    timestamp: "10:08:15",
  },
  {
    id: "t2-2",
    callId: "call-002",
    speaker: "agent",
    text: "Hi Michael, thanks for calling in. I can see you're using a V240m with Wi-Fi and 4G LTE connectivity. Let me help you get reconnected. What's the new router model?",
    timestamp: "10:08:30",
  },
  {
    id: "t2-3",
    callId: "call-002",
    speaker: "customer",
    text: "It's a Netgear Nighthawk. The terminal connects briefly but then drops after a few minutes. The 4G backup kicks in but it's slower.",
    timestamp: "10:08:48",
  },
  {
    id: "t2-4",
    callId: "call-002",
    speaker: "agent",
    text: "This is a common issue with newer routers using WPA3 security by default. The V240m on firmware v3.8.2 works best with WPA2. Let me walk you through updating the Wi-Fi settings.",
    timestamp: "10:09:05",
  },
  {
    id: "t2-5",
    callId: "call-002",
    speaker: "customer",
    text: "Oh, that makes sense. How do I change that on the terminal?",
    timestamp: "10:09:20",
  },
  {
    id: "t2-6",
    callId: "call-002",
    speaker: "agent",
    text: "On your terminal, go to Settings, then Network, then Wi-Fi Configuration. You'll want to forget the current network and re-add it. I'd also recommend setting the security type to WPA2-PSK manually.",
    timestamp: "10:09:38",
  },
];

export const suggestionsByTranscriptId: Record<string, AISuggestion> = {
  t3: {
    id: "s1",
    title: "Error E-301: NFC Antenna Reset Procedure",
    content:
      "For P400 terminals displaying E-301, perform an NFC module reset: Settings > Hardware > NFC > Reset Module. If issue persists after reset, verify firmware is v4.2.1 or later. Known regression in v4.1.6-v4.1.8 affecting NFC antenna calibration.",
    fullContent: `## Overview\nError code E-301 indicates an NFC antenna communication failure on the Verifone P400 terminal. This error is most commonly triggered by firmware versions v4.1.6 through v4.1.8 due to a known regression in the NFC stack initialization sequence.\n\n## Affected Models\n- Verifone P400 (all revisions)\n- Verifone P400 Plus\n\n## Symptoms\n- "E-301" displayed on screen when a contactless card or mobile wallet is presented\n- Chip and magnetic stripe payments continue to work normally\n- NFC indicator LED may be dim or unresponsive\n- Error occurs consistently, not intermittently\n\n## Resolution Steps\n1. Navigate to **Settings** on the terminal (may require supervisor PIN)\n2. Select **Hardware** → **NFC** → **Reset Module**\n3. Confirm the reset when prompted — the terminal will restart the contactless reader (~15–20 seconds)\n4. Test with a contactless card or phone\n5. If the error persists, check the firmware version under **About Terminal**\n\n## Firmware Check\nIf running v4.1.6–v4.1.8, push firmware v4.2.1 remotely via the Verifone Device Management Portal (available for Premium and Enterprise accounts). This resolves the underlying NFC calibration regression.\n\n## When to Escalate\n- E-301 persists after reset AND firmware is already v4.2.1 or later\n- Physical damage visible around the NFC antenna area (top of terminal)\n- Terminal is under 1 year old (hardware defect — initiate RMA)\n\n## Success Rate\nNFC module reset alone resolves E-301 in **82% of cases**. Firmware update brings cumulative resolution to **97%**.`,
    source: "KB-2847",
    confidence: 0.94,
    category: "Troubleshooting",
    references: [
      { label: "P400 Hardware Diagnostic Guide", url: "#kb-p400-hardware" },
      { label: "Verifone Device Management Portal", url: "#portal-device-mgmt" },
      { label: "NFC Module Replacement Procedure", url: "#kb-3015" },
    ],
    suggestedResponse: "I can see the E-301 error is related to the NFC antenna. Let's try an NFC module reset first — it resolves this in most cases. Go to Settings → Hardware → NFC → Reset Module, then confirm. This takes about 15 seconds and won't affect your chip or swipe payments.",
  },
  t5: {
    id: "s2",
    title: "P400 Firmware Update Available: v4.2.1",
    content:
      "Critical update addresses NFC contactless failures (E-301, E-302, E-305). Remote push available for Premium accounts. Update includes improved antenna calibration and faster tap response times. Deployment time: ~3 minutes.",
    fullContent: `## Firmware v4.2.1 — Release Summary\nThis is a critical maintenance release for the Verifone P400 terminal family. It is strongly recommended for all units currently running v4.1.x.\n\n## Key Fixes\n- **NFC Antenna Calibration** — Resolves E-301, E-302, E-305 errors introduced in v4.1.6\n- **Contactless Read Speed** — Improved tap-to-authorize latency by 40ms\n- **PCI DSS 4.0 Compliance** — Updated TLS cipher suite to meet 2026 PCI requirements\n- **Receipt Printing** — Fixed edge case causing double-print on high-volume transactions\n\n## Deployment Instructions\n### Remote Push (Recommended for Premium/Enterprise)\n1. Log into the **Verifone Device Management Portal**\n2. Select the device by serial number\n3. Navigate to **Firmware** → **Schedule Update**\n4. Select v4.2.1 and choose **Immediate** or schedule for off-peak hours\n5. Confirm — update deploys in approximately 3 minutes; terminal temporarily offline during update\n\n### Manual Update\n1. Download the v4.2.1 package from Verifone Support Portal\n2. Load onto a USB drive formatted FAT32\n3. Insert USB while terminal is powered off\n4. Power on while holding the **#** and **Cancel** keys\n5. Follow on-screen update wizard\n\n## Rollback\nIn the rare event v4.2.1 causes issues, revert to v4.1.5 (last stable pre-regression build) via the same remote push process.\n\n## Compatibility\nCompatible with all P400 hardware revisions (Rev A through Rev D). Does not require re-certification of existing payment applications.`,
    source: "FW-UPDATE-2847",
    confidence: 0.88,
    category: "Firmware",
    references: [
      { label: "Verifone P400 Firmware Changelog", url: "#fw-changelog-p400" },
      { label: "Remote Firmware Push Guide", url: "#kb-remote-fw" },
      { label: "PCI DSS 4.0 Compliance Notes", url: "#pci-dss-4" },
    ],
    suggestedResponse: "Good news — there's a firmware update (v4.2.1) available for your P400 that specifically fixes the NFC issues you're experiencing. Since you're on a Premium account, I can push this remotely right now. It takes about 3 minutes and the terminal will be briefly offline. Would you like me to schedule it immediately or during off-peak hours?",
  },
  t8: {
    id: "s3",
    title: "NFC Module Reset Success Rate & Escalation Path",
    content:
      "NFC module reset resolves contactless issues in 82% of P400 cases. If unsuccessful, escalate to Level 2 for hardware diagnostics. Alternative: Schedule on-site technician via Field Service Portal.",
    fullContent: `## Resolution Pathway for Contactless Payment Failures\n\n## Success Rates by Intervention\n| Action | Resolution Rate | Time Required |\n|---|---|---|\n| NFC Module Reset | 82% | 2–3 minutes |\n| Firmware Update (v4.2.1) | 97% cumulative | 3–5 minutes |\n| Level 2 Remote Diagnostics | 99% cumulative | 4–6 hours |\n| On-site Hardware Replacement | 100% | Next business day |\n\n## When NFC Reset Fails\nIf the NFC module reset does not resolve E-301 after a full terminal restart:\n1. Confirm firmware version — if still on v4.1.6–v4.1.8, push v4.2.1 immediately\n2. If already on v4.2.1, proceed to **Level 2 Escalation**\n\n## Level 2 Escalation\n- **Ticket Reference**: Include current ticket number, error code, firmware version, and reset attempt results\n- **L2 Capabilities**: Remote hardware diagnostics, forced firmware re-flash, NFC antenna continuity test via Verifone Diagnostics Protocol (VDP)\n- **Average Resolution Time**: 4–6 hours during business hours\n\n## On-Site Technician Dispatch\nFor Premium accounts, same-day local technician dispatch is available:\n1. Open the **Field Service Portal** (portal.verifone.com/field-service)\n2. Create a new dispatch request with ticket number and customer details\n3. Select **NFC Hardware Failure** as issue type\n4. Premium SLA guarantees on-site arrival within 4 business hours\n\n## Hardware Replacement (RMA)\nIf NFC antenna is physically damaged or all software interventions fail:\n- Initiate RMA through Device Management Portal\n- Advance Exchange ships next business day for Premium accounts\n- Customer uses pre-paid return label within 10 business days`,
    source: "KB-3012",
    confidence: 0.91,
    category: "Resolution",
    references: [
      { label: "Level 2 Escalation Procedures", url: "#kb-l2-escalation" },
      { label: "Field Service Portal", url: "#field-service" },
      { label: "RMA & Advance Exchange Guide", url: "#kb-rma" },
    ],
    suggestedResponse: "The NFC reset is our best first step. If it doesn't resolve the issue, our next option is a firmware update to v4.2.1 which has a 97% cumulative success rate. I'm ready to escalate to Level 2 if needed — they can run remote hardware diagnostics. What happened after the reset?",
  },
};

export const suggestionsByTranscriptId2: Record<string, AISuggestion> = {
  "t2-3": {
    id: "s2-1",
    title: "V240m Wi-Fi Compatibility: WPA3 Known Issue",
    content:
      "V240m terminals on firmware v3.8.x may experience intermittent disconnections when connected to WPA3-only routers. Workaround: Configure router to WPA2/WPA3 mixed mode, or update terminal firmware to v3.9.0+ which adds full WPA3 support.",
    fullContent: `## Overview\nThe Verifone V240m on firmware versions v3.8.0–v3.8.9 lacks native WPA3 support. When connected to routers configured for WPA3-only mode (increasingly common on newer Netgear, ASUS, and TP-Link models), the terminal will establish a connection initially but disconnect within 2–8 minutes due to a key re-exchange failure in the 802.11r handoff protocol.\n\n## Affected Configurations\n- V240m with firmware v3.8.x\n- Routers set to WPA3-only (not WPA2/WPA3 mixed)\n- Most commonly reported with: Netgear Nighthawk AX series, ASUS AX routers, TP-Link Deco XE series\n\n## Symptoms\n- Terminal connects to Wi-Fi initially\n- Drops connection every 2–8 minutes\n- 4G LTE backup activates automatically (slower)\n- Wi-Fi indicator on terminal shows connected but transactions time out\n\n## Immediate Workaround (Router-Side)\n1. Access your router admin panel (typically 192.168.1.1)\n2. Navigate to **Wireless Settings** → **Security**\n3. Change from **WPA3-Only** to **WPA2/WPA3 Mixed Mode**\n4. Save and allow router to restart (~30 seconds)\n5. The V240m will reconnect automatically on next scan\n\n## Permanent Fix (Terminal-Side)\nUpdate terminal firmware to v3.9.0+, which adds full WPA3 support. This is the preferred long-term solution as it does not require router configuration changes.\n\n## Notes\n- Wi-Fi channel width matters: if using 160MHz channel width, reduce to 80MHz for improved V240m compatibility\n- Ensure SSID does not use special characters (known issue in v3.8.x)`,
    source: "KB-4102",
    confidence: 0.96,
    category: "Connectivity",
    references: [
      { label: "V240m Network Configuration Guide", url: "#kb-v240m-network" },
      { label: "Supported Router Compatibility Matrix", url: "#kb-router-compat" },
      { label: "V240m Firmware v3.9.0 Release Notes", url: "#fw-v240m-390" },
    ],
    suggestedResponse: "This is a known compatibility issue with WPA3 routers and the V240m on firmware v3.8.x. The quickest fix is to change your router from WPA3-only to WPA2/WPA3 mixed mode in the router admin panel. Alternatively, I can push a firmware update to v3.9.0 which adds full WPA3 support. Which would work better for you?",
  },
  "t2-5": {
    id: "s2-2",
    title: "V240m Firmware v3.9.0 Release Notes",
    content:
      "Latest firmware adds WPA3 support, improved Bluetooth LE pairing, and fixes cellular handoff delays. Available for remote push to Enterprise accounts. OTA update size: 48MB.",
    fullContent: `## V240m Firmware v3.9.0 — What's New\n\n## New Features\n- **WPA3 Support** — Full IEEE 802.11ax WPA3-Personal and WPA3-Enterprise support\n- **Wi-Fi 6 (802.11ax)** — Improved throughput on congested networks (restaurants, retail environments)\n- **Bluetooth LE 5.0** — Faster pairing with BLE-enabled POS systems, improved range\n\n## Bug Fixes\n- Fixed intermittent Wi-Fi disconnection on WPA3-only routers (KB-4102)\n- Resolved 4G LTE to Wi-Fi handoff delay (was 8–12s, now <2s)\n- Fixed Bluetooth pairing failure with iOS 17+ devices\n- Corrected battery percentage display inaccuracy at low charge levels\n- Fixed edge case causing transaction logs to not sync when offline reconnection occurs\n\n## Deployment Information\n- **OTA Update Size**: 48 MB\n- **Downtime During Update**: ~4 minutes\n- **Remote Push Eligibility**: Enterprise and Premium accounts\n- **Minimum Battery Required**: 40% (update will not start below this threshold)\n\n## Rollback\nIf v3.9.0 causes issues, rollback to v3.8.9 is available via the Device Management Portal within 30 days of update.\n\n## Deployment Steps\n1. Ensure terminal battery is above 40% or connected to power\n2. From Device Management Portal: **Firmware** → **V240m** → **v3.9.0** → **Push Now**\n3. Terminal will display "Updating..." and become unavailable for ~4 minutes\n4. Terminal reboots automatically and reconnects to network\n5. Verify firmware version in **Settings** → **About**`,
    source: "FW-V240M-390",
    confidence: 0.85,
    category: "Firmware",
    references: [
      { label: "V240m Firmware Changelog Archive", url: "#fw-changelog-v240m" },
      { label: "Remote Firmware Deployment Guide", url: "#kb-remote-fw" },
      { label: "WPA3 Compatibility KB", url: "#kb-4102" },
    ],
    suggestedResponse: "I recommend pushing firmware v3.9.0 to your V240m — it directly fixes the WPA3 disconnection issue and also improves the 4G handoff so you don't lose transactions during dropouts. Since you're on an Enterprise account, I can push this remotely right now. The terminal will be offline for about 4 minutes. Want me to proceed?",
  },
};

export const customerTickets: Record<string, Ticket[]> = {
  "cust-001": [
    {
      id: "TKT-4521",
      subject: "P400 paper jam during receipt printing",
      status: "closed",
      createdAt: "2025-11-15",
      priority: "low",
      resolution: "Replaced thermal paper roll, cleared paper path",
    },
    {
      id: "TKT-4892",
      subject: "Transaction timeout during peak hours",
      status: "closed",
      createdAt: "2025-12-03",
      priority: "medium",
      resolution: "Upgraded network bandwidth, adjusted timeout settings",
    },
    {
      id: "TKT-5103",
      subject: "NFC contactless payment failure - E-301",
      status: "open",
      createdAt: "2026-03-05",
      priority: "high",
    },
  ],
  "cust-002": [
    {
      id: "TKT-3890",
      subject: "V240m battery draining quickly",
      status: "closed",
      createdAt: "2025-09-20",
      priority: "medium",
      resolution: "Battery replacement under warranty",
    },
    {
      id: "TKT-4201",
      subject: "Wi-Fi disconnection after router change",
      status: "open",
      createdAt: "2026-03-04",
      priority: "medium",
    },
  ],
  "cust-003": [
    {
      id: "TKT-4650",
      subject: "Batch processing errors at end of day",
      status: "escalated",
      createdAt: "2026-02-18",
      priority: "high",
    },
    {
      id: "TKT-4100",
      subject: "e285 Bluetooth pairing failure with POS",
      status: "closed",
      createdAt: "2025-10-12",
      priority: "medium",
      resolution: "Reset Bluetooth module, re-paired with POS system",
    },
  ],
  "cust-004": [
    {
      id: "TKT-3500",
      subject: "VX 520 display screen flickering",
      status: "closed",
      createdAt: "2025-07-08",
      priority: "low",
      resolution: "Display cable reseated, firmware updated",
    },
  ],
};

export const customerPastCalls: Record<string, PastCall[]> = {
  "cust-001": [
    {
      id: "pc-001",
      date: "2025-12-03",
      duration: 420,
      topic: "Transaction timeout troubleshooting",
      resolution: "Adjusted network timeout to 45s, recommended bandwidth upgrade",
    },
    {
      id: "pc-002",
      date: "2025-11-15",
      duration: 180,
      topic: "Receipt printer paper jam",
      resolution: "Guided paper path clearing, recommended thermal paper brand",
    },
  ],
  "cust-002": [
    {
      id: "pc-003",
      date: "2025-09-20",
      duration: 300,
      topic: "V240m battery drain issue",
      resolution: "Initiated warranty battery replacement",
    },
  ],
  "cust-003": [
    {
      id: "pc-004",
      date: "2026-02-18",
      duration: 540,
      topic: "Batch settlement errors",
      resolution: "Escalated to Level 2 - pending investigation",
    },
    {
      id: "pc-005",
      date: "2025-10-12",
      duration: 240,
      topic: "Bluetooth pairing with POS",
      resolution: "Reset BT module, successfully paired",
    },
  ],
  "cust-004": [
    {
      id: "pc-006",
      date: "2025-07-08",
      duration: 360,
      topic: "Display screen flickering",
      resolution: "Hardware fix - display cable, firmware update applied",
    },
  ],
};

export const aiChatResponses: Record<string, string> = {
  "firmware": "The latest firmware for the P400 is v4.2.1, released on Feb 15, 2026. Key fixes include NFC antenna calibration improvements, faster boot times, and PCI DSS 4.0 compliance updates. You can push this update remotely for Premium and Enterprise accounts through the Verifone Device Management Portal.",
  "warranty": "The P400 comes with a standard 1-year manufacturer warranty, extendable to 3 years with Verifone Care Plan. Sarah Chen's terminal (P4-2847-XK91) is covered under Premium Care until March 2027. This covers hardware defects, NFC module failures, and display issues.",
  "escalate": "To escalate this ticket to Level 2 Support, use ticket reference TKT-5103. Level 2 has access to remote terminal diagnostics and can initiate a forced firmware push. Average L2 resolution time is 4-6 hours. Include the error code E-301 and the NFC reset attempt results in the escalation notes.",
  "replacement": "For terminal replacement under warranty: 1) Create an RMA through the Device Management Portal 2) Select 'Advance Exchange' for next-day replacement 3) Customer ships defective unit within 10 business days using pre-paid label. Premium accounts qualify for same-day local technician dispatch.",
  "default": "I can help you with troubleshooting steps, firmware information, warranty details, escalation procedures, or terminal replacement options. What would you like to know more about?",
};

export function getAiResponse(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("firmware") || lower.includes("update") || lower.includes("version")) {
    return aiChatResponses.firmware;
  }
  if (lower.includes("warranty") || lower.includes("coverage") || lower.includes("care plan")) {
    return aiChatResponses.warranty;
  }
  if (lower.includes("escalat") || lower.includes("level 2") || lower.includes("l2")) {
    return aiChatResponses.escalate;
  }
  if (lower.includes("replac") || lower.includes("rma") || lower.includes("exchange")) {
    return aiChatResponses.replacement;
  }
  return aiChatResponses.default;
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export const initialChatSessions: ChatSession[] = [
  {
    id: "chat-001",
    customerId: "cust-001",
    customerName: "Sarah Chen",
    customerEmail: "sarah.chen@goldenwok.com",
    customerCompany: "Golden Wok Restaurant",
    customerInitials: "SC",
    status: "waiting",
    channel: "web",
    priority: "high",
    startTime: new Date(Date.now() - 180000).toISOString(),
    lastMessageTime: new Date(Date.now() - 30000).toISOString(),
    topic: "P400 receipt printer not working",
    unreadCount: 2,
    waitTimeSec: 180,
    slaDeadlineSec: 300,
  },
  {
    id: "chat-002",
    customerId: "cust-002",
    customerName: "Michael Rodriguez",
    customerEmail: "m.rodriguez@urbanstyle.com",
    customerCompany: "Urban Style Boutique",
    customerInitials: "MR",
    status: "active",
    channel: "email",
    priority: "medium",
    startTime: new Date(Date.now() - 420000).toISOString(),
    lastMessageTime: new Date(Date.now() - 60000).toISOString(),
    topic: "V240m battery replacement inquiry",
    unreadCount: 1,
    waitTimeSec: 420,
    slaDeadlineSec: 300,
  },
  {
    id: "chat-003",
    customerId: "cust-003",
    customerName: "Emma Thompson",
    customerEmail: "emma@brewcraft.co",
    customerCompany: "BrewCraft Coffee Chain",
    customerInitials: "ET",
    status: "waiting",
    channel: "whatsapp",
    priority: "urgent",
    startTime: new Date(Date.now() - 90000).toISOString(),
    lastMessageTime: new Date(Date.now() - 15000).toISOString(),
    topic: "Batch settlement failing — end of day",
    unreadCount: 3,
    waitTimeSec: 90,
    slaDeadlineSec: 300,
  },
  {
    id: "chat-004",
    customerId: "cust-004",
    customerName: "David Kim",
    customerEmail: "dkim@quickfuel.net",
    customerCompany: "QuickFuel Gas Stations",
    customerInitials: "DK",
    status: "waiting",
    channel: "sms",
    priority: "low",
    startTime: new Date(Date.now() - 600000).toISOString(),
    lastMessageTime: new Date(Date.now() - 120000).toISOString(),
    topic: "VX520 display settings question",
    unreadCount: 1,
    waitTimeSec: 600,
    slaDeadlineSec: 300,
  },
];

export const chatInitialMessages: Record<string, ChatConversationMessage[]> = {
  "chat-001": [
    {
      id: "cm-001-1",
      sessionId: "chat-001",
      sender: "customer",
      text: "Hi, our P400 receipt printer stopped working mid-shift. It was fine this morning but now nothing prints after transactions.",
      timestamp: new Date(Date.now() - 180000).toISOString(),
    },
    {
      id: "cm-001-2",
      sessionId: "chat-001",
      sender: "customer",
      text: "Payments are going through fine, but customers aren't getting receipts. We need this fixed ASAP — lunch rush is coming.",
      timestamp: new Date(Date.now() - 30000).toISOString(),
    },
  ],
  "chat-002": [
    {
      id: "cm-002-1",
      sessionId: "chat-002",
      sender: "customer",
      text: "Hello, I need to know about replacing the battery on my V240m. It barely lasts 2 hours now and we need it for roaming sales on the floor.",
      timestamp: new Date(Date.now() - 420000).toISOString(),
    },
  ],
  "chat-003": [
    {
      id: "cm-003-1",
      sessionId: "chat-003",
      sender: "customer",
      text: "URGENT: Our batch settlement is failing! We've tried 3 times and keep getting error BS-504. All our stores close in 2 hours and we can't reconcile.",
      timestamp: new Date(Date.now() - 90000).toISOString(),
    },
    {
      id: "cm-003-2",
      sessionId: "chat-003",
      sender: "customer",
      text: "This is affecting all 12 locations. We're an Enterprise account — is there an emergency line for this?",
      timestamp: new Date(Date.now() - 60000).toISOString(),
    },
    {
      id: "cm-003-3",
      sessionId: "chat-003",
      sender: "customer",
      text: "Please respond quickly, our accounting team is waiting.",
      timestamp: new Date(Date.now() - 15000).toISOString(),
    },
  ],
  "chat-004": [
    {
      id: "cm-004-1",
      sessionId: "chat-004",
      sender: "customer",
      text: "Hi there, quick question — how do I change the display brightness on my VX520? The screen is too dim in our gas station lighting.",
      timestamp: new Date(Date.now() - 600000).toISOString(),
    },
  ],
};

export const simulatedChatResponses: Record<string, ChatConversationMessage[]> = {
  "chat-001": [
    {
      id: "cm-001-s1",
      sessionId: "chat-001",
      sender: "customer",
      text: "I tried restarting the terminal but the printer still won't work. The screen shows a small printer icon with an X.",
      timestamp: "",
    },
    {
      id: "cm-001-s2",
      sessionId: "chat-001",
      sender: "customer",
      text: "Wait, I just noticed the paper roll might be jammed. There's a piece sticking out at an angle. Should I try to pull it out?",
      timestamp: "",
    },
    {
      id: "cm-001-s3",
      sessionId: "chat-001",
      sender: "customer",
      text: "Okay, I cleared the paper jam and reloaded the roll like you said. Let me try a test print now...",
      timestamp: "",
    },
    {
      id: "cm-001-s4",
      sessionId: "chat-001",
      sender: "customer",
      text: "It's printing again! Thank you so much! The receipt came out perfectly. You saved our lunch rush!",
      timestamp: "",
    },
  ],
  "chat-002": [
    {
      id: "cm-002-s1",
      sessionId: "chat-002",
      sender: "customer",
      text: "The terminal is about a year and a half old. Is the battery replacement covered under our Enterprise warranty?",
      timestamp: "",
    },
    {
      id: "cm-002-s2",
      sessionId: "chat-002",
      sender: "customer",
      text: "Great, I'd like to proceed with the replacement. Do I need to send the terminal in, or can I swap the battery myself?",
      timestamp: "",
    },
    {
      id: "cm-002-s3",
      sessionId: "chat-002",
      sender: "customer",
      text: "Perfect, I'll keep the terminal plugged in until the new battery arrives. What's the estimated delivery time?",
      timestamp: "",
    },
  ],
  "chat-003": [
    {
      id: "cm-003-s1",
      sessionId: "chat-003",
      sender: "customer",
      text: "Yes, all locations are running e285 terminals connected via Bluetooth to our POS. The error started about an hour ago across all stores simultaneously.",
      timestamp: "",
    },
    {
      id: "cm-003-s2",
      sessionId: "chat-003",
      sender: "customer",
      text: "I can see the batch totals on the terminal — they look correct. It's just the submission to the processor that's failing.",
      timestamp: "",
    },
    {
      id: "cm-003-s3",
      sessionId: "chat-003",
      sender: "customer",
      text: "Okay, I'll have my managers at each location try the manual batch force. Should we do all 12 at once or one at a time?",
      timestamp: "",
    },
  ],
  "chat-004": [
    {
      id: "cm-004-s1",
      sessionId: "chat-004",
      sender: "customer",
      text: "I found the Display menu but I only see Contrast, not Brightness. Is it the same thing on the VX520?",
      timestamp: "",
    },
    {
      id: "cm-004-s2",
      sessionId: "chat-004",
      sender: "customer",
      text: "Got it, I turned the contrast up to 80% and it's much more readable now. Thanks for the help!",
      timestamp: "",
    },
  ],
};

export const chatCannedResponses = [
  "Thank you for contacting Verifone Support. Let me look into this for you right away.",
  "I understand the urgency. Let me check your account details and find a solution.",
  "Could you please provide the serial number of your terminal? It's on the label on the back.",
  "I'm going to escalate this to our Level 2 team for faster resolution. You'll receive an update within 2 hours.",
  "I've created a support ticket for this issue. Your reference number is in the chat above.",
  "Is there anything else I can help you with today?",
  "Let me walk you through the troubleshooting steps. Please follow along on your terminal.",
  "I can see your device details in our system. Let me check the current status.",
];

export const chatKbSuggestions: Record<string, AISuggestion[]> = {
  "receipt": [
    {
      id: "ck-1",
      title: "P400 Receipt Printer Troubleshooting",
      content: "Common P400 printer issues: paper jam, thermal head dirty, paper roll loaded incorrectly. Check printer icon on screen for error type. Clear paper path, reload roll with thermal side facing up.",
      fullContent: "## P400 Receipt Printer Troubleshooting\n\n## Common Issues\n- **Paper Jam**: Paper stuck in print mechanism. Open printer cover, gently remove jammed paper, reload.\n- **Thermal Head Dirty**: Faded or partial prints. Clean with isopropyl alcohol wipe.\n- **Paper Loaded Incorrectly**: Blank receipts. Ensure thermal (shiny) side faces the print head.\n- **Printer Icon with X**: Printer mechanism error. Power cycle the terminal.\n\n## Resolution Steps\n1. Open the printer cover (press release latch on back)\n2. Remove any jammed paper carefully — do not tear\n3. Clean the thermal print head with the provided cleaning card\n4. Reload paper roll with thermal side facing up\n5. Close cover firmly until it clicks\n6. Run a test print: **Settings** → **Printer** → **Test Print**\n\n## When to Escalate\n- Printer mechanism physically damaged\n- Thermal head shows burn marks\n- Error persists after paper reload and cleaning",
      source: "KB-1205",
      confidence: 0.95,
      category: "Hardware",
      references: [
        { label: "P400 Printer Maintenance Guide", url: "#kb-printer-maint" },
        { label: "Thermal Paper Specifications", url: "#kb-paper-specs" },
      ],
      suggestedResponse: "It sounds like you may have a paper jam. Let's try this: Open the printer cover using the release latch on the back of the P400, carefully remove any jammed paper, then reload the roll with the shiny (thermal) side facing up. Close the cover until it clicks, then try a test print from Settings → Printer → Test Print.",
    },
  ],
  "battery": [
    {
      id: "ck-2",
      title: "V240m Battery Replacement Program",
      content: "V240m batteries degrade after ~18 months of daily use. Enterprise and Premium accounts qualify for free replacement under Verifone Care. Standard accounts can purchase replacement batteries at $45.",
      fullContent: "## V240m Battery Replacement Program\n\n## Battery Lifecycle\n- Expected lifespan: 18–24 months with daily use\n- Capacity drops below 60% after ~500 charge cycles\n- Signs of degradation: less than 3 hours of active use, unexpected shutdowns\n\n## Replacement Options\n\n### Covered Under Warranty/Care Plan\n- **Enterprise accounts**: Free replacement, shipped next business day\n- **Premium accounts**: Free replacement under Verifone Care Plan\n- **Standard accounts**: $45 per replacement battery\n\n## Self-Replacement Process\n1. Power off the terminal completely\n2. Remove the battery cover (slide latch on bottom)\n3. Disconnect old battery (pull tab gently)\n4. Insert new battery (align connector, press until click)\n5. Replace battery cover\n6. Charge for minimum 2 hours before first use\n\n## Ordering\n- Part number: V240M-BAT-3200\n- Order via Device Management Portal or contact support\n- Shipping: Next business day (Enterprise), 3–5 days (Standard)",
      source: "KB-2301",
      confidence: 0.92,
      category: "Hardware",
      references: [
        { label: "V240m Battery Specifications", url: "#kb-v240m-battery" },
        { label: "Verifone Care Plan Details", url: "#kb-care-plan" },
      ],
      suggestedResponse: "The V240m battery typically needs replacement after 18–24 months of daily use. Since you're on an Enterprise account, you qualify for a free battery replacement shipped next business day. The battery is user-replaceable — I can walk you through the swap once it arrives. Would you like me to order one for you?",
    },
  ],
  "batch": [
    {
      id: "ck-3",
      title: "Batch Settlement Error BS-504: Processor Timeout",
      content: "BS-504 indicates the batch submission timed out connecting to the payment processor. Common during processor maintenance windows. Retry after 15 minutes or use manual batch force.",
      fullContent: "## Batch Settlement Error BS-504\n\n## Overview\nError BS-504 occurs when the terminal cannot establish a connection to the payment processor during batch settlement. This is distinct from BS-500 (authentication failure) and BS-510 (data format error).\n\n## Common Causes\n- Payment processor scheduled maintenance (check processor status page)\n- Network congestion during peak settlement hours (typically 9–11 PM local time)\n- Firewall or network configuration blocking outbound port 443\n- DNS resolution failure on the terminal\n\n## Immediate Resolution\n1. Wait 15 minutes and retry — most processor maintenance windows are brief\n2. If urgent, use **Manual Batch Force**: Settings → Batch → Force Settlement\n3. This bypasses the normal handshake and pushes transactions directly\n4. Manual force has a 99.2% success rate even during processor issues\n\n## Multi-Location Impact\nIf BS-504 affects multiple locations simultaneously, it is almost certainly a processor-side issue. Contact the processor's status line to confirm.\n\n## When to Escalate\n- BS-504 persists after 1 hour\n- Manual batch force also fails\n- Batch totals appear incorrect after forced settlement",
      source: "KB-3891",
      confidence: 0.97,
      category: "Troubleshooting",
      references: [
        { label: "Batch Settlement Guide", url: "#kb-batch-settlement" },
        { label: "Processor Status Dashboard", url: "#processor-status" },
        { label: "BS Error Code Reference", url: "#kb-bs-errors" },
      ],
      suggestedResponse: "Error BS-504 means the batch submission timed out connecting to your payment processor. Since it's affecting all 12 locations simultaneously, this is almost certainly a processor-side issue — likely a brief maintenance window. You can either wait 15 minutes and retry, or use Manual Batch Force (Settings → Batch → Force Settlement) which bypasses the normal handshake. I'd recommend trying the manual force on one location first to confirm it works.",
    },
  ],
  "display": [
    {
      id: "ck-4",
      title: "VX520 Display Settings & Adjustments",
      content: "The VX520 uses a monochrome LCD without backlight brightness control. The Contrast setting (0–100%) adjusts display visibility. Recommended: 70–85% for well-lit environments.",
      fullContent: "## VX520 Display Settings\n\n## Display Specifications\n- Monochrome LCD, 128×64 pixels\n- No adjustable backlight (fixed intensity)\n- Contrast is the primary visibility control\n\n## Adjusting Contrast\n1. Press the **menu** key (or enter supervisor mode)\n2. Navigate to **Settings** → **Display** → **Contrast**\n3. Use the **+** and **–** keys to adjust (0–100%)\n4. Press **Enter** to confirm\n\n## Recommended Settings\n- **Bright environments** (gas stations, outdoor): 75–85%\n- **Normal indoor**: 60–70%\n- **Low light**: 45–55%\n\n## Troubleshooting\n- If display is completely blank: Hold power for 10 seconds to hard reset\n- If display shows artifacts: May indicate LCD cable issue (see KB-3500)\n- Contrast resets after firmware update: Re-apply manually",
      source: "KB-1890",
      confidence: 0.89,
      category: "Configuration",
      references: [
        { label: "VX520 User Manual", url: "#kb-vx520-manual" },
        { label: "Display Troubleshooting", url: "#kb-display-issues" },
      ],
      suggestedResponse: "The VX520 doesn't have a brightness control — it uses Contrast instead to adjust display visibility. Go to Settings → Display → Contrast, then use the + and – keys to adjust. For a gas station environment, I'd recommend setting it to 75–85% for best readability. Press Enter to save.",
    },
  ],
};

export const availableAgents = [
  { id: "agent-01", name: "Alex Rivera", status: "available" },
  { id: "agent-02", name: "Jordan Park", status: "available" },
  { id: "agent-03", name: "Sam Mitchell", status: "busy" },
  { id: "agent-04", name: "Casey Williams", status: "available" },
];
