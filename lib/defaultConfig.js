export const THEME_DEFAULTS = {
  mode: "dark",
  bg: "#0a0e17",
  panel: "#121926",
  panel2: "#1a2334",
  text: "#f1f5f9",
  muted: "#94a3b8",
  accent: "#0284c7",
  accent2: "#10b981",
  line: "#f59e0b",
  headingFont: "Manrope",
  bodyFont: "Manrope",
  radius: 10,
  logo: "/apple-touch-icon.png",
  hero: "/images/about-trucks.jpg"
};

export const GAMES = {
  ETS2: { short: "ETS 2", full: "Euro Truck Simulator 2", color: "#0284c7", iconClass: "bi bi-truck" },
  ATS:  { short: "ATS",   full: "American Truck Simulator", color: "#10b981", iconClass: "bi bi-truck-front-fill" }
};

export function getKenyanTime(utcTimeStr) {
  if (!utcTimeStr) return '18:00 EAT';
  const clean = utcTimeStr.replace(' UTC', '').trim();
  const parts = clean.split(':');
  const hour = parseInt(parts[0], 10);
  const min = parts[1] || '00';
  if (isNaN(hour)) return '18:00 EAT';
  const eatHour = (hour + 3) % 24;
  return `${String(eatHour).padStart(2, '0')}:${min} EAT`;
}

export const TIMETABLE_CONVOYS = [
  
  { day: 'Monday', dayShort: 'MON', time: '15:00', eatTime: '18:00 EAT', hour: 15, dayIndex: 1, game: 'ETS 2', detail: 'BASE MAP', server: 'TruckersMP Sim 1', roomId: 'GTC-MON-18' },
  { day: 'Monday', dayShort: 'MON', time: '17:00', eatTime: '20:00 EAT', hour: 17, dayIndex: 1, game: 'ETS 2', detail: 'BRAZIL MAP', server: 'SCS Dedicated', roomId: 'GTC-MON-20' },
  { day: 'Monday', dayShort: 'MON', time: '19:00', eatTime: '22:00 EAT', hour: 19, dayIndex: 1, game: 'ETS 2', detail: 'MAP DLC', server: 'TruckersMP Sim 2', roomId: 'GTC-MON-22' },

  { day: 'Tuesday', dayShort: 'TUE', time: '15:00', eatTime: '18:00 EAT', hour: 15, dayIndex: 2, game: 'ETS 2', detail: 'CARGO DLC', server: 'TruckersMP Sim 1', roomId: 'GTC-TUE-18' },
  { day: 'Tuesday', dayShort: 'TUE', time: '17:00', eatTime: '20:00 EAT', hour: 17, dayIndex: 2, game: 'ETS 2', detail: 'EAA MAP', server: 'SCS Dedicated', roomId: 'GTC-TUE-20' },
  { day: 'Tuesday', dayShort: 'TUE', time: '19:00', eatTime: '22:00 EAT', hour: 19, dayIndex: 2, game: 'ETS 2', detail: 'BASE MAP', server: 'TruckersMP Sim 2', roomId: 'GTC-TUE-22' },

  { day: 'Wednesday', dayShort: 'WED', time: '15:00', eatTime: '18:00 EAT', hour: 15, dayIndex: 3, game: 'ATS', detail: 'BASE MAP', server: 'TruckersMP US Sim', roomId: 'GTC-WED-18' },
  { day: 'Wednesday', dayShort: 'WED', time: '17:00', eatTime: '20:00 EAT', hour: 17, dayIndex: 3, game: 'ETS 2 (TMP)', detail: 'BASE MAP', server: 'TruckersMP Sim 1', roomId: 'GTC-WED-20' },
  { day: 'Wednesday', dayShort: 'WED', time: '19:00', eatTime: '22:00 EAT', hour: 19, dayIndex: 3, game: 'ETS 2 (TMP)', detail: 'MAP DLC', server: 'TruckersMP Sim 2', roomId: 'GTC-WED-22' },

  { day: 'Thursday', dayShort: 'THU', time: '15:00', eatTime: '18:00 EAT', hour: 15, dayIndex: 4, game: 'BRAZIL MAP', detail: 'CARGO DLC', server: 'SCS Dedicated GTC', roomId: 'GTC-THU-18' },
  { day: 'Thursday', dayShort: 'THU', time: '17:00', eatTime: '20:00 EAT', hour: 17, dayIndex: 4, game: 'ETS 2', detail: 'BASE MAP', server: 'TruckersMP Sim 1', roomId: 'GTC-THU-20' },
  { day: 'Thursday', dayShort: 'THU', time: '19:00', eatTime: '22:00 EAT', hour: 19, dayIndex: 4, game: 'ETS 2', detail: 'CARGO DLC', server: 'TruckersMP Sim 2', roomId: 'GTC-THU-22' },

  { day: 'Friday', dayShort: 'FRI', time: '15:00', eatTime: '18:00 EAT', hour: 15, dayIndex: 5, game: 'ETS 2', detail: 'MAP DLC', server: 'TruckersMP Sim 1', roomId: 'GTC-FRI-18' },
  { day: 'Friday', dayShort: 'FRI', time: '17:00', eatTime: '20:00 EAT', hour: 17, dayIndex: 5, game: 'ETS 2 (TMP)', detail: 'CARGO DLC', server: 'TruckersMP Event Server', roomId: 'GTC-FRI-20' },
  { day: 'Friday', dayShort: 'FRI', time: '19:00', eatTime: '22:00 EAT', hour: 19, dayIndex: 5, game: 'ETS 2', detail: 'BASE MAP', server: 'TruckersMP Sim 2', roomId: 'GTC-FRI-22' },

  { day: 'Saturday', dayShort: 'SAT', time: '15:00', eatTime: '18:00 EAT', hour: 15, dayIndex: 6, game: 'EAA MAP', detail: 'CARGO DLC', server: 'SCS Dedicated GTC', roomId: 'GTC-SAT-18' },
  { day: 'Saturday', dayShort: 'SAT', time: '17:00', eatTime: '20:00 EAT', hour: 17, dayIndex: 6, game: 'ETS 2', detail: 'MAP DLC', server: 'TruckersMP Sim 1', roomId: 'GTC-SAT-20' },
  { day: 'Saturday', dayShort: 'SAT', time: '19:00', eatTime: '22:00 EAT', hour: 19, dayIndex: 6, game: 'ETS 2 (TMP)', detail: 'BASE MAP', server: 'TruckersMP Sim 2', roomId: 'GTC-SAT-22' },

  { day: 'Sunday', dayShort: 'SUN', time: '15:00', eatTime: '18:00 EAT', hour: 15, dayIndex: 0, game: 'ETS 2 (TMP)', detail: 'BASE MAP', server: 'TruckersMP Sim 1', roomId: 'GTC-SUN-18' },
  { day: 'Sunday', dayShort: 'SUN', time: '17:00', eatTime: '20:00 EAT', hour: 17, dayIndex: 0, game: 'ETS 2 (TMP)', detail: 'MAP DLC', server: 'TruckersMP Sim 2', roomId: 'GTC-SUN-20' },
  { day: 'Sunday', dayShort: 'SUN', time: '19:00', eatTime: '22:00 EAT', hour: 19, dayIndex: 0, game: 'ATS', detail: 'BASE MAP', server: 'TruckersMP US Sim', roomId: 'GTC-SUN-22' },
];

