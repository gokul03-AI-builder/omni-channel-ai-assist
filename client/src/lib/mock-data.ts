import type {
  Customer,
  DeviceInfo,
  Call,
  TranscriptEntry,
  AISuggestion,
  ChatMessage,
  Ticket,
  PastCall,
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
    model: "Verifone P400",
    serialNumber: "P4-2847-XK91",
    firmwareVersion: "v4.1.8",
    lastUpdated: "2025-12-10",
    status: "active",
    connectionType: "Ethernet",
    osVersion: "Verix V OS 2.4.1",
  },
  "cust-002": {
    model: "Verifone V240m",
    serialNumber: "V2-5931-MN44",
    firmwareVersion: "v3.8.2",
    lastUpdated: "2025-11-28",
    status: "active",
    connectionType: "Wi-Fi / 4G LTE",
    osVersion: "Android 10 (AAOS)",
  },
  "cust-003": {
    model: "Verifone e285",
    serialNumber: "E2-7712-QP63",
    firmwareVersion: "v5.0.1",
    lastUpdated: "2026-01-15",
    status: "maintenance",
    connectionType: "Bluetooth / Wi-Fi",
    osVersion: "Engage OS 1.2",
  },
  "cust-004": {
    model: "Verifone VX 520",
    serialNumber: "VX-1193-RT28",
    firmwareVersion: "v2.9.4",
    lastUpdated: "2025-09-05",
    status: "active",
    connectionType: "Dial-up / Ethernet",
    osVersion: "Verix V OS 2.1.0",
  },
};

export const initialCalls: Call[] = [
  {
    id: "call-001",
    customerId: "cust-001",
    customerName: "Sarah Chen",
    status: "active",
    startTime: "10:02:00",
    duration: 187,
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
    source: "KB-2847",
    confidence: 0.94,
    category: "Troubleshooting",
  },
  t5: {
    id: "s2",
    title: "P400 Firmware Update Available: v4.2.1",
    content:
      "Critical update addresses NFC contactless failures (E-301, E-302, E-305). Remote push available for Premium accounts. Update includes improved antenna calibration and faster tap response times. Deployment time: ~3 minutes.",
    source: "FW-UPDATE-2847",
    confidence: 0.88,
    category: "Firmware",
  },
  t8: {
    id: "s3",
    title: "NFC Module Reset Success Rate",
    content:
      "NFC module reset resolves contactless issues in 82% of P400 cases. If unsuccessful, escalate to Level 2 for hardware diagnostics. Alternative: Schedule on-site technician via Field Service Portal.",
    source: "KB-3012",
    confidence: 0.91,
    category: "Resolution",
  },
};

export const suggestionsByTranscriptId2: Record<string, AISuggestion> = {
  "t2-3": {
    id: "s2-1",
    title: "V240m Wi-Fi Compatibility: WPA3 Known Issue",
    content:
      "V240m terminals on firmware v3.8.x may experience intermittent disconnections when connected to WPA3-only routers. Workaround: Configure router to WPA2/WPA3 mixed mode, or update terminal firmware to v3.9.0+ which adds full WPA3 support.",
    source: "KB-4102",
    confidence: 0.96,
    category: "Connectivity",
  },
  "t2-5": {
    id: "s2-2",
    title: "V240m Firmware v3.9.0 Release Notes",
    content:
      "Latest firmware adds WPA3 support, improved Bluetooth LE pairing, and fixes cellular handoff delays. Available for remote push to Enterprise accounts. OTA update size: 48MB.",
    source: "FW-V240M-390",
    confidence: 0.85,
    category: "Firmware",
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
