// Geographic coordinates, corridors, POIs, and terrain features for the USA Member Map

export interface LatLng {
  lat: number;
  lng: number;
}

export interface HighwayRoute {
  name: string;
  shield: string;
  color: string;
  label: string;
  description: string;
  points: LatLng[];
}

export interface TruckingPoi {
  id: string;
  name: string;
  state: string;
  lat: number;
  lng: number;
  type: 'megastop' | 'fuel' | 'pass' | 'scale' | 'rest_area';
  corridor: string;
  details: string;
  statusText?: string;
  statusType?: 'open' | 'bypass' | 'hazard' | 'full' | 'available';
  elevationFt?: number;
}

export interface WeatherHazardZone {
  id: string;
  name: string;
  type: 'high_wind' | 'blizzard' | 'severe_storm' | 'dense_fog';
  corridor: string;
  state: string;
  lat: number;
  lng: number;
  radiusKm: number;
  advisoryText: string;
  severity: 'warning' | 'advisory' | 'watch';
}

// Bounding box for contiguous US equirectangular/mercator projection
export const MAP_BOUNDS = {
  MIN_LNG: -125.0,
  MAX_LNG: -66.5,
  MIN_LAT: 24.2,
  MAX_LAT: 49.6,
  WIDTH: 960,
  HEIGHT: 600
};

export function projectCoords(lat: number, lng: number, width = MAP_BOUNDS.WIDTH, height = MAP_BOUNDS.HEIGHT) {
  const { MIN_LNG, MAX_LNG, MIN_LAT, MAX_LAT } = MAP_BOUNDS;
  // X coordinate linearly maps longitude
  const x = ((lng - MIN_LNG) / (MAX_LNG - MIN_LNG)) * width;
  
  // Mercator-like latitude stretch for realistic US projection
  const latRad = (lat * Math.PI) / 180;
  const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
  const minMercN = Math.log(Math.tan(Math.PI / 4 + (MIN_LAT * Math.PI) / 360));
  const maxMercN = Math.log(Math.tan(Math.PI / 4 + (MAX_LAT * Math.PI) / 360));
  const y = height - ((mercN - minMercN) / (maxMercN - minMercN)) * height;
  
  return { 
    x: Math.max(15, Math.min(width - 15, x)), 
    y: Math.max(15, Math.min(height - 15, y)) 
  };
}

