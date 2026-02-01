
export type ResourceType = 'money' | 'food' | 'wood' | 'stone' | 'tools' | 'luxury' | 'energy' | 'water' | 'waste' | 'tech';

export interface Resources {
  money: number;
  food: number;
  wood: number;
  stone: number;
  tools: number;
  luxury: number;
  workers: number;
  energy: number;
  water: number;
  waste: number;
  tech: number;
}

export interface MarketPrice {
  current: number;
  trend: 'up' | 'down' | 'stable';
}

export interface Quest {
  title: string;
  isCompleted: boolean;
}

export interface GameEvent {
  name: string;
  description: string;
}

export type BuildingCategory = 'residential' | 'production' | 'public' | 'commercial' | 'infrastructure';

export type BuildingType = 
  // Residential
  | 'starter_home' | 'small_shack' | 'suburban_house' | 'modern_villa' | 'luxury_mansion' | 'apartment' | 'skyscraper' | 'penthouse_tower' | 'capsule_hotel' | 'eco_pod'
  // Production
  | 'scavenger_hut' | 'farm' | 'orchard' | 'quarry' | 'iron_mine' | 'workshop' | 'factory' | 'chemical_plant' | 'robotics_lab' | 'biotech_greenhouse' | 'nano_forge'
  // Public
  | 'school' | 'university' | 'hospital' | 'clinic' | 'park' | 'stadium' | 'library' | 'museum' | 'fire_station' | 'police_station' | 'military_base' | 'cinema' | 'cathedral'
  // Commercial
  | 'trade_post' | 'grocery_store' | 'mall' | 'bank' | 'office_complex' | 'data_center' | 'techhub' | 'stock_exchange' | 'bitcoin_mine' | 'casino'
  // Infrastructure
  | 'road' | 'dirt_path' | 'water_works' | 'trash_depot' | 'powerplant' | 'nuclear_plant' | 'solar_farm' | 'airport' | 'harbor' | 'hyperloop_station' | 'teleport_pad';

export interface Building {
  id: string;
  type: BuildingType;
  level: number;
  position: { x: number; y: number };
  width: number;
  height: number;
  isIncorporated: boolean;
}

export interface NPC {
  id: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  type: 'citizen' | 'worker' | 'player' | 'rich' | 'official';
  homeId?: string;
  workId?: string;
  state: 'sleeping' | 'working' | 'commuting' | 'leisure' | 'shopping';
  lastSpendingTick: number;
}

export interface Zone {
  id: string;
  name: string;
  cost: number;
  unlocked: boolean;
  color: string;
  gridRange: { xMin: number; xMax: number; yMin: number; yMax: number };
  expansionSize: number; // The grid size this zone unlocks
}

export interface GameState {
  resources: Resources;
  buildings: Building[];
  day: number;
  aiAdvice: string;
  isAnalyzing: boolean;
  marketPrices: Record<string, MarketPrice>;
  reputation: number;
  happiness: number;
  limitedItems: any[];
  lastStockReset: number;
  unlockedZones: string[];
  tier: number;
  camera: { x: number; y: number; zoom: number };
  npcs: NPC[];
  activeQuests: Quest[];
  activeEvent?: GameEvent;
  gridSize: number;
}

export interface BuildingStats {
  category: BuildingCategory;
  cost: Partial<Resources>;
  production: Partial<Resources> & { reputation?: number };
  consumption: Partial<Resources>;
  workerCapacity: number;
  description: string;
  label: string;
  repImpact?: number;
  unlockRequirement?: { type: BuildingType | 'tier'; count: number };
  width: number;
  height: number;
  isRoad?: boolean;
}
