
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

export type BuildingCategory = 'residential' | 'production' | 'public' | 'commercial' | 'infrastructure' | 'nature';

export type BuildingType = 
  | 'starter_home' | 'small_shack' | 'suburban_house' | 'modern_villa' | 'luxury_mansion' | 'apartment' | 'skyscraper' | 'penthouse_tower'
  | 'farm' | 'quarry' | 'iron_mine' | 'workshop' | 'factory' | 'robotics_lab' | 'nano_forge'
  | 'school' | 'university' | 'hospital' | 'park' | 'stadium' | 'police_station' | 'fire_station' | 'town_hall' | 'cathedral' | 'museum'
  | 'trade_post' | 'grocery_store' | 'mall' | 'bank' | 'casino' | 'stock_exchange'
  | 'road' | 'highway' | 'sidewalk' | 'traffic_light' | 'airport' | 'harbor' | 'powerplant' | 'nuclear_plant' | 'water_works'
  | 'tree' | 'river' | 'rock' | 'forest';

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
  type: 'citizen' | 'worker' | 'player' | 'official';
  homeId?: string;
  workId?: string;
  state: 'sleeping' | 'working' | 'commuting' | 'leisure' | 'shopping' | 'homeless';
  isDriving: boolean;
  lastSpendingTick: number;
}

export interface Zone {
  id: string;
  name: string;
  cost: number;
  unlocked: boolean;
  gridSize: number; // The grid size this zone unlocks
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
  // Fix: explicitly allow reputation in production and consumption as it's not a standard resource.
  production: Partial<Resources> & { reputation?: number };
  consumption: Partial<Resources> & { reputation?: number };
  workerCapacity: number;
  description: string;
  label: string;
  repImpact?: number;
  width: number;
  height: number;
  isRoad?: boolean;
}