// High-fidelity US Perimeter Coastline and Border coordinates (lat, lng)
export const USA_COASTLINE_POINTS: LatLng[] = [
  // Northwest (Washington - Puget Sound / Cape Flattery)
  { lat: 49.00, lng: -122.75 },
  { lat: 48.38, lng: -124.64 }, // Cape Flattery
  { lat: 47.00, lng: -124.18 }, // Grays Harbor
  { lat: 46.25, lng: -124.05 }, // Columbia River mouth
  { lat: 44.60, lng: -124.08 }, // Newport, OR
  { lat: 43.35, lng: -124.36 }, // Coos Bay, OR
  { lat: 42.00, lng: -124.21 }, // OR / CA border
  { lat: 40.44, lng: -124.41 }, // Cape Mendocino, CA
  { lat: 38.00, lng: -123.00 }, // Point Reyes
  { lat: 37.77, lng: -122.51 }, // San Francisco Bay
  { lat: 36.60, lng: -121.90 }, // Monterey Bay
  { lat: 34.45, lng: -120.47 }, // Point Conception
  { lat: 33.72, lng: -118.27 }, // Los Angeles / Long Beach
  { lat: 32.71, lng: -117.16 }, // San Diego
  { lat: 32.53, lng: -117.12 }, // Tijuana US/MX border

  // US - Mexico Southern Border
  { lat: 32.72, lng: -114.72 }, // Yuma, AZ
  { lat: 31.33, lng: -110.94 }, // Nogales, AZ
  { lat: 31.33, lng: -108.20 }, // New Mexico bootheel
  { lat: 31.78, lng: -106.50 }, // El Paso / Ciudad Juárez
  { lat: 30.50, lng: -104.90 }, // Rio Grande curve
  { lat: 29.25, lng: -103.50 }, // Big Bend National Park
  { lat: 29.80, lng: -101.40 }, // Del Rio, TX
  { lat: 27.50, lng: -99.50 },  // Laredo, TX
  { lat: 26.05, lng: -97.80 },  // McAllen, TX
  { lat: 25.95, lng: -97.14 },  // Brownsville, TX / Gulf mouth

  // Gulf Coast
  { lat: 27.80, lng: -97.40 }, // Corpus Christi, TX
  { lat: 28.70, lng: -95.60 }, // Matagorda
  { lat: 29.30, lng: -94.80 }, // Galveston, TX
  { lat: 29.70, lng: -93.80 }, // Sabine Pass (TX/LA)
  { lat: 29.60, lng: -91.50 }, // Atchafalaya Bay
  { lat: 29.10, lng: -89.25 }, // Mississippi River Delta tip
  { lat: 30.15, lng: -89.60 }, // Lake Borgne / New Orleans
  { lat: 30.30, lng: -88.10 }, // Mobile Bay, AL
  { lat: 30.40, lng: -87.20 }, // Pensacola, FL
  { lat: 30.15, lng: -85.70 }, // Panama City, FL
  { lat: 29.70, lng: -85.00 }, // Cape San Blas
  { lat: 29.80, lng: -83.50 }, // Big Bend, FL
  { lat: 28.00, lng: -82.80 }, // Tampa Bay
  { lat: 26.50, lng: -82.00 }, // Fort Myers
  { lat: 25.15, lng: -81.10 }, // Cape Sable / Everglades
  { lat: 24.55, lng: -81.78 }, // Key West, FL

  // Atlantic Coast & Eastern Seaboard
  { lat: 25.76, lng: -80.19 }, // Miami, FL
  { lat: 26.71, lng: -80.05 }, // West Palm Beach
  { lat: 28.40, lng: -80.60 }, // Cape Canaveral
  { lat: 29.90, lng: -81.31 }, // St. Augustine
  { lat: 30.35, lng: -81.40 }, // Jacksonville, FL
  { lat: 31.15, lng: -81.50 }, // Brunswick, GA
  { lat: 32.08, lng: -80.90 }, // Savannah, GA
  { lat: 32.78, lng: -79.93 }, // Charleston, SC
  { lat: 33.70, lng: -78.90 }, // Myrtle Beach
  { lat: 34.20, lng: -77.95 }, // Cape Fear, NC
  { lat: 35.25, lng: -75.50 }, // Cape Hatteras / Outer Banks
  { lat: 36.85, lng: -75.97 }, // Virginia Beach
  { lat: 37.10, lng: -75.95 }, // Chesapeake Bay mouth
  { lat: 38.30, lng: -75.10 }, // Ocean City, MD
  { lat: 38.80, lng: -74.90 }, // Cape May, NJ
  { lat: 40.50, lng: -74.20 }, // New York Harbor / Staten Island
  { lat: 41.05, lng: -71.85 }, // Montauk Point (Long Island)
  { lat: 41.50, lng: -71.30 }, // Newport, RI
  { lat: 41.70, lng: -69.95 }, // Cape Cod, MA
  { lat: 42.36, lng: -71.05 }, // Boston Harbor
  { lat: 43.66, lng: -70.25 }, // Portland, ME
  { lat: 44.40, lng: -68.20 }, // Bar Harbor / Acadia
  { lat: 44.90, lng: -66.98 }, // West Quoddy Head / Lubec, ME (Easternmost point)

  // Northern Border with Canada (East to West)
  { lat: 47.46, lng: -69.05 }, // Northern Maine tip
  { lat: 45.00, lng: -71.50 }, // NH / VT 45th parallel
  { lat: 45.00, lng: -74.70 }, // St. Lawrence River
  { lat: 43.60, lng: -76.50 }, // Lake Ontario south shore
  { lat: 42.90, lng: -78.90 }, // Niagara / Buffalo
  { lat: 41.70, lng: -82.50 }, // Lake Erie south shore / Cleveland
  { lat: 41.70, lng: -83.50 }, // Toledo, OH
  { lat: 42.33, lng: -83.05 }, // Detroit / Windsor border
  { lat: 43.00, lng: -82.40 }, // Port Huron / Lake Huron
  { lat: 45.80, lng: -84.70 }, // Straits of Mackinac
  { lat: 46.50, lng: -84.35 }, // Sault Ste. Marie
  { lat: 46.80, lng: -87.40 }, // Upper Peninsula / Lake Superior
  { lat: 48.00, lng: -89.60 }, // Grand Portage, MN
  { lat: 49.38, lng: -95.15 }, // Northwest Angle / Lake of the Woods (Northernmost lower-48)
  { lat: 49.00, lng: -97.23 }, // 49th Parallel - North Dakota border (Pembina)
  { lat: 49.00, lng: -104.05 }, // ND / MT border
  { lat: 49.00, lng: -111.00 }, // Sweet Grass, MT
  { lat: 49.00, lng: -116.05 }, // Idaho panhandle
  { lat: 49.00, lng: -120.00 }, // Cascade Mountains border
  { lat: 49.00, lng: -122.75 }  // Blaine, WA (Pacific closing point)
];

// Great Lakes Cutout Polygons (for water depth realism)
export const GREAT_LAKES = [
  {
    name: 'Lake Superior',
    points: [
      { lat: 46.80, lng: -92.00 },
      { lat: 47.70, lng: -90.30 },
      { lat: 48.00, lng: -88.90 },
      { lat: 47.50, lng: -86.50 },
      { lat: 46.50, lng: -84.80 },
      { lat: 46.50, lng: -86.00 },
      { lat: 46.90, lng: -88.40 },
      { lat: 46.70, lng: -90.50 }
    ]
  },
  {
    name: 'Lake Michigan',
    points: [
      { lat: 45.80, lng: -85.50 },
      { lat: 44.50, lng: -86.20 },
      { lat: 43.00, lng: -86.30 },
      { lat: 41.70, lng: -87.10 },
      { lat: 41.85, lng: -87.60 },
      { lat: 43.05, lng: -87.90 },
      { lat: 44.50, lng: -87.80 },
      { lat: 45.70, lng: -87.00 }
    ]
  },
  {
    name: 'Lake Huron',
    points: [
      { lat: 45.90, lng: -84.40 },
      { lat: 45.40, lng: -82.00 },
      { lat: 43.50, lng: -82.20 },
      { lat: 43.00, lng: -82.40 },
      { lat: 43.70, lng: -83.80 },
      { lat: 44.80, lng: -83.30 }
    ]
  },
  {
    name: 'Lake Erie',
    points: [
      { lat: 42.00, lng: -83.20 },
      { lat: 41.50, lng: -82.80 },
      { lat: 41.50, lng: -81.70 },
      { lat: 42.10, lng: -80.10 },
      { lat: 42.80, lng: -78.90 },
      { lat: 42.60, lng: -81.20 }
    ]
  },
  {
    name: 'Lake Ontario',
    points: [
      { lat: 43.30, lng: -79.80 },
      { lat: 43.25, lng: -77.60 },
      { lat: 43.60, lng: -76.20 },
      { lat: 44.10, lng: -76.50 },
      { lat: 43.90, lng: -78.20 }
    ]
  }
];