export function buildConvoyFromSlot(slot, referenceDate = new Date(), dayOffset = null) {
  if (!slot) return null;

  const currentDow = referenceDate.getUTCDay();
  const currentHour = referenceDate.getUTCHours();
  const currentMin = referenceDate.getUTCMinutes();
  const currentTime = currentHour + currentMin / 60;

  let offset = dayOffset;
  if (offset === null || offset === undefined) {
    offset = (slot.dayIndex - currentDow + 7) % 7;
    if (offset === 0 && slot.hour <= currentTime) {
      offset = 7;
    }
  }

  const target = new Date(referenceDate);
  target.setUTCDate(referenceDate.getUTCDate() + offset);
  target.setUTCHours(slot.hour, 0, 0, 0);

  const meetupHour = slot.hour - 1;
  const meetupStr = `${meetupHour}:30 UTC`;
  const eatTime = slot.eatTime || getKenyanTime(slot.time);
  const eatMeetupTime = getKenyanTime(`${meetupHour}:30`);

  const isATS = slot.game.includes('ATS');
  const isCargo = slot.detail.includes('CARGO');
  const isMapDlc = slot.detail.includes('MAP DLC') || slot.detail.includes('BRAZIL') || slot.detail.includes('EAA');

  return {
    id: `convoy-${slot.dayShort.toLowerCase()}-${slot.time.replace(':', '')}`,
    title: `${slot.game} - ${slot.detail}`,
    subTitle: `Official ${slot.day} ${eatTime} (Kenyan Time) / ${slot.time} UTC Run`,
    game: slot.game,
    day: slot.day,
    dayShort: slot.dayShort,
    time: `${slot.time} UTC`,
    eatTime: eatTime,
    eatMeetupTime: eatMeetupTime,
    formattedTime: `${eatTime} Kenyan Time (${slot.time} UTC)`,
    detail: slot.detail,
    site: slot.server,
    serverType: slot.game.includes('TMP') ? 'TruckersMP' : (slot.server.includes('SCS') ? 'SCS Dedicated' : 'TruckersMP'),
    roomId: slot.roomId,
    voiceChannel: 'Discord Radio CB Channel 19',
    leadDriver: 'Bryan Gaming (Convoy Lead)',
    departureTime: target.toISOString(),
    meetupTime: meetupStr,
    truck: {
      recommended: isATS ? 'Peterbilt 389 / Kenworth W900' : 'Scania S730 / Volvo FH16 750',
      minPower: '500 HP+ recommended',
      livery: 'GTC Official Blue Livery or VTC Colors',
      trailer: isCargo ? 'Heavy Cargo / Lowbed Trailer' : 'Box Trailer / Curtainsider / Flatbed'
    },
    cargo: isCargo ? 'Heavy Industrial Machinery & Cargo Packs' : 'Standard Regional Logistics Freight',
    isDlcCargo: isCargo,
    dlcDetails: isCargo ? 'Cargo DLC required (Heavy / High Power Cargo Pack)' : 'Standard Base Game Cargo (No cargo DLC required)',
    dlcMapRequired: isMapDlc ? `${slot.detail} (Map Expansion Pack Required)` : 'Base Game Map (No map DLC required)',
    mapImage: isATS ? '/images/ats-art.jpg' : '/images/about-trucks.jpg',
    status: 'Confirmed & Open',
    slotsBooked: 6,
    maxSlots: 80,
    speedLimit: isATS ? '65 mph (Convoy pace)' : '80 - 90 km/h (Convoy pace)',
    notes: `Meetup at ${eatMeetupTime} (${meetupStr}). Wheels roll at ${eatTime} (${slot.time} UTC) sharp. CB radio channel 19.`
  };
}

