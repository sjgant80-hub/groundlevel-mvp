export const ENCOUNTER_TYPES = [
  { id: "stop_search", label: "Stop & Search", icon: "🔍", color: "#f97316" },
  { id: "road_stop", label: "Road Stop", icon: "🚗", color: "#60a5fa" },
  { id: "private_security", label: "Private Security", icon: "🏢", color: "#a78bfa" },
  { id: "council_enforcement", label: "Council Enforcement", icon: "📋", color: "#fbbf24" },
  { id: "bailiff", label: "Bailiff", icon: "📄", color: "#f87171" },
  { id: "pcso", label: "PCSO", icon: "🦺", color: "#4ade80" },
]

export const UK_RIGHTS = {
  stop_search: {
    title: "Stop & Search",
    canDo: [
      "Search you if they have reasonable grounds (s1 PACE)",
      "Search under s60 if authorised — NO grounds needed",
      "Ask your name and address IF they suspect offence",
      "Detain you for as long as reasonably required for the search",
    ],
    cannotDo: [
      "Search you without reasonable grounds (outside s60)",
      "Remove more than outer coat, jacket and gloves in public",
      "Conduct an intimate search on the street",
      "Refuse to give their name, station and reason for search",
      "Stop you purely based on race, appearance or area",
    ],
    yourRights: [
      "Ask why you're being searched — they MUST tell you",
      "Ask for their name and collar number",
      "Request a written record of the search",
      "Film the interaction — this is legal in public",
      "Remain silent — you do not have to answer questions",
    ],
    script: "Officer, under what power are you searching me? Please state your collar number for the record. I do not consent to this search but I will not resist.",
    legislation: "PACE 1984 s1, Criminal Justice and Public Order Act 1994 s60",
    complaint_body: "IOPC (Independent Office for Police Conduct)",
  },
  road_stop: {
    title: "Road Stop",
    canDo: [
      "Stop any vehicle under s163 Road Traffic Act",
      "Ask for licence, insurance and MOT certificate",
      "Breathalyse you if they suspect drink driving",
      "Search vehicle if they have reasonable grounds",
    ],
    cannotDo: [
      "Detain you beyond what is reasonably necessary",
      "Search you personally without separate grounds",
      "Demand your phone without a court order",
      "Require you to unlock your phone",
    ],
    yourRights: [
      "Ask why you've been stopped",
      "Film the interaction from your vehicle",
      "Remain silent beyond providing required documents",
      "Ask if you are free to go once documents checked",
    ],
    script: "I have stopped as required by law. My documents are available. Under what power are you detaining me beyond this? Am I free to go?",
    legislation: "Road Traffic Act 1988 s163, PACE 1984",
    complaint_body: "IOPC or local Police Professional Standards",
  },
  private_security: {
    title: "Private Security",
    canDo: [
      "Ask you to leave private property",
      "Make a citizen's arrest if they witness an indictable offence",
      "Use reasonable force to remove trespassers",
      "Issue fines IF they have written authorisation from the landowner",
    ],
    cannotDo: [
      "Detain you against your will in most circumstances",
      "Demand your personal details — they have NO police powers",
      "Issue legally enforceable fines without proper authority",
      "Search you without your consent",
      "Pretend to have police powers they do not have",
    ],
    yourRights: [
      "Ask to see their SIA licence — they must produce it",
      "Refuse to give your details — they cannot legally compel you",
      "Leave the area if on public land",
      "Film them — this is legal",
      "Challenge any fine — most private security fines are unenforceable",
    ],
    script: "Please show me your SIA licence. Under what legal authority are you detaining me? I do not consent to being searched. I am filming this interaction.",
    legislation: "Private Security Industry Act 2001, Trespass is civil not criminal in most cases",
    complaint_body: "Security Industry Authority (SIA)",
  },
  council_enforcement: {
    title: "Council Enforcement",
    canDo: [
      "Issue Fixed Penalty Notices for specific statutory offences",
      "Request your name and address for certain offences",
      "Issue PCNs for parking contraventions",
      "Enforce specific bylaws in their jurisdiction",
    ],
    cannotDo: [
      "Issue fines for things not covered by specific legislation",
      "Demand your details without lawful authority",
      "Physically detain you",
      "Search you",
      "Fine you for feeding pigeons UNLESS a specific bylaw exists in that area",
    ],
    yourRights: [
      "Ask for their authorisation and ID",
      "Ask what specific legislation the fine is issued under",
      "Appeal any FPN — success rates are high for improper issuance",
      "Film the interaction",
      "Challenge the fine — many are unenforceable",
    ],
    script: "Please show me your authorisation and ID. Under what specific legislation is this notice being issued? I require the exact act and section. I will be appealing this notice.",
    legislation: "Local Government Act 2000, specific bylaws vary by council",
    complaint_body: "Local Government Ombudsman",
  },
  bailiff: {
    title: "Bailiff",
    canDo: [
      "Enter if you let them in (after first peaceful entry)",
      "Take goods to the value of the debt once inside",
      "Return on a warrant if you do not let them in",
      "Clamp or remove vehicles on public roads in some cases",
    ],
    cannotDo: [
      "Force entry on a first visit in most circumstances",
      "Enter between 9pm and 6am",
      "Enter if only children or vulnerable adults are present",
      "Take essential items: clothing, bedding, tools of trade up to £1350",
      "Take goods belonging to others",
    ],
    yourRights: [
      "Ask to see their enforcement agent certificate",
      "Ask for written notice of the debt",
      "Do NOT let them in — keep the door closed",
      "Call the creditor directly to negotiate",
      "Seek free debt advice immediately",
    ],
    script: "I require you to show your enforcement agent certificate and the notice of enforcement. I am not granting entry. Please post any notices through the letterbox.",
    legislation: "Taking Control of Goods Regulations 2013, Tribunals Courts and Enforcement Act 2007",
    complaint_body: "Civil Enforcement Association or County Court",
  },
  pcso: {
    title: "PCSO",
    canDo: [
      "Issue fixed penalty notices for certain offences",
      "Detain you for 30 minutes to await arrival of a constable",
      "Confiscate alcohol in designated areas",
      "Request your name and address in certain circumstances",
    ],
    cannotDo: [
      "Arrest you — they are NOT police constables",
      "Search you in most circumstances",
      "Use force beyond what a citizen can use",
      "Exercise most police powers",
    ],
    yourRights: [
      "Ask if they are a sworn police constable — if not, their powers are very limited",
      "Refuse to wait 30 minutes — they cannot physically detain you",
      "Film the interaction",
      "Ask for their ID number",
    ],
    script: "Are you a sworn police constable? If not, under what specific power are you detaining me? I am aware PCSOs have limited powers and cannot arrest me.",
    legislation: "Police Reform Act 2002 Schedule 4",
    complaint_body: "Local Police Professional Standards Department",
  },
}