// Major US Rivers for Topographic / Navigation Realism
export const MAJOR_RIVERS = [
  {
    name: 'Mississippi River',
    color: '#0284c7',
    points: [
      { lat: 47.25, lng: -95.20 },
      { lat: 45.00, lng: -93.20 },
      { lat: 43.80, lng: -91.25 },
      { lat: 41.52, lng: -90.57 },
      { lat: 38.62, lng: -90.18 }, // St. Louis confluence
      { lat: 37.00, lng: -89.15 }, // Cairo / Ohio confluence
      { lat: 35.14, lng: -90.05 }, // Memphis
      { lat: 32.35, lng: -90.87 }, // Vicksburg
      { lat: 29.95, lng: -90.07 }, // New Orleans
      { lat: 29.15, lng: -89.25 }  // Gulf outlet
    ]
  },
  {
    name: 'Ohio River',
    color: '#0284c7',
    points: [
      { lat: 40.44, lng: -80.00 }, // Pittsburgh
      { lat: 39.10, lng: -84.51 }, // Cincinnati
      { lat: 38.25, lng: -85.75 }, // Louisville
      { lat: 37.00, lng: -89.15 }  // Joins Mississippi
    ]
  },
  {
    name: 'Missouri River',
    color: '#0284c7',
    points: [
      { lat: 47.90, lng: -104.00 },
      { lat: 47.00, lng: -101.00 },
      { lat: 44.40, lng: -100.35 },
      { lat: 42.50, lng: -96.40 },
      { lat: 41.25, lng: -95.90 }, // Omaha
      { lat: 39.10, lng: -94.60 }, // Kansas City
      { lat: 38.62, lng: -90.18 }  // Joins Mississippi
    ]
  },
  {
    name: 'Columbia River',
    color: '#0284c7',
    points: [
      { lat: 49.00, lng: -117.60 },
      { lat: 46.20, lng: -119.10 },
      { lat: 45.60, lng: -121.20 },
      { lat: 45.62, lng: -122.67 }, // Portland / Vancouver
      { lat: 46.25, lng: -124.05 }  // Pacific outlet
    ]
  },
  {
    name: 'Colorado River',
    color: '#0284c7',
    points: [
      { lat: 40.20, lng: -105.80 },
      { lat: 39.08, lng: -108.55 },
      { lat: 36.90, lng: -111.50 }, // Lake Powell
      { lat: 36.00, lng: -114.75 }, // Hoover Dam
      { lat: 32.72, lng: -114.72 }  // Yuma
    ]
  }
];

// Topographic Mountain Chains & Elevated Ridges for Satellite/Topo Shading
export const MOUNTAIN_RANGES = [
  {
    name: 'Rocky Mountain Spine',
    type: 'rockies',
    points: [
      { lat: 49.0, lng: -114.0 },
      { lat: 47.0, lng: -112.5 },
      { lat: 44.5, lng: -110.0 },
      { lat: 42.0, lng: -108.0 },
      { lat: 39.5, lng: -106.0 }, // Colorado 14ers
      { lat: 36.5, lng: -105.5 }, // Sangre de Cristo
      { lat: 34.0, lng: -106.0 }
    ]
  },
  {
    name: 'Sierra Nevada & Cascades',
    type: 'pacific_ranges',
    points: [
      { lat: 49.0, lng: -121.0 },
      { lat: 47.0, lng: -121.5 }, // Mt. Rainier
      { lat: 44.5, lng: -121.8 }, // Mt. Hood
      { lat: 41.5, lng: -122.2 }, // Mt. Shasta
      { lat: 39.3, lng: -120.3 }, // Donner Summit
      { lat: 36.5, lng: -118.3 }, // Mt. Whitney
      { lat: 34.5, lng: -118.0 }
    ]
  },
  {
    name: 'Appalachian Mountain Chain',
    type: 'appalachians',
    points: [
      { lat: 34.5, lng: -84.5 },  // North Georgia
      { lat: 35.8, lng: -82.5 },  // Blue Ridge / Great Smokies
      { lat: 38.0, lng: -79.5 },  // Shenandoah / Virginia
      { lat: 41.0, lng: -76.0 },  // Pennsylvania Alleghenies
      { lat: 43.0, lng: -73.0 },  // Green Mountains / Adirondacks
      { lat: 45.0, lng: -70.5 }   // White Mountains, ME
    ]
  }
];