export function getNextUpcomingConvoys(count = 3, referenceDate = new Date(), customSlots = null) {
  const currentDow = referenceDate.getUTCDay();
  const currentHour = referenceDate.getUTCHours();
  const currentMin = referenceDate.getUTCMinutes();
  const currentTime = currentHour + currentMin / 60;
  const pool = (Array.isArray(customSlots) && customSlots.length > 0) ? customSlots : TIMETABLE_CONVOYS;

  const results = [];

  for (let offset = 0; offset < 7 && results.length < count; offset++) {
    const dow = (currentDow + offset) % 7;
    const candidates = pool.filter((c) => c.dayIndex === dow);

    for (const slot of candidates) {
      if (offset > 0 || slot.hour > currentTime) {
        results.push(buildConvoyFromSlot(slot, referenceDate, offset));
        if (results.length >= count) break;
      }
    }
  }

  if (results.length < count) {
    for (const slot of pool) {
      results.push(buildConvoyFromSlot(slot, referenceDate, 7));
      if (results.length >= count) break;
    }
  }

  return results;
}

export function getNextUpcomingConvoy(referenceDate = new Date(), customSlots = null) {
  const pool = (Array.isArray(customSlots) && customSlots.length > 0) ? customSlots : TIMETABLE_CONVOYS;
  const upcoming = getNextUpcomingConvoys(1, referenceDate, pool);
  return upcoming[0] || buildConvoyFromSlot(pool[0], referenceDate, 0);
}

export function getConvoyBySlot(dayOrShort, timeStr, referenceDate = new Date(), customSlots = null) {
  if (!dayOrShort || !timeStr) return null;
  const pool = (Array.isArray(customSlots) && customSlots.length > 0) ? customSlots : TIMETABLE_CONVOYS;
  const match = pool.find((c) => {
    const dayMatches = c.day.toLowerCase() === dayOrShort.toLowerCase() || c.dayShort.toLowerCase() === dayOrShort.toLowerCase();
    const timeMatches = c.time.startsWith(timeStr.slice(0, 2)) || (c.eatTime && c.eatTime.startsWith(timeStr.slice(0, 2)));
    return dayMatches && timeMatches;
  });
  if (!match) return null;
  return buildConvoyFromSlot(match, referenceDate);
}

export const DEFAULT_NEXT_CONVOY = getNextUpcomingConvoy();

export const DEFAULT_COMMUNITY_STATS = {
  countriesRepresented: 32,
  countriesList: [
    { name: "Kenya", code: "KE", count: 48 },
    { name: "United Kingdom", code: "GB", count: 72 },
    { name: "Germany", code: "DE", count: 65 },
    { name: "United States", code: "US", count: 54 },
    { name: "Sweden", code: "SE", count: 38 },
    { name: "Netherlands", code: "NL", count: 32 },
    { name: "France", code: "FR", count: 28 },
    { name: "Poland", code: "PL", count: 26 },
    { name: "Australia", code: "AU", count: 22 },
    { name: "Brazil", code: "BR", count: 35 },
    { name: "Canada", code: "CA", count: 18 },
    { name: "South Africa", code: "ZA", count: 16 },
    { name: "Italy", code: "IT", count: 19 },
    { name: "Turkey", code: "TR", count: 24 }
  ],
  driversOnline: 58,
  staffOnline: 7,
  totalMembers: 495,
  kmsCovered: 1425800,
  deliveriesCompleted: 19840,
  recentHauls: [
    { id: 1, driver: "Bryan Gaming", role: "Convoy Lead", route: "Munich → Milan", kms: 1240, cargo: "Heavy Generators", time: "18m ago", game: "ETS 2" },
    { id: 2, driver: "Klaus_Trucker", role: "Driver", route: "Berlin → Warsaw", kms: 850, cargo: "Automotive Parts", time: "42m ago", game: "ETS 2" },
    { id: 3, driver: "HighwayKing_99", role: "Dispatcher", route: "Los Angeles → Phoenix", kms: 620, cargo: "Fresh Citrus", time: "1h ago", game: "ATS" },
    { id: 4, driver: "Alex_Trans", role: "Driver", route: "London → Rotterdam", kms: 430, cargo: "Medical Supplies", time: "2h ago", game: "ETS 2" },
    { id: 5, driver: "AussieRigger", role: "Driver", route: "Seattle → Portland", kms: 280, cargo: "Lumber", time: "3h ago", game: "ATS" }
  ]
};