export const BLUFF_PHRASES = [
  { phrase: "you have to give me your name", verdict: "LIKELY FALSE", detail: "Only required in specific circumstances. Ask under what specific legislation they're demanding this.", risk: "high" },
  { phrase: "you must stop filming", verdict: "FALSE", detail: "Filming in public is legal in the UK. There is no general law against it.", risk: "high" },
  { phrase: "i can search you", verdict: "CHECK", detail: "Only with reasonable grounds (s1 PACE) or under s60 authorisation. Ask which power.", risk: "medium" },
  { phrase: "you're obstructing a police officer", verdict: "CHECK", detail: "Only applies if wilfully obstructing. Asking questions or filming is NOT obstruction.", risk: "medium" },
  { phrase: "you have to come with me", verdict: "CHECK", detail: "Unless under arrest, you do not have to go anywhere. Ask 'Am I under arrest or am I free to go?'", risk: "high" },
  { phrase: "i'm issuing you a fine", verdict: "CHECK", detail: "Ask for the specific legislation. Many enforcement fines have no legal basis.", risk: "medium" },
  { phrase: "you must give me your phone", verdict: "FALSE", detail: "Police need a court order to seize your phone in most circumstances.", risk: "high" },
  { phrase: "trespassing is a criminal offence", verdict: "FALSE", detail: "In most cases trespass is a civil matter, not criminal. There are limited exceptions.", risk: "high" },
  { phrase: "i don't need to give you my number", verdict: "FALSE", detail: "Police officers must provide their name and collar number on request.", risk: "high" },
  { phrase: "you have to unlock your phone", verdict: "FALSE", detail: "You cannot be compelled to unlock your phone without a court order in most circumstances.", risk: "high" },
]

export const FLAG_LEVELS = {
  green: { label: "COMPLIANT", color: "#4ade80", bg: "rgba(74,222,128,0.1)", desc: "Encounter appears lawful" },
  amber: { label: "CAUTION", color: "#fbbf24", bg: "rgba(251,191,36,0.1)", desc: "Possible overreach detected" },
  red: { label: "OVERREACH", color: "#f87171", bg: "rgba(248,113,113,0.1)", desc: "Likely unlawful conduct — document everything" },
}

export const ANALYSE_SYSTEM = `You are a UK civil rights legal analyst for GroundLevel — an app that helps ordinary people understand their rights during encounters with police, security and enforcement officers.

Analyse the encounter description and return ONLY valid JSON:
{
  "flag": "green" | "amber" | "red",
  "summary": "2 sentence plain English summary of what happened legally",
  "violations": ["specific potential violation 1", "specific potential violation 2"],
  "your_position": "what the person's legal position is — 2 sentences",
  "next_steps": ["step 1", "step 2", "step 3"],
  "complaint_worthy": true | false,
  "complaint_body": "which body to complain to if applicable — IOPC, council, SIA etc",
  "severity": 1-10,
  "key_legislation": "the most relevant legislation"
}

Base analysis on actual UK law: PACE 1984, Police Reform Act 2002, Human Rights Act 1998, relevant bylaws.
Be accurate. Do not exaggerate. Do not downplay genuine overreach.
Severity 1-3 = minor, 4-6 = moderate, 7-10 = serious overreach.`