// State Label Coordinates (lat, lng) with state code
export const US_STATE_CENTROIDS = [
  { code: 'WA', name: 'Washington', lat: 47.4, lng: -120.5 },
  { code: 'OR', name: 'Oregon', lat: 44.0, lng: -120.5 },
  { code: 'CA', name: 'California', lat: 37.0, lng: -119.5 },
  { code: 'NV', name: 'Nevada', lat: 39.0, lng: -116.5 },
  { code: 'ID', name: 'Idaho', lat: 44.0, lng: -114.5 },
  { code: 'MT', name: 'Montana', lat: 47.0, lng: -109.5 },
  { code: 'WY', name: 'Wyoming', lat: 43.0, lng: -107.5 },
  { code: 'UT', name: 'Utah', lat: 39.5, lng: -111.5 },
  { code: 'AZ', name: 'Arizona', lat: 34.2, lng: -111.5 },
  { code: 'NM', name: 'New Mexico', lat: 34.5, lng: -106.0 },
  { code: 'CO', name: 'Colorado', lat: 39.0, lng: -105.5 },
  { code: 'ND', name: 'North Dakota', lat: 47.5, lng: -100.5 },
  { code: 'SD', name: 'South Dakota', lat: 44.5, lng: -100.0 },
  { code: 'NE', name: 'Nebraska', lat: 41.5, lng: -99.5 },
  { code: 'KS', name: 'Kansas', lat: 38.5, lng: -98.0 },
  { code: 'OK', name: 'Oklahoma', lat: 35.5, lng: -97.5 },
  { code: 'TX', name: 'Texas', lat: 31.5, lng: -99.0 },
  { code: 'MN', name: 'Minnesota', lat: 46.0, lng: -94.5 },
  { code: 'IA', name: 'Iowa', lat: 42.0, lng: -93.5 },
  { code: 'MO', name: 'Missouri', lat: 38.5, lng: -92.5 },
  { code: 'AR', name: 'Arkansas', lat: 35.0, lng: -92.5 },
  { code: 'LA', name: 'Louisiana', lat: 31.0, lng: -92.0 },
  { code: 'WI', name: 'Wisconsin', lat: 44.5, lng: -89.5 },
  { code: 'IL', name: 'Illinois', lat: 40.0, lng: -89.0 },
  { code: 'MI', name: 'Michigan', lat: 43.5, lng: -84.5 },
  { code: 'IN', name: 'Indiana', lat: 40.0, lng: -86.2 },
  { code: 'OH', name: 'Ohio', lat: 40.2, lng: -82.8 },
  { code: 'KY', name: 'Kentucky', lat: 37.8, lng: -85.0 },
  { code: 'TN', name: 'Tennessee', lat: 36.0, lng: -86.0 },
  { code: 'MS', name: 'Mississippi', lat: 32.8, lng: -89.7 },
  { code: 'AL', name: 'Alabama', lat: 32.8, lng: -86.8 },
  { code: 'GA', name: 'Georgia', lat: 32.8, lng: -83.5 },
  { code: 'FL', name: 'Florida', lat: 28.0, lng: -81.7 },
  { code: 'SC', name: 'South Carolina', lat: 34.0, lng: -81.0 },
  { code: 'NC', name: 'North Carolina', lat: 35.5, lng: -79.5 },
  { code: 'VA', name: 'Virginia', lat: 37.5, lng: -78.8 },
  { code: 'WV', name: 'West Virginia', lat: 38.6, lng: -80.5 },
  { code: 'PA', name: 'Pennsylvania', lat: 41.0, lng: -77.5 },
  { code: 'NY', name: 'New York', lat: 43.0, lng: -75.5 },
  { code: 'ME', name: 'Maine', lat: 45.5, lng: -69.0 },
  { code: 'VT', name: 'Vermont', lat: 44.0, lng: -72.6 },
  { code: 'NH', name: 'New Hampshire', lat: 43.7, lng: -71.5 },
  { code: 'MA', name: 'Massachusetts', lat: 42.3, lng: -71.8 }
];