export const DEFAULT_PLANNER = {
  label: "2026 Season",
  year: "2026",
  eatOffset: 3,
  pdfUrl: "/GTC-Convoys-Planner.pdf",
  timeSlots: ["16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00", "00:00"],
  days: ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"],
  grid: {
    "16:00": { MON: null, TUE: null, WED: null, THU: null, FRI: null, SAT: null, SUN: null },
    "17:00": { MON: null, TUE: null, WED: null, THU: null, FRI: null, SAT: null, SUN: null },
    "18:00": {
      MON: { game: "ETS 2", detail: "BASE MAP" },
      TUE: { game: "ETS 2", detail: "CARGO DLC" },
      WED: { game: "ATS", detail: "BASE MAP" },
      THU: { game: "BRAZIL MAP", detail: "CARGO DLC" },
      FRI: { game: "ETS 2", detail: "MAP DLC" },
      SAT: { game: "EAA MAP", detail: "CARGO DLC" },
      SUN: { game: "ETS 2 (TMP)", detail: "BASE MAP" },
    },
    "19:00": { MON: null, TUE: null, WED: null, THU: null, FRI: null, SAT: null, SUN: null },
    "20:00": {
      MON: { game: "ETS 2", detail: "BRAZIL MAP" },
      TUE: { game: "ETS 2", detail: "EAA MAP" },
      WED: { game: "ETS 2 (TMP)", detail: "BASE MAP" },
      THU: { game: "ETS 2", detail: "BASE MAP" },
      FRI: { game: "ETS 2 (TMP)", detail: "CARGO DLC" },
      SAT: { game: "ETS 2", detail: "MAP DLC" },
      SUN: { game: "ETS 2 (TMP)", detail: "MAP DLC" },
    },
    "21:00": { MON: null, TUE: null, WED: null, THU: null, FRI: null, SAT: null, SUN: null },
    "22:00": {
      MON: { game: "ETS 2", detail: "MAP DLC" },
      TUE: { game: "ETS 2", detail: "BASE MAP" },
      WED: { game: "ETS 2 (TMP)", detail: "MAP DLC" },
      THU: { game: "ETS 2", detail: "CARGO DLC" },
      FRI: { game: "ETS 2", detail: "BASE MAP" },
      SAT: { game: "ETS 2 (TMP)", detail: "BASE MAP" },
      SUN: { game: "ATS", detail: "BASE MAP" },
    },
    "23:00": { MON: null, TUE: null, WED: null, THU: null, FRI: null, SAT: null, SUN: null },
    "00:00": { MON: null, TUE: null, WED: null, THU: null, FRI: null, SAT: null, SUN: null },
  },
  week: [
    {
      day: "Monday",
      dow: 1,
      convoys: [
        { time: "18:00", game: "ETS 2", detail: "BASE MAP" },
        { time: "20:00", game: "ETS 2", detail: "BRAZIL MAP" },
        { time: "22:00", game: "ETS 2", detail: "MAP DLC" },
      ]
    },
    {
      day: "Tuesday",
      dow: 2,
      convoys: [
        { time: "18:00", game: "ETS 2", detail: "CARGO DLC" },
        { time: "20:00", game: "ETS 2", detail: "EAA MAP" },
        { time: "22:00", game: "ETS 2", detail: "BASE MAP" },
      ]
    },
    {
      day: "Wednesday",
      dow: 3,
      convoys: [
        { time: "18:00", game: "ATS", detail: "BASE MAP" },
        { time: "20:00", game: "ETS 2 (TMP)", detail: "BASE MAP" },
        { time: "22:00", game: "ETS 2 (TMP)", detail: "MAP DLC" },
      ]
    },
    {
      day: "Thursday",
      dow: 4,
      convoys: [
        { time: "18:00", game: "BRAZIL MAP", detail: "CARGO DLC" },
        { time: "20:00", game: "ETS 2", detail: "BASE MAP" },
        { time: "22:00", game: "ETS 2", detail: "CARGO DLC" },
      ]
    },
    {
      day: "Friday",
      dow: 5,
      convoys: [
        { time: "18:00", game: "ETS 2", detail: "MAP DLC" },
        { time: "20:00", game: "ETS 2 (TMP)", detail: "CARGO DLC" },
        { time: "22:00", game: "ETS 2", detail: "BASE MAP" },
      ]
    },
    {
      day: "Saturday",
      dow: 6,
      convoys: [
        { time: "18:00", game: "EAA MAP", detail: "CARGO DLC" },
        { time: "20:00", game: "ETS 2", detail: "MAP DLC" },
        { time: "22:00", game: "ETS 2 (TMP)", detail: "BASE MAP" },
      ]
    },
    {
      day: "Sunday",
      dow: 0,
      convoys: [
        { time: "18:00", game: "ETS 2 (TMP)", detail: "BASE MAP" },
        { time: "20:00", game: "ETS 2 (TMP)", detail: "MAP DLC" },
        { time: "22:00", game: "ATS", detail: "BASE MAP" },
      ]
    }
  ]
};

