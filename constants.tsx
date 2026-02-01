
import { BuildingType, BuildingStats, Zone } from './types';

export const INITIAL_RESOURCES = {
  money: 50000, 
  food: 500,
  wood: 200,
  stone: 100,
  tools: 50,
  luxury: 0,
  workers: 10,
  energy: 1000,
  water: 1000,
  waste: 0,
  tech: 0
};

export const ZONES: Zone[] = [
  { id: 'tier1', name: 'Start-up Zona', cost: 0, unlocked: true, gridSize: 32 },
  { id: 'tier2', name: 'Zeleni Sektor', cost: 25000, unlocked: false, gridSize: 64 },
];

export const BUILDINGS: Record<BuildingType, BuildingStats> = {
  starter_home: { category: 'residential', label: 'Glavni Štab', description: 'Vaša baza operacija.', cost: { money: 0 }, production: { money: 500 }, consumption: {}, workerCapacity: 2, width: 2, height: 2 },
  suburban_house: { category: 'residential', label: 'Kuća', description: 'Dom za građane.', cost: { money: 1200, wood: 20 }, production: { money: 300 }, consumption: { water: 5, food: 2 }, workerCapacity: 4, width: 2, height: 2 },
  
  road: { category: 'infrastructure', label: 'Gradski Put', description: 'Standardna veza (2x2).', cost: { money: 200 }, production: {}, consumption: {}, workerCapacity: 0, width: 2, height: 2, isRoad: true },
  highway: { category: 'infrastructure', label: 'Autoput', description: 'Brza arterija (4x4).', cost: { money: 1500 }, production: {}, consumption: {}, workerCapacity: 0, width: 4, height: 4, isRoad: true },
  sidewalk: { category: 'infrastructure', label: 'Trotoar', description: 'Za pešake (1x1).', cost: { money: 20 }, production: {}, consumption: {}, workerCapacity: 0, width: 1, height: 1 },
  
  farm: { category: 'production', label: 'Farma', description: 'Hrana za grad.', cost: { money: 800 }, production: { food: 100 }, consumption: { water: 20 }, workerCapacity: 5, width: 3, height: 3 },
  quarry: { category: 'production', label: 'Kamenolom', description: 'Građevinski materijal.', cost: { money: 2500 }, production: { stone: 50 }, consumption: { energy: 30 }, workerCapacity: 10, width: 2, height: 2 },
  
  powerplant: { category: 'infrastructure', label: 'Elektrana', description: 'Osnovna struja.', cost: { money: 5000, stone: 100 }, production: { energy: 1000 }, consumption: { money: 100 }, workerCapacity: 15, width: 4, height: 4 },

  small_shack: { category: 'residential', label: 'Koliba', description: '', cost: { money: 100 }, production: {}, consumption: {}, workerCapacity: 1, width: 1, height: 1 },
  apartment: { category: 'residential', label: 'Zgrada', description: '', cost: { money: 10000 }, production: {}, consumption: {}, workerCapacity: 20, width: 2, height: 2 },
  skyscraper: { category: 'residential', label: 'Neboder', description: '', cost: { money: 100000 }, production: {}, consumption: {}, workerCapacity: 100, width: 3, height: 5 },
  luxury_mansion: { category: 'residential', label: 'Vila', description: '', cost: { money: 25000 }, production: {}, consumption: {}, workerCapacity: 8, width: 3, height: 3 },
  penthouse_tower: { category: 'residential', label: 'Toranj', description: '', cost: { money: 500000 }, production: {}, consumption: {}, workerCapacity: 200, width: 4, height: 6 },
  modern_villa: { category: 'residential', label: 'Moderna Vila', description: '', cost: { money: 5000 }, production: {}, consumption: {}, workerCapacity: 6, width: 2, height: 2 },
  iron_mine: { category: 'production', label: 'Rudnik', description: '', cost: { money: 5000 }, production: {}, consumption: {}, workerCapacity: 20, width: 2, height: 2 },
  workshop: { category: 'production', label: 'Radionica', description: '', cost: { money: 1500 }, production: {}, consumption: {}, workerCapacity: 5, width: 2, height: 2 },
  factory: { category: 'production', label: 'Fabrika', description: '', cost: { money: 20000 }, production: {}, consumption: {}, workerCapacity: 50, width: 4, height: 4 },
  robotics_lab: { category: 'production', label: 'Robotika', description: '', cost: { money: 100000 }, production: {}, consumption: {}, workerCapacity: 10, width: 3, height: 3 },
  nano_forge: { category: 'production', label: 'Nano Forge', description: '', cost: { money: 500000 }, production: {}, consumption: {}, workerCapacity: 5, width: 3, height: 3 },
  school: { category: 'public', label: 'Škola', description: '', cost: { money: 3000 }, production: {}, consumption: {}, workerCapacity: 10, width: 3, height: 2 },
  university: { category: 'public', label: 'Univerzitet', description: '', cost: { money: 25000 }, production: {}, consumption: {}, workerCapacity: 50, width: 4, height: 4 },
  hospital: { category: 'public', label: 'Bolnica', description: '', cost: { money: 15000 }, production: {}, consumption: {}, workerCapacity: 30, width: 3, height: 3 },
  park: { category: 'public', label: 'Park', description: '', cost: { money: 500 }, production: {}, consumption: {}, workerCapacity: 0, width: 2, height: 2 },
  stadium: { category: 'public', label: 'Stadion', description: '', cost: { money: 100000 }, production: {}, consumption: {}, workerCapacity: 100, width: 6, height: 6 },
  police_station: { category: 'public', label: 'Policija', description: '', cost: { money: 5000 }, production: {}, consumption: {}, workerCapacity: 15, width: 2, height: 2 },
  fire_station: { category: 'public', label: 'Vatrogasci', description: '', cost: { money: 5000 }, production: {}, consumption: {}, workerCapacity: 15, width: 2, height: 2 },
  town_hall: { category: 'public', label: 'Opština', description: '', cost: { money: 50000 }, production: {}, consumption: {}, workerCapacity: 50, width: 4, height: 4 },
  cathedral: { category: 'public', label: 'Katedrala', description: '', cost: { money: 80000 }, production: {}, consumption: {}, workerCapacity: 5, width: 4, height: 5 },
  museum: { category: 'public', label: 'Muzej', description: '', cost: { money: 20000 }, production: {}, consumption: {}, workerCapacity: 10, width: 3, height: 3 },
  trade_post: { category: 'commercial', label: 'Pijaca', description: '', cost: { money: 2000 }, production: {}, consumption: {}, workerCapacity: 5, width: 2, height: 2 },
  grocery_store: { category: 'commercial', label: 'Market', description: '', cost: { money: 5000 }, production: {}, consumption: {}, workerCapacity: 8, width: 2, height: 2 },
  mall: { category: 'commercial', label: 'TC', description: '', cost: { money: 50000 }, production: {}, consumption: {}, workerCapacity: 100, width: 5, height: 4 },
  bank: { category: 'commercial', label: 'Banka', description: '', cost: { money: 100000 }, production: {}, consumption: {}, workerCapacity: 20, width: 3, height: 3 },
  casino: { category: 'commercial', label: 'Kasino', description: '', cost: { money: 250000 }, production: {}, consumption: {}, workerCapacity: 50, width: 4, height: 4 },
  stock_exchange: { category: 'commercial', label: 'Berza', description: '', cost: { money: 1000000 }, production: {}, consumption: {}, workerCapacity: 30, width: 5, height: 5 },
  traffic_light: { category: 'infrastructure', label: 'Semafor', description: '', cost: { money: 500 }, production: {}, consumption: {}, workerCapacity: 0, width: 1, height: 1 },
  airport: { category: 'infrastructure', label: 'Aerodrom', description: '', cost: { money: 1500000 }, production: {}, consumption: {}, workerCapacity: 500, width: 8, height: 10 },
  harbor: { category: 'infrastructure', label: 'Luka', description: '', cost: { money: 500000 }, production: {}, consumption: {}, workerCapacity: 200, width: 6, height: 6 },
  nuclear_plant: { category: 'infrastructure', label: 'Nuklearka', description: '', cost: { money: 800000 }, production: {}, consumption: {}, workerCapacity: 100, width: 5, height: 5 },
  water_works: { category: 'infrastructure', label: 'Vodovod', description: '', cost: { money: 10000 }, production: {}, consumption: {}, workerCapacity: 20, width: 3, height: 3 },
  tree: { category: 'nature', label: 'Drvo', description: '', cost: { money: 10 }, production: {}, consumption: {}, workerCapacity: 0, width: 1, height: 1 },
  river: { category: 'nature', label: 'Reka', description: '', cost: { money: 0 }, production: {}, consumption: {}, workerCapacity: 0, width: 2, height: 2 },
  rock: { category: 'nature', label: 'Stena', description: '', cost: { money: 0 }, production: {}, consumption: {}, workerCapacity: 0, width: 1, height: 1 },
  forest: { category: 'nature', label: 'Šuma', description: '', cost: { money: 500 }, production: {}, consumption: {}, workerCapacity: 0, width: 4, height: 4 },
};