// Comprehensive 10 Major Commercial Freight Highways
export const EXTENDED_INTERSTATE_HIGHWAYS: HighwayRoute[] = [
  {
    name: 'I-80',
    shield: '80',
    color: '#f59e0b', // Amber/Gold
    label: 'I-80 Transcontinental Freight Spine',
    description: 'San Francisco → Reno → Salt Lake City → Cheyenne → Omaha → Des Moines → Chicago → Cleveland → NYC',
    points: [
      { lat: 37.77, lng: -122.41 },
      { lat: 38.58, lng: -121.49 }, // Sacramento
      { lat: 39.31, lng: -120.32 }, // Donner Pass
      { lat: 39.52, lng: -119.81 }, // Reno
      { lat: 40.83, lng: -115.76 }, // Elko, NV
      { lat: 40.76, lng: -111.89 }, // Salt Lake City
      { lat: 41.27, lng: -110.96 }, // Evanston, WY
      { lat: 41.53, lng: -109.87 }, // Little America, WY
      { lat: 41.79, lng: -107.24 }, // Rawlins
      { lat: 41.68, lng: -106.41 }, // Elk Mountain Wind Zone
      { lat: 41.31, lng: -105.59 }, // Laramie
      { lat: 41.13, lng: -104.82 }, // Cheyenne
      { lat: 41.14, lng: -100.76 }, // North Platte
      { lat: 40.70, lng: -99.08 },  // Kearney
      { lat: 40.81, lng: -96.70 },  // Lincoln
      { lat: 41.25, lng: -95.93 },  // Omaha
      { lat: 41.58, lng: -93.62 },  // Des Moines
      { lat: 41.60, lng: -90.78 },  // Walcott / Iowa 80 TS
      { lat: 41.50, lng: -88.10 },  // Joliet, IL
      { lat: 41.87, lng: -87.62 },  // Chicago
      { lat: 41.60, lng: -87.34 },  // Gary, IN
      { lat: 41.65, lng: -85.00 },  // Indiana Toll Road
      { lat: 41.50, lng: -81.70 },  // Cleveland
      { lat: 41.10, lng: -77.50 },  // Pennsylvania Keystone Shortway
      { lat: 40.91, lng: -74.17 },  // Paterson, NJ
      { lat: 40.71, lng: -74.00 }   // NYC / George Washington Bridge
    ]
  },
  {
    name: 'I-40',
    shield: '40',
    color: '#38bdf8', // Cyan / Sky Blue
    label: 'I-40 Sunbelt Transcontinental Corridor',
    description: 'Barstow, CA → Flagstaff → Albuquerque → Amarillo → Oklahoma City → Little Rock → Memphis → Nashville → Raleigh',
    points: [
      { lat: 34.89, lng: -117.02 }, // Barstow
      { lat: 34.84, lng: -114.61 }, // Needles
      { lat: 35.19, lng: -114.05 }, // Kingman
      { lat: 35.19, lng: -111.65 }, // Flagstaff
      { lat: 35.03, lng: -110.70 }, // Winslow
      { lat: 35.52, lng: -108.74 }, // Gallup
      { lat: 35.08, lng: -106.65 }, // Albuquerque
      { lat: 35.04, lng: -103.73 }, // Tucumcari
      { lat: 35.22, lng: -101.83 }, // Amarillo, TX
      { lat: 35.53, lng: -98.96 },  // Clinton, OK
      { lat: 35.46, lng: -97.51 },  // Oklahoma City
      { lat: 35.38, lng: -94.42 },  // Fort Smith, AR
      { lat: 34.74, lng: -92.28 },  // Little Rock
      { lat: 35.14, lng: -90.04 },  // Memphis
      { lat: 35.61, lng: -88.82 },  // Jackson, TN
      { lat: 36.16, lng: -86.78 },  // Nashville
      { lat: 35.96, lng: -83.92 },  // Knoxville
      { lat: 35.59, lng: -82.55 },  // Asheville
      { lat: 35.77, lng: -78.63 },  // Raleigh
      { lat: 34.22, lng: -77.94 }   // Wilmington, NC
    ]
  },
  {
    name: 'I-10',
    shield: '10',
    color: '#10b981', // Emerald Green
    label: 'I-10 Southern Pass Express',
    description: 'Santa Monica → Phoenix → Tucson → El Paso → San Antonio → Houston → Baton Rouge → New Orleans → Mobile → Jacksonville',
    points: [
      { lat: 34.01, lng: -118.49 }, // Santa Monica
      { lat: 34.05, lng: -117.50 }, // Ontario / Inland Empire
      { lat: 33.72, lng: -116.21 }, // Indio
      { lat: 33.61, lng: -114.60 }, // Blythe
      { lat: 33.44, lng: -112.07 }, // Phoenix
      { lat: 32.22, lng: -110.97 }, // Tucson
      { lat: 32.31, lng: -106.77 }, // Las Cruces
      { lat: 31.76, lng: -106.48 }, // El Paso
      { lat: 31.05, lng: -104.83 }, // Van Horn
      { lat: 30.69, lng: -102.87 }, // Fort Stockton
      { lat: 30.56, lng: -100.64 }, // Sonora
      { lat: 29.42, lng: -98.49 },  // San Antonio
      { lat: 29.76, lng: -95.36 },  // Houston
      { lat: 30.08, lng: -94.10 },  // Beaumont
      { lat: 30.22, lng: -92.01 },  // Lafayette
      { lat: 30.45, lng: -91.18 },  // Baton Rouge
      { lat: 29.95, lng: -90.07 },  // New Orleans
      { lat: 30.36, lng: -89.09 },  // Gulfport
      { lat: 30.69, lng: -88.04 },  // Mobile
      { lat: 30.42, lng: -87.21 },  // Pensacola
      { lat: 30.43, lng: -84.28 },  // Tallahassee
      { lat: 30.33, lng: -81.65 }   // Jacksonville
    ]
  },
  {
    name: 'I-95',
    shield: '95',
    color: '#ec4899', // Pink / Magenta
    label: 'I-95 Eastern Seaboard Megalopolis',
    description: 'Miami → Daytona → Savannah → Richmond → Washington DC → Baltimore → Philadelphia → NYC → Boston → Houlton, ME',
    points: [
      { lat: 25.76, lng: -80.19 }, // Miami
      { lat: 26.71, lng: -80.05 }, // West Palm
      { lat: 29.21, lng: -81.02 }, // Daytona Beach
      { lat: 30.33, lng: -81.65 }, // Jacksonville
      { lat: 32.08, lng: -81.09 }, // Savannah
      { lat: 33.68, lng: -80.34 }, // Florence
      { lat: 35.05, lng: -78.87 }, // Fayetteville
      { lat: 35.77, lng: -78.63 }, // Raleigh / Kenly 95
      { lat: 37.54, lng: -77.43 }, // Richmond
      { lat: 38.30, lng: -77.46 }, // Fredericksburg
      { lat: 38.90, lng: -77.03 }, // Washington DC Beltway
      { lat: 39.29, lng: -76.61 }, // Baltimore Fort McHenry
      { lat: 39.74, lng: -75.54 }, // Wilmington, DE
      { lat: 39.95, lng: -75.16 }, // Philadelphia
      { lat: 40.71, lng: -74.00 }, // New Jersey Turnpike / NYC
      { lat: 41.30, lng: -72.92 }, // New Haven, CT
      { lat: 41.82, lng: -71.41 }, // Providence, RI
      { lat: 42.36, lng: -71.05 }, // Boston
      { lat: 43.07, lng: -70.76 }, // Portsmouth, NH
      { lat: 43.66, lng: -70.25 }, // Portland, ME
      { lat: 44.80, lng: -68.77 }, // Bangor, ME
      { lat: 46.12, lng: -67.84 }  // Houlton, ME (Canadian border)
    ]
  },
  {
    name: 'I-5',
    shield: '5',
    color: '#a855f7', // Purple
    label: 'I-5 Pacific Coast Freight Artery',
    description: 'San Diego → Los Angeles (Grapevine) → Central Valley → Sacramento → Shasta → Eugene → Portland → Seattle → Canada',
    points: [
      { lat: 32.53, lng: -117.03 }, // San Ysidro Mexican border
      { lat: 32.71, lng: -117.16 }, // San Diego
      { lat: 33.74, lng: -117.87 }, // Santa Ana
      { lat: 34.05, lng: -118.24 }, // Los Angeles
      { lat: 34.89, lng: -118.88 }, // Tejon Pass / Grapevine (4,160 ft)
      { lat: 35.37, lng: -119.01 }, // Bakersfield
      { lat: 36.33, lng: -120.30 }, // Coalinga / Harris Ranch
      { lat: 37.95, lng: -121.29 }, // Stockton
      { lat: 38.58, lng: -121.49 }, // Sacramento
      { lat: 40.58, lng: -122.39 }, // Redding
      { lat: 41.31, lng: -122.31 }, // Mt. Shasta
      { lat: 41.98, lng: -122.60 }, // Siskiyou Summit (4,310 ft)
      { lat: 42.24, lng: -122.87 }, // Medford, OR
      { lat: 44.05, lng: -123.08 }, // Eugene
      { lat: 44.94, lng: -123.03 }, // Salem
      { lat: 45.51, lng: -122.67 }, // Portland
      { lat: 47.03, lng: -122.90 }, // Olympia
      { lat: 47.25, lng: -122.44 }, // Tacoma
      { lat: 47.60, lng: -122.33 }, // Seattle
      { lat: 48.75, lng: -122.47 }, // Bellingham
      { lat: 49.00, lng: -122.75 }  // Blaine, WA (Peace Arch border)
    ]
  },
  {
    name: 'I-70',
    shield: '70',
    color: '#06b6d4', // Teal
    label: 'I-70 Rocky Mountain & Heartland Link',
    description: 'Cove Fort, UT → Grand Junction → Eisenhower Tunnel → Denver → Kansas City → St. Louis → Indianapolis → Columbus → Baltimore',
    points: [
      { lat: 38.60, lng: -112.58 }, // Cove Fort, UT (I-15 junction)
      { lat: 38.96, lng: -110.15 }, // Green River, UT
      { lat: 39.06, lng: -108.55 }, // Grand Junction, CO
      { lat: 39.55, lng: -107.32 }, // Glenwood Canyon
      { lat: 39.63, lng: -106.37 }, // Vail Pass (10,662 ft)
      { lat: 39.68, lng: -105.92 }, // Eisenhower Tunnel (11,158 ft)
      { lat: 39.73, lng: -104.99 }, // Denver
      { lat: 39.28, lng: -102.71 }, // Limon, CO
      { lat: 38.84, lng: -97.61 },  // Salina, KS
      { lat: 39.05, lng: -95.67 },  // Topeka
      { lat: 39.09, lng: -94.57 },  // Kansas City
      { lat: 38.95, lng: -92.33 },  // Columbia, MO
      { lat: 38.62, lng: -90.19 },  // St. Louis (Gateway Arch)
      { lat: 39.11, lng: -88.54 },  // Effingham, IL
      { lat: 39.46, lng: -87.41 },  // Terre Haute, IN
      { lat: 39.76, lng: -86.15 },  // Indianapolis
      { lat: 39.82, lng: -84.89 },  // Richmond, IN
      { lat: 39.96, lng: -82.99 },  // Columbus, OH
      { lat: 40.06, lng: -80.72 },  // Wheeling, WV
      { lat: 40.16, lng: -80.24 },  // Washington, PA
      { lat: 39.64, lng: -78.76 },  // Cumberland, MD
      { lat: 39.41, lng: -77.41 },  // Frederick, MD
      { lat: 39.29, lng: -76.61 }   // Baltimore
    ]
  },
  {
    name: 'I-35',
    shield: '35',
    color: '#eab308', // Warm Yellow
    label: 'I-35 NAFTA International Trade Chute',
    description: 'Laredo (World Trade Bridge) → San Antonio → Austin → Dallas/Fort Worth → OKC → Wichita → Kansas City → Des Moines → Twin Cities → Duluth',
    points: [
      { lat: 27.50, lng: -99.50 }, // Laredo Border
      { lat: 29.42, lng: -98.49 }, // San Antonio
      { lat: 29.70, lng: -98.12 }, // New Braunfels (Buc-ee's)
      { lat: 30.26, lng: -97.74 }, // Austin
      { lat: 31.54, lng: -97.14 }, // Waco
      { lat: 32.77, lng: -96.79 }, // Dallas
      { lat: 33.21, lng: -97.13 }, // Denton
      { lat: 34.17, lng: -97.14 }, // Ardmore, OK
      { lat: 35.46, lng: -97.51 }, // Oklahoma City
      { lat: 37.68, lng: -97.33 }, // Wichita, KS
      { lat: 38.39, lng: -96.18 }, // Emporia
      { lat: 39.09, lng: -94.57 }, // Kansas City
      { lat: 40.00, lng: -93.80 }, // Bethany, MO
      { lat: 41.58, lng: -93.62 }, // Des Moines
      { lat: 43.15, lng: -93.20 }, // Mason City
      { lat: 44.08, lng: -93.22 }, // Owatonna, MN
      { lat: 44.97, lng: -93.26 }, // Minneapolis / St. Paul
      { lat: 45.80, lng: -92.97 }, // Hinckley
      { lat: 46.78, lng: -92.10 }  // Duluth Lake Port
    ]
  },
  {
    name: 'I-75',
    shield: '75',
    color: '#f97316', // Orange
    label: 'I-75 Midwest to Florida Heavy Freight Chute',
    description: 'Detroit → Toledo → Cincinnati → Lexington → Knoxville → Chattanooga → Atlanta → Macon → Tampa → Miami',
    points: [
      { lat: 42.33, lng: -83.05 }, // Detroit
      { lat: 41.65, lng: -83.53 }, // Toledo
      { lat: 40.74, lng: -84.10 }, // Lima, OH
      { lat: 39.75, lng: -84.19 }, // Dayton
      { lat: 39.10, lng: -84.51 }, // Cincinnati / Brent Spence Bridge
      { lat: 38.04, lng: -84.50 }, // Lexington, KY
      { lat: 36.97, lng: -84.08 }, // Corbin, KY
      { lat: 35.96, lng: -83.92 }, // Knoxville
      { lat: 35.04, lng: -85.30 }, // Chattanooga
      { lat: 33.74, lng: -84.38 }, // Atlanta
      { lat: 32.84, lng: -83.63 }, // Macon, GA
      { lat: 32.45, lng: -83.74 }, // Perry, GA (Weigh Station)
      { lat: 30.83, lng: -83.27 }, // Valdosta
      { lat: 29.65, lng: -82.32 }, // Gainesville, FL
      { lat: 29.18, lng: -82.14 }, // Ocala
      { lat: 27.95, lng: -82.45 }, // Tampa
      { lat: 26.14, lng: -81.79 }, // Naples / Alligator Alley
      { lat: 25.86, lng: -80.31 }  // Hialeah / Miami
    ]
  },
  {
    name: 'I-90',
    shield: '90',
    color: '#60a5fa', // Blue
    label: 'I-90 Northern Tier Transcontinental',
    description: 'Seattle (Snoqualmie) → Spokane → Missoula → Billings → Rapid City → Sioux Falls → Madison → Chicago → Buffalo → Boston',
    points: [
      { lat: 47.60, lng: -122.33 }, // Seattle
      { lat: 47.42, lng: -121.41 }, // Snoqualmie Pass (3,022 ft)
      { lat: 47.00, lng: -120.55 }, // Ellensburg
      { lat: 47.65, lng: -117.42 }, // Spokane
      { lat: 47.67, lng: -116.78 }, // Coeur d'Alene, ID
      { lat: 46.87, lng: -113.99 }, // Missoula, MT
      { lat: 45.68, lng: -111.03 }, // Bozeman
      { lat: 45.78, lng: -108.50 }, // Billings
      { lat: 44.08, lng: -103.23 }, // Rapid City, SD
      { lat: 43.54, lng: -96.73 },  // Sioux Falls
      { lat: 43.81, lng: -91.23 },  // La Crosse, WI
      { lat: 43.07, lng: -89.40 },  // Madison
      { lat: 42.27, lng: -89.09 },  // Rockford, IL
      { lat: 41.87, lng: -87.62 },  // Chicago
      { lat: 42.88, lng: -78.87 },  // Buffalo, NY
      { lat: 43.04, lng: -76.14 },  // Syracuse
      { lat: 42.65, lng: -73.75 },  // Albany
      { lat: 42.36, lng: -71.05 }   // Boston
    ]
  }
];