export const DEFAULT_CONFIG = {
  name: "Global Truckers Community",
  tagline: "Haul Together. Anywhere. Anytime.",
  description: "Worldwide virtual trucking community for ETS 2 and ATS drivers, streamers, VTCs, and independent solo haulers.",
  whatsappUrl: "https://chat.whatsapp.com/DA0RGVlaPJM2hsbi7tGH1m?s=cl&p=a&mlu=4&ilr=4",
  facebookUrl: "https://www.facebook.com/globaltruckerscommunity",
  telegramUrl: "https://t.me/+dPd9rDHL0jlhMzc0",
  discordUrl: "https://discord.gg/NMucFhYaaY",
  steamGroupUrl: "https://steamcommunity.com/groups/globaltruckers",
  truckersmpUrl: "https://truckersmp.com/vtc/globaltruckers",
  pdfPlannerUrl: "/GTC-Convoys-Planner.pdf",
  theme: { ...THEME_DEFAULTS },
  nextConvoy: { ...DEFAULT_NEXT_CONVOY },
  stats: { ...DEFAULT_COMMUNITY_STATS },
  planner: { ...DEFAULT_PLANNER },
  timetableConvoys: [...TIMETABLE_CONVOYS],
  team: [
    {
      id: "bryan",
      name: "Bryan Gaming",
      role: "Founder & Community Lead",
      badge: "Founder",
      country: "Kenya",
      truck: "Scania S730 V8",
      bio: "Gaming tech enthusiast passionate about bringing virtual drivers together across borders.",
      photo: "/apple-touch-icon.png",
      streamUrl: "https://www.tiktok.com/@bryangaming__"
    },
    {
      id: "lead-dispatch",
      name: "Alex_Trans",
      role: "Chief Convoy Dispatcher",
      badge: "Dispatcher",
      country: "United Kingdom",
      truck: "Volvo FH16 750",
      bio: "Coordinates convoy routes, pace car operations, and radio frequencies.",
      photo: "",
      streamUrl: ""
    },
    {
      id: "mod-team",
      name: "Klaus_Trucker",
      role: "Operations & Rules Lead",
      badge: "Staff",
      country: "Germany",
      truck: "MAN TGX Individual",
      bio: "Oversees rules of the road, safe overtaking protocol, and server integrity.",
      photo: "",
      streamUrl: ""
    }
  ],
  streamers: [
    {
      id: "bryan-stream",
      name: "Bryan Gaming",
      platform: "TikTok",
      url: "https://www.tiktok.com/@bryangaming__",
      games: "ETS 2, ATS",
      status: "Official Partner",
      avatar: "/apple-touch-icon.png",
      live: true
    },
    {
      id: "streamer-2",
      name: "Highway King LIVE",
      platform: "Twitch",
      url: "https://twitch.tv",
      games: "ATS & Heavy Haul",
      status: "Community Streamer",
      avatar: "",
      live: false
    },
    {
      id: "streamer-3",
      name: "EuroRoads TV",
      platform: "YouTube",
      url: "https://youtube.com",
      games: "ETS 2 Promods & TruckersMP",
      status: "Community Partner",
      avatar: "",
      live: false
    }
  ],
  news: [
    {
      id: "news-1",
      type: "Official Announcement",
      badge: "Community",
      title: "Alpine Crossing Mega Convoy Scheduled for This Weekend",
      excerpt: "Prepare your engines for an intense heavy cargo journey from Munich to Milan across the Alps pass. Room ID and Discord Radio announced.",
      date: "October 2026",
      image: "/images/about-trucks.jpg",
      readTime: "3 min read"
    },
    {
      id: "news-2",
      type: "Convoy Debrief",
      badge: "Event Recap",
      title: "Over 60 Drivers Reached the Coastline in Route 66 Run",
      excerpt: "A look back at our phenomenal cross-desert convoy with drivers from 14 different virtual trucking companies.",
      date: "October 2026",
      image: "/images/ats-art.jpg",
      readTime: "2 min read"
    },
    {
      id: "news-3",
      type: "Rules & Safety",
      badge: "Safety",
      title: "Standard CB Radio Protocol and Overtaking Etiquette",
      excerpt: "Review our community convoy guidelines to maintain smooth pacing, safe distance, and fun radio chatter.",
      date: "September 2026",
      image: "/images/ets2-art.jpg",
      readTime: "4 min read"
    }
  ],
  gallery: [
    { id: "g1", title: "Sunset Haul Through Scandinavia", game: "ETS 2", src: "/images/about-trucks.jpg", author: "Bryan Gaming" },
    { id: "g2", title: "Desert Sunset Convoy in Nevada", game: "ATS", src: "/images/ats-art.jpg", author: "HighwayKing_99" },
    { id: "g3", title: "Heavy Transport Crossing Germany", game: "ETS 2", src: "/images/ets2-art.jpg", author: "Klaus_Trucker" }
  ]
};

export const GTC_COUNTRIES = [
  "Kenya",
  "Uganda",
  "Tanzania",
  "Rwanda",
  "Burundi",
  "Ethiopia",
  "Somalia",
  "South Sudan",
  "South Africa",
  "Zimbabwe",
  "Zambia",
  "Namibia",
  "Botswana",
  "Mozambique",
  "Malawi",
  "Angola",
  "Nigeria",
  "Ghana",
  "Ivory Coast",
  "Senegal",
  "Cameroon",
  "Democratic Republic of Congo",
  "Egypt",
  "Morocco",
  "Tunisia",
  "Algeria",
  "United Kingdom",
  "Germany",
  "United States",
  "Sweden",
  "Netherlands",
  "France",
  "Poland",
  "Australia",
  "Brazil",
  "Canada",
  "Italy",
  "Turkey",
  "International / Other"
];

export const ETS2_TRUCKS = [
  "Scania S730 V8 Highline",
  "Scania 770S V8 (Next Gen)",
  "Scania S580 V8 Highline",
  "Scania R730 V8 Topline",
  "Scania R580 Streamline",
  "Scania R500 (Next Gen)",
  "Scania R 2009 Topline",
  "Volvo FH16 750 Globetrotter XL",
  "Volvo FH 540 Globetrotter",
  "Volvo FH Aero (2024)",
  "Volvo FH Electric",
  "Volvo FH Classic (2009)",
  "Mercedes-Benz New Actros GigaSpace",
  "Mercedes-Benz Actros 1863 BigSpace",
  "Mercedes-Benz Actros MP3 Megaspace",
  "Mercedes-Benz eActros 600",
  "MAN TGX Individual Lion S 640",
  "MAN TGX 18.640 PerformanceLine",
  "MAN TGX Euro 6 XXL",
  "MAN TGX 2007 Classic",
  "DAF XG+ 530 (New Generation)",
  "DAF XG 480",
  "DAF XF 530 Super Space Cab",
  "DAF XF Euro 6 Super Space",
  "DAF XF105 Super Space Cab",
  "DAF XD Pure Excellence",
  "Renault T High 520 Sleeper",
  "Renault T 480 Evolution",
  "Renault Magnum 480 Legend",
  "Renault Premium Route 460",
  "Renault E-Tech T Electric",
  "Iveco S-Way 570 Active Space",
  "Iveco Stralis Hi-Way 560",
  "Iveco Stralis Active Space"
];

export const ATS_TRUCKS = [
  "Peterbilt 389 UltraCab Sleeper",
  "Peterbilt 389 Flat Top Classic",
  "Peterbilt 579 Next Gen Epik",
  "Peterbilt 579 UltraLoft Sleeper",
  "Peterbilt 589 Sleeper",
  "Kenworth W900 Studio Sleeper",
  "Kenworth W900 100th Anniversary Edition",
  "Kenworth W900 Flat Top Classic",
  "Kenworth T680 Next Gen 76\" Sleeper",
  "Kenworth T680 Hi-Rise Sleeper",
  "Kenworth W990 Long Hood",
  "Freightliner Cascadia 72\" Raised Roof",
  "Freightliner Cascadia Next Gen (2024)",
  "Freightliner Cascadia 48\" Sleeper",
  "Freightliner eCascadia Electric",
  "Freightliner Classic XL",
  "Western Star 57X Stratosphere Sleeper",
  "Western Star 49X Power Hood",
  "Western Star 5700XE High-Roof",
  "Mack Anthem 70\" Stand Up Sleeper",
  "Mack Pinnacle Axle Back 70\" Sleeper",
  "Mack Anthem Day Cab Heavy Duty",
  "International LT Skyrise (Cummins X15)",
  "International LoneStar Skyrise Sleeper",
  "International 9900i Eagle Classic",
  "Volvo VNL 860 Globetrotter (Next Gen)",
  "Volvo VNL 760 Long-Haul Sleeper",
  "Volvo VNL 780 Classic (2014)",
  "Volvo VNL 300 Day Cab"
];

export const GTC_TRUCKS = [
  ...ETS2_TRUCKS,
  ...ATS_TRUCKS,
  "Scania S730 V8",
  "Scania 770S V8",
  "Volvo FH16 750",
  "Mercedes-Benz New Actros MP4",
  "MAN TGX Individual Lion S",
  "DAF XG+ 530",
  "DAF XF 480",
  "Renault T High 520",
  "Iveco S-Way 570",
  "Peterbilt 389 UltraCab",
  "Peterbilt 579 Next Gen",
  "Kenworth W900 Studio Sleeper",
  "Kenworth T680 Next Gen",
  "Freightliner Cascadia",
  "Western Star 57X",
  "Western Star 49X",
  "International LT / LoneStar",
  "Mack Anthem 70"
];

export function isValidGtcCountry(country) {
  if (!country || typeof country !== 'string') return false;
  return GTC_COUNTRIES.includes(country.trim());
}