// Rich Trucking POIs (Megastops, Passes, Scales, Rest areas)
export const TRUCKING_POIS: TruckingPoi[] = [
  // Legendary Megastops & Travel Centers
  {
    id: 'poi-iowa80',
    name: 'Iowa 80 (World\'s Largest Truckstop)',
    state: 'IA',
    lat: 41.6042,
    lng: -90.7813,
    type: 'megastop',
    corridor: 'I-80',
    details: '900 truck parking spots, 24 service bays, dental clinic, custom embroidery, trucking museum & movie theatre.',
    statusText: '🅿️ 420+ Parking Spots Open',
    statusType: 'available'
  },
  {
    id: 'poi-littleamerica',
    name: 'Little America Travel Center',
    state: 'WY',
    lat: 41.5319,
    lng: -109.8763,
    type: 'megastop',
    corridor: 'I-80',
    details: 'Historic high-plains haven, marble showers, 50¢ ice cream, dedicated repair shop & warm soup buffet.',
    statusText: '🅿️ 250 Spots Available',
    statusType: 'available'
  },
  {
    id: 'poi-petrolaramie',
    name: 'Petro Laramie #311',
    state: 'WY',
    lat: 41.3113,
    lng: -105.5911,
    type: 'fuel',
    corridor: 'I-80',
    details: 'Critical winter staging point before Elk Mountain pass. Iron Skillet restaurant & heavy tow staging.',
    statusText: '⛽ High Volume Diesel Fueling',
    statusType: 'open'
  },
  {
    id: 'poi-lovesamarillo',
    name: 'Love\'s Travel Stop #405',
    state: 'TX',
    lat: 35.2017,
    lng: -101.1068,
    type: 'fuel',
    corridor: 'I-40',
    details: 'Heart of the Texas Panhandle. Speedco tire & lube, Chester\'s Chicken, clean private showers.',
    statusText: '🅿️ Parking Filling Fast (30 left)',
    statusType: 'available'
  },
  {
    id: 'poi-bucees',
    name: 'Buc-ee\'s Travel Center',
    state: 'TX',
    lat: 29.7020,
    lng: -98.0850,
    type: 'megastop',
    corridor: 'I-35',
    details: '120 fuel pumps, fresh warm brisket carving station, world-famous pristine restrooms.',
    statusText: '⛽ Open 24/7 (Bobtails Only)',
    statusType: 'open'
  },
  {
    id: 'poi-jubitz',
    name: 'Jubitz Travel Center',
    state: 'OR',
    lat: 45.6025,
    lng: -122.6800,
    type: 'megastop',
    corridor: 'I-5',
    details: 'World-renowned driver amenities, cinema, Ponderosa lounge, Jacuzzi tubs & complete chassis dyno service.',
    statusText: '🅿️ Reserve Truck Parking Active',
    statusType: 'available'
  },
  {
    id: 'poi-pilot-effingham',
    name: 'Pilot Travel Center #44',
    state: 'IL',
    lat: 39.1120,
    lng: -88.5410,
    type: 'fuel',
    corridor: 'I-70 / I-57',
    details: 'Midwest crossroads super-hub, Denny\'s, PJ Fresh pizza, 280 truck spaces, DEF at all islands.',
    statusText: '🅿️ Plenty of Staging Space',
    statusType: 'available'
  },

  // Legendary Mountain Passes & Grade Challenges
  {
    id: 'pass-donner',
    name: 'Donner Pass Summit (7,057 ft)',
    state: 'CA',
    lat: 39.3157,
    lng: -120.3283,
    type: 'pass',
    corridor: 'I-80',
    details: 'Steep 6% grade into Truckee, sudden Sierra blizzards. Chain control checkpoints active in winter.',
    statusText: '⚠️ Chain Advisory Level 1 Active',
    statusType: 'hazard',
    elevationFt: 7057
  },
  {
    id: 'pass-eisenhower',
    name: 'Eisenhower-Johnson Tunnel (11,158 ft)',
    state: 'CO',
    lat: 39.6800,
    lng: -105.9200,
    type: 'pass',
    corridor: 'I-70',
    details: 'Highest vehicular tunnel in the world. Strict Hazmat restrictions (must detour over Loveland Pass).',
    statusText: '🟢 Tunnel Clear • Hazmat Escort Ready',
    statusType: 'open',
    elevationFt: 11158
  },
  {
    id: 'pass-elkmountain',
    name: 'Elk Mountain Wind Chokepoint (MM 250)',
    state: 'WY',
    lat: 41.6847,
    lng: -106.4114,
    type: 'pass',
    corridor: 'I-80',
    details: 'Notorious 65+ MPH crosswinds capable of blowing over light and empty trailers. High-profile closure gate.',
    statusText: '💨 High Wind Warning: Gusts 55 MPH',
    statusType: 'hazard',
    elevationFt: 7260
  },
  {
    id: 'pass-cabbage',
    name: 'Cabbage Hill / Deadman Pass (3,600 ft)',
    state: 'OR',
    lat: 45.5971,
    lng: -118.5528,
    type: 'pass',
    corridor: 'I-84',
    details: 'Double-hairpin 6% descent over 6 miles. Multiple runaway truck ramps, brake check mandatory.',
    statusText: '⚠️ Mandatory Brake Check Station Open',
    statusType: 'hazard',
    elevationFt: 3600
  },
  {
    id: 'pass-monteagle',
    name: 'Monteagle Mountain Grade',
    state: 'TN',
    lat: 35.2410,
    lng: -85.8340,
    type: 'pass',
    corridor: 'I-24',
    details: 'Treacherous descent with sharp curves. Lower gear crawl required for heavy coils and loaded reefers.',
    statusText: '🟢 Pavement Dry • Fog Dissipated',
    statusType: 'open',
    elevationFt: 1920
  },

  // Weigh Stations & DOT Inspection Scales
  {
    id: 'scale-echo',
    name: 'Echo Port of Entry Weigh Station',
    state: 'UT',
    lat: 41.0100,
    lng: -111.4500,
    type: 'scale',
    corridor: 'I-80',
    details: 'Utah HP dynamic weigh-in-motion. PrePass and Drivewyze green light bypass active.',
    statusText: '⚖️ PrePass Green Light Bypass: ON',
    statusType: 'bypass'
  },
  {
    id: 'scale-banning',
    name: 'Banning Weigh Station & CHP Inspection',
    state: 'CA',
    lat: 33.9250,
    lng: -116.8750,
    type: 'scale',
    corridor: 'I-10',
    details: 'Major California entry scale. Rigorous Level 1 mechanical and logbook inspections.',
    statusText: '🔴 Scale Open: Pulling Rigs for Inspection',
    statusType: 'open'
  },
  {
    id: 'scale-hope',
    name: 'Hope Weigh Station',
    state: 'AR',
    lat: 33.6700,
    lng: -93.5900,
    type: 'scale',
    corridor: 'I-30',
    details: 'Arkansas Highway Police static scale with certified axle check.',
    statusText: '⚖️ Scale Open (Random Pulls)',
    statusType: 'open'
  },
  {
    id: 'scale-perry',
    name: 'Perry Weigh Station',
    state: 'GA',
    lat: 32.4500,
    lng: -83.7400,
    type: 'scale',
    corridor: 'I-75',
    details: 'High-volume Georgia interstate checkpoint. Weight-in-motion with 85% bypass rate.',
    statusText: '⚖️ PrePass Green Bypass Running',
    statusType: 'bypass'
  }
];

// Active Weather Advisories & Highway Hazard Zones
export const ACTIVE_WEATHER_ZONES: WeatherHazardZone[] = [
  {
    id: 'weather-wy-wind',
    name: 'Wyoming High Wind Rollover Advisory',
    type: 'high_wind',
    corridor: 'I-80',
    state: 'WY',
    lat: 41.6847,
    lng: -106.4114,
    radiusKm: 70,
    advisoryText: 'High Wind Warning: Sustained 45 MPH, gusts up to 62 MPH. Closed to light/high-profile vehicles under 40,000 lbs.',
    severity: 'warning'
  },
  {
    id: 'weather-donner-ice',
    name: 'Sierra Nevada Winter Ridge Advisory',
    type: 'blizzard',
    corridor: 'I-80',
    state: 'CA',
    lat: 39.3157,
    lng: -120.3283,
    radiusKm: 60,
    advisoryText: 'Winter Weather Advisory: Wet snow over Donner Summit (7,057 ft). Reduced visibility, chain check MM 160.',
    severity: 'advisory'
  },
  {
    id: 'weather-plains-storm',
    name: 'Midwest Severe Squall Band',
    type: 'severe_storm',
    corridor: 'I-70 / I-35',
    state: 'MO',
    lat: 38.9500,
    lng: -93.5000,
    radiusKm: 90,
    advisoryText: 'Thunderstorm squall line with heavy downpours and sudden ponding on I-70 between Columbia and Kansas City.',
    severity: 'watch'
  }
];