export function isValidGtcTruck(truck) {
  if (!truck || typeof truck !== 'string') return false;
  const t = truck.trim();
  if (GTC_TRUCKS.includes(t)) return true;
  const knownBrands = [
    'scania', 'volvo', 'mercedes', 'actros', 'man', 'tgx', 'daf', 'renault',
    'iveco', 'peterbilt', 'kenworth', 'freightliner', 'cascadia', 'western star',
    'mack', 'international', 'lonestar'
  ];
  const lower = t.toLowerCase();
  return knownBrands.some((brand) => lower.includes(brand));
}

export function isValidStreamerUrl(url, platform = '') {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (trimmed.length < 8) return false;

  let checkUrl = trimmed;
  if (!/^https?:\/\//i.test(checkUrl)) {
    checkUrl = 'https://' + checkUrl;
  }

  try {
    const parsed = new URL(checkUrl);
    const host = parsed.hostname.toLowerCase();

    const validPlatforms = [
      'tiktok.com',
      'youtube.com',
      'youtu.be',
      'twitch.tv',
      'kick.com',
      'facebook.com',
      'fb.gg',
      'fb.watch'
    ];

    const hasStreamingDomain = validPlatforms.some((d) => host === d || host.endsWith('.' + d));
    if (!hasStreamingDomain) return false;

    if (platform === 'TikTok' && !host.includes('tiktok.com')) return false;
    if (platform === 'YouTube' && !host.includes('youtube.com') && !host.includes('youtu.be')) return false;
    if (platform === 'Twitch' && !host.includes('twitch.tv')) return false;
    if (platform === 'Kick' && !host.includes('kick.com')) return false;
    if (platform === 'Facebook' && !host.includes('facebook.com') && !host.includes('fb.gg') && !host.includes('fb.watch')) return false;

    const path = parsed.pathname.trim();
    if (!path || path === '/' || path.length < 2) return false;

    return true;
  } catch (e) {
    return false;
  }
}

export function normalizeStreamerUrl(url) {
  if (!url || typeof url !== 'string') return '';
  let trimmed = url.trim();
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = `https://${trimmed}`;
  }
  return trimmed;
}


export function validatePasswordSecurity(password, context = '') {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Password is required.' };
  }

  const p = password.trim();

  if (p.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters long.' };
  }

  if (p.length > 64) {
    return { valid: false, error: 'Password must not exceed 64 characters.' };
  }

  if (!/[A-Z]/.test(p)) {
    return { valid: false, error: 'Password must contain at least one uppercase letter (A-Z).' };
  }

  if (!/[a-z]/.test(p)) {
    return { valid: false, error: 'Password must contain at least one lowercase letter (a-z).' };
  }

  if (!/[0-9]/.test(p)) {
    return { valid: false, error: 'Password must contain at least one number (0-9).' };
  }

  if (/^(.)\1+$/i.test(p)) {
    return { valid: false, error: 'Password cannot consist of a single repeated character.' };
  }

  const forbiddenGenerics = [
    'password', 'password123', 'admin2026', 'gtc2026', '12345678', '123456789',
    'qwerty123', 'trucker2026', 'trucking123', 'scania123', 'welcome123',
    'letmein123', 'driver2026', 'iloveyou1', 'monkey123', 'dragon123', 'changeme1'
  ];

  const lower = p.toLowerCase();
  for (const generic of forbiddenGenerics) {
    if (lower === generic || lower === generic + '!' || lower === generic + '@') {
      return { valid: false, error: 'This password is too generic and unsafe. Please create a unique, strong password.' };
    }
  }

  if (context && typeof context === 'string' && context.trim().length >= 3) {
    const cleanContext = context.trim().toLowerCase().split('@')[0].replace(/[^a-z0-9]/g, '');
    if (cleanContext.length >= 4 && lower.includes(cleanContext)) {
      return { valid: false, error: 'Password must not contain your callsign or email address.' };
    }
  }

  return { valid: true, error: null };
}


export function getPermanentLicenseNumber(driverOrId) {
  if (!driverOrId) return 'GTC-DL-2026-1001';

  if (typeof driverOrId === 'object' && driverOrId !== null) {
    if (driverOrId.licenseNumber && typeof driverOrId.licenseNumber === 'string') {
      const existing = driverOrId.licenseNumber.trim();
      if (/^GTC-DL-2026-\d{3,5}$/i.test(existing)) {
        return existing;
      }
    }
  }

  const rawId = typeof driverOrId === 'object' && driverOrId !== null
    ? (driverOrId.id || driverOrId.name || '1001')
    : String(driverOrId);

  const digits = String(rawId).replace(/\D/g, '');
  if (digits && digits.length >= 3) {
    const numPart = digits.length > 5 ? digits.slice(-4) : digits;
    return `GTC-DL-2026-${numPart.padStart(3, '0')}`;
  }

  let hash = 0;
  for (let i = 0; i < rawId.length; i++) {
    hash = (hash << 5) - hash + rawId.charCodeAt(i);
    hash |= 0;
  }
  const stableNum = Math.abs(hash % 9000) + 1000;
  return `GTC-DL-2026-${stableNum}`;
}


export function calculateMemberTenure(joinedAt) {
  const now = new Date();

  if (!joinedAt) {
    return {
      tenureText: 'Joined Today',
      months: 0,
      days: 0,
      badge: 'New Recruit',
      tagline: 'New Recruit • Joined Today',
      joinDateDisplay: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
  }

  let joinDate = new Date(joinedAt);
  if (isNaN(joinDate.getTime())) {
    const parts = String(joinedAt).trim().split(/\s+/);
    if (parts.length >= 2) {
      joinDate = new Date(`${parts[0]} 1, ${parts[1]}`);
    }
  }

  if (isNaN(joinDate.getTime())) {
    joinDate = new Date();
  }

  const diffTime = Math.max(0, now.getTime() - joinDate.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffMonths = Math.floor(diffDays / 30);

  let tenureText = '';
  if (diffDays <= 0) {
    tenureText = 'Joined Today';
  } else if (diffDays === 1) {
    tenureText = '1 Day Active';
  } else if (diffDays < 30) {
    tenureText = `${diffDays} Days Active`;
  } else if (diffMonths < 12) {
    tenureText = `${diffMonths} ${diffMonths === 1 ? 'Month' : 'Months'} Active`;
  } else {
    const years = Math.floor(diffMonths / 12);
    const remMonths = diffMonths % 12;
    tenureText = remMonths > 0
      ? `${years} yr ${remMonths} mo Active`
      : `${years} ${years === 1 ? 'Year' : 'Years'} Active`;
  }

  const joinDateDisplay = joinDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  let badge = 'Active Driver';
  if (diffDays < 14) badge = 'New Recruit';
  else if (diffMonths >= 12) badge = 'Master Convoy Captain';
  else if (diffMonths >= 6) badge = 'Senior Veteran Hauler';
  else if (diffMonths >= 3) badge = 'Certified Road Pilot';
  else badge = 'Active Driver';

  return {
    tenureText,
    months: diffMonths,
    days: diffDays,
    badge,
    tagline: `${badge} • ${tenureText}`,
    joinDateDisplay
  };
}


export function getAuthorizedTrucks(driverOrUser) {
  const games = Array.isArray(driverOrUser?.games) && driverOrUser.games.length > 0
    ? driverOrUser.games
    : ['ETS 2'];
  const primaryTruck = driverOrUser?.truck || 'Scania S730 V8';

  const hasETS2 = games.some((g) => /ets\s*2/i.test(g) || /euro/i.test(g));
  const hasATS = games.some((g) => /ats/i.test(g) || /american/i.test(g));

  const ets2Fleet = [
    { brand: 'Scania', models: 'S730, 770S V8 & R580 Series' },
    { brand: 'Volvo', models: 'FH16 750 & Globetrotter' },
    { brand: 'Mercedes-Benz', models: 'New Actros MP4 / Gigaspace' },
    { brand: 'MAN', models: 'TGX Individual Lion S 640' },
    { brand: 'DAF', models: 'XG+ 530 & XF Super Space' },
    { brand: 'Renault', models: 'T High 520 Sleeper' },
    { brand: 'Iveco', models: 'S-Way 570 & Stralis Hi-Way' }
  ];

  const atsFleet = [
    { brand: 'Peterbilt', models: '389 UltraCab & 579 Next Gen' },
    { brand: 'Kenworth', models: 'W900 Studio Sleeper & T680' },
    { brand: 'Freightliner', models: 'Cascadia 126 DD16' },
    { brand: 'Western Star', models: '57X & 49X Power Hood' },
    { brand: 'Mack', models: 'Anthem 70 Sleeper MP8' },
    { brand: 'International', models: 'LoneStar & LT Cummins X15' }
  ];

  const endorsements = [
    { code: 'CLASS-A', title: 'Heavy Articulated Combinations', desc: 'Single & multi-trailer combinations, B-Doubles & full trailers' },
    { code: 'LOWBED', title: 'Modular Lowloader & Heavy Haul', desc: 'Overweight industrial machinery & multi-axle modular units' },
    { code: 'ADR-HAZ', title: 'ADR Hazardous Cargo & Tankers', desc: 'Certified transport of chemical gases, flammable fuels & explosives' },
    { code: 'CB-RADIO', title: 'Convoy Radiotelephony Pilot', desc: 'Live convoy communications (Discord Radio CB Ch 19)' }
  ];

  if (driverOrUser?.isStreamer || driverOrUser?.role === 'streamer') {
    endorsements.push({
      code: 'MEDIA-LIVE',
      title: 'Broadcaster Convoy Escort',
      desc: 'Authorized live streaming cockpit camera & official media vehicle permit'
    });
  }

  if (driverOrUser?.isDevModder || driverOrUser?.role === 'dev_modder') {
    endorsements.push({
      code: 'DEV-RIG',
      title: 'GTC Rig & Telemetry Diagnostics',
      desc: 'Official vehicle mod tester & live telemetry inspector'
    });
  }

  return {
    primaryTruck,
    hasETS2: hasETS2 || (!hasETS2 && !hasATS),
    hasATS,
    ets2Fleet,
    atsFleet,
    endorsements
  };
}
