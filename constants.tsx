
import { BuildingType, BuildingStats, Zone } from './types';

export const INITIAL_RESOURCES = {
  money: 1000, 
  food: 100,
  wood: 0,
  stone: 0,
  tools: 0,
  luxury: 0,
  workers: 1,
  energy: 0,
  water: 50,
  waste: 0,
  tech: 0
};

export const INITIAL_LIMITED_ITEMS: any[] = [];

export const ZONES: Zone[] = [
  { id: 'z1', name: 'Zaliv Početka', cost: 0, unlocked: true, color: 'rgba(34, 197, 94, 0.05)', gridRange: { xMin: 0, xMax: 31, yMin: 0, yMax: 31 }, expansionSize: 32 },
  { id: 'z2', name: 'Zeleni Arhipelag', cost: 15000, unlocked: false, color: 'rgba(59, 130, 246, 0.05)', gridRange: { xMin: 32, xMax: 63, yMin: 0, yMax: 63 }, expansionSize: 64 },
  { id: 'z3', name: 'Planinski Vrhovi', cost: 80000, unlocked: false, color: 'rgba(168, 85, 247, 0.05)', gridRange: { xMin: 0, xMax: 127, yMin: 64, yMax: 127 }, expansionSize: 128 },
  { id: 'z4', name: 'Sajber Distrikt', cost: 500000, unlocked: false, color: 'rgba(234, 179, 8, 0.05)', gridRange: { xMin: 128, xMax: 199, yMin: 0, yMax: 199 }, expansionSize: 200 },
];

export const BUILDINGS: Record<BuildingType, BuildingStats> = {
  // --- RESIDENTIAL (Kompaktno 1x1 ili 2x2) ---
  starter_home: { category: 'residential', label: 'Tvoj Štab', description: 'Glavna baza.', cost: { money: 0 }, production: { money: 10 }, consumption: {}, workerCapacity: 0, repImpact: 10, width: 1, height: 1 },
  small_shack: { category: 'residential', label: 'Koliba', description: 'Bazično.', cost: { money: 150 }, production: { money: 15 }, consumption: { water: 1 }, workerCapacity: 1, repImpact: 2, width: 1, height: 1, unlockRequirement: { type: 'starter_home', count: 1 } },
  eco_pod: { category: 'residential', label: 'Eco Pod', description: 'Održivo.', cost: { money: 600, wood: 20 }, production: { money: 50 }, consumption: { water: 1 }, workerCapacity: 2, repImpact: 15, width: 1, height: 1 },
  suburban_house: { category: 'residential', label: 'Kuća', description: 'Komfor.', cost: { money: 2500, wood: 100 }, production: { money: 250 }, consumption: { food: 5, water: 5, waste: 2 }, workerCapacity: 4, repImpact: 10, width: 1, height: 1, unlockRequirement: { type: 'small_shack', count: 5 } },
  modern_villa: { category: 'residential', label: 'Vila', description: 'Elitno.', cost: { money: 12000, wood: 500, stone: 200 }, production: { money: 1200 }, consumption: { food: 10, energy: 20 }, workerCapacity: 8, repImpact: 50, width: 2, height: 1 },
  capsule_hotel: { category: 'residential', label: 'Kapsule', description: 'Efikasno.', cost: { money: 15000, tech: 50 }, production: { workers: 50 }, consumption: { energy: 100 }, workerCapacity: 0, repImpact: 20, width: 1, height: 2 },
  apartment: { category: 'residential', label: 'Apartmani', description: 'Masa.', cost: { money: 40000, stone: 1500 }, production: { workers: 300 }, consumption: { food: 150, energy: 100 }, workerCapacity: 0, repImpact: 100, width: 2, height: 2, unlockRequirement: { type: 'suburban_house', count: 10 } },
  luxury_mansion: { category: 'residential', label: 'Palata', description: 'Kraljevski.', cost: { money: 100000, luxury: 200 }, production: { money: 8000 }, consumption: { luxury: 10 }, workerCapacity: 20, repImpact: 250, width: 2, height: 2 },
  skyscraper: { category: 'residential', label: 'Neboder', description: 'Gigant.', cost: { money: 500000, luxury: 5000 }, production: { money: 80000, workers: 2000 }, consumption: { energy: 2000 }, workerCapacity: 1000, repImpact: 1500, width: 2, height: 4 },
  penthouse_tower: { category: 'residential', label: 'Apex', description: 'Krajnji cilj.', cost: { money: 5000000, tech: 5000, luxury: 20000 }, production: { money: 1000000, luxury: 1000 }, consumption: { energy: 10000 }, workerCapacity: 0, repImpact: 10000, width: 3, height: 5 },

  // --- PRODUCTION ---
  scavenger_hut: { category: 'production', label: 'Sakupljač', description: 'Resursi.', cost: { money: 80 }, production: { food: 15, wood: 15 }, consumption: {}, workerCapacity: 0, repImpact: 1, width: 1, height: 1 },
  farm: { category: 'production', label: 'Farma', description: 'Hrana.', cost: { money: 1500, wood: 150 }, production: { food: 250 }, consumption: { water: 50 }, workerCapacity: 15, repImpact: 5, width: 2, height: 2 },
  orchard: { category: 'production', label: 'Voćnjak', description: 'Voće.', cost: { money: 4000, wood: 500 }, production: { food: 150, luxury: 30 }, consumption: { water: 80 }, workerCapacity: 10, repImpact: 30, width: 3, height: 2 },
  quarry: { category: 'production', label: 'Kamenolom', description: 'Kamen.', cost: { money: 8000, tools: 50 }, production: { stone: 150 }, consumption: { energy: 50 }, workerCapacity: 25, repImpact: -20, width: 2, height: 2 },
  iron_mine: { category: 'production', label: 'Rudnik', description: 'Metal.', cost: { money: 20000, tools: 150 }, production: { tools: 40 }, consumption: { energy: 200 }, workerCapacity: 60, repImpact: -50, width: 2, height: 3 },
  workshop: { category: 'production', label: 'Zanatlija', description: 'Izrada.', cost: { money: 3500, wood: 300 }, production: { tools: 20 }, consumption: { wood: 50 }, workerCapacity: 12, repImpact: 15, width: 2, height: 1 },
  factory: { category: 'production', label: 'Fabrika', description: 'Giga.', cost: { money: 150000, energy: 500 }, production: { money: 25000, luxury: 200 }, consumption: { waste: 500 }, workerCapacity: 300, repImpact: -300, width: 4, height: 2 },
  chemical_plant: { category: 'production', label: 'Hemija', description: 'Sinteza.', cost: { money: 400000, tech: 300 }, production: { money: 80000 }, consumption: { water: 800 }, workerCapacity: 200, repImpact: -600, width: 4, height: 4 },
  biotech_greenhouse: { category: 'production', label: 'Biotech', description: 'GMO.', cost: { money: 600000, tech: 800 }, production: { food: 3000, luxury: 400 }, consumption: { water: 2500 }, workerCapacity: 100, repImpact: 400, width: 3, height: 3 },
  robotics_lab: { category: 'production', label: 'Robotika', description: 'AI.', cost: { money: 2000000, tech: 2000 }, production: { tech: 150, money: 300000 }, consumption: { energy: 3000 }, workerCapacity: 500, repImpact: 1000, width: 4, height: 4 },
  nano_forge: { category: 'production', label: 'Nano Forge', description: 'Atomi.', cost: { money: 15000000, tech: 10000 }, production: { money: 4000000, tech: 500 }, consumption: { energy: 15000 }, workerCapacity: 200, repImpact: 3000, width: 5, height: 5 },

  // --- COMMERCIAL ---
  trade_post: { category: 'commercial', label: 'Pijaca', description: 'Bazar.', cost: { money: 500, wood: 80 }, production: { money: 150 }, consumption: { food: 10 }, workerCapacity: 5, repImpact: 15, width: 1, height: 1 },
  grocery_store: { category: 'commercial', label: 'Market', description: 'Snabdevanje.', cost: { money: 8000, wood: 500 }, production: { money: 3000 }, consumption: { food: 60 }, workerCapacity: 25, repImpact: 30, width: 2, height: 1 },
  mall: { category: 'commercial', label: 'Mall', description: 'Centar.', cost: { money: 60000, stone: 2000, luxury: 300 }, production: { money: 15000 }, consumption: { waste: 200 }, workerCapacity: 150, repImpact: 80, width: 4, height: 2 },
  casino: { category: 'commercial', label: 'Casino', description: 'Grand.', cost: { money: 400000, luxury: 1000 }, production: { money: 150000 }, consumption: { waste: 150 }, workerCapacity: 100, repImpact: -500, width: 3, height: 3 },
  bank: { category: 'commercial', label: 'Banka', description: 'Kapital.', cost: { money: 500000, luxury: 1000 }, production: { money: 100000 }, consumption: { energy: 500 }, workerCapacity: 100, repImpact: 1000, width: 2, height: 2 },
  office_complex: { category: 'commercial', label: 'Office', description: 'Korporacije.', cost: { money: 800000, stone: 8000 }, production: { money: 250000 }, consumption: { energy: 1500 }, workerCapacity: 800, repImpact: 700, width: 2, height: 4 },
  data_center: { category: 'commercial', label: 'Data Hub', description: 'Servers.', cost: { money: 1200000, tech: 1000 }, production: { tech: 100, money: 150000 }, consumption: { energy: 8000 }, workerCapacity: 100, repImpact: 500, width: 4, height: 2 },
  bitcoin_mine: { category: 'commercial', label: 'Crypto', description: 'Mining.', cost: { money: 1000000, tech: 1500, energy: 5000 }, production: { money: 400000 }, consumption: { energy: 15000 }, workerCapacity: 30, repImpact: -250, width: 2, height: 1 },
  techhub: { category: 'commercial', label: 'Tech Hub', description: 'Cyber.', cost: { money: 3000000, energy: 10000 }, production: { money: 1000000, tech: 500 }, consumption: { workers: 2000 }, workerCapacity: 5000, repImpact: 5000, width: 4, height: 4 },
  stock_exchange: { category: 'commercial', label: 'Berza', description: 'Wall St.', cost: { money: 20000000, tech: 15000 }, production: { money: 6000000 }, consumption: { tech: 2000 }, workerCapacity: 1500, repImpact: 30000, width: 5, height: 5 },

  // --- PUBLIC ---
  school: { category: 'public', label: 'Škola', description: 'Obrazovanje.', cost: { money: 10000, wood: 500, stone: 200 }, production: { luxury: 10 }, consumption: { money: 1000 }, workerCapacity: 40, repImpact: 150, width: 2, height: 2 },
  hospital: { category: 'public', label: 'Bolnica', description: 'Care.', cost: { money: 250000, luxury: 1000 }, production: {}, consumption: { water: 500 }, workerCapacity: 300, repImpact: 1000, width: 3, height: 3 },
  park: { category: 'public', label: 'Park', description: 'Rest.', cost: { money: 15000, wood: 800 }, production: { luxury: 40 }, consumption: { money: 500 }, workerCapacity: 0, repImpact: 300, width: 3, height: 3 },
  fire_station: { category: 'public', label: 'Fire', description: 'Safety.', cost: { money: 25000, tools: 200 }, production: {}, consumption: { water: 300 }, workerCapacity: 50, repImpact: 400, width: 2, height: 1 },
  police_station: { category: 'public', label: 'Police', description: 'Law.', cost: { money: 30000, tools: 250 }, production: {}, consumption: { money: 1000 }, workerCapacity: 60, repImpact: 500, width: 2, height: 1 },
  university: { category: 'public', label: 'Uni', description: 'Sci.', cost: { money: 300000, stone: 5000 }, production: { tech: 100, luxury: 150 }, consumption: { energy: 1000 }, workerCapacity: 250, repImpact: 1500, width: 4, height: 4 },
  stadium: { category: 'public', label: 'Arena', description: 'Sports.', cost: { money: 1500000, stone: 20000 }, production: { money: 250000, luxury: 1000 }, consumption: { energy: 3000 }, workerCapacity: 1000, repImpact: 5000, width: 6, height: 4 },
  library: { category: 'public', label: 'Lib', description: 'Books.', cost: { money: 40000, wood: 1500 }, production: { tech: 20 }, consumption: { money: 800 }, workerCapacity: 30, repImpact: 400, width: 2, height: 2 },
  museum: { category: 'public', label: 'Muzej', description: 'Art.', cost: { money: 150000, luxury: 500 }, production: { reputation: 100 }, consumption: { money: 2000 }, workerCapacity: 80, repImpact: 2000, width: 3, height: 3 },
  cathedral: { category: 'public', label: 'Hram', description: 'Faith.', cost: { money: 500000, stone: 10000 }, production: { reputation: 200 }, consumption: { money: 3000 }, workerCapacity: 200, repImpact: 5000, width: 4, height: 4 },
  cinema: { category: 'public', label: 'Cinema', description: 'Movies.', cost: { money: 60000, luxury: 500 }, production: { money: 8000 }, consumption: { energy: 200 }, workerCapacity: 50, repImpact: 300, width: 2, height: 2 },
  clinic: { category: 'public', label: 'Clinic', description: 'Meds.', cost: { money: 35000, stone: 500 }, production: {}, consumption: { water: 50 }, workerCapacity: 30, repImpact: 200, width: 2, height: 1 },
  military_base: { category: 'public', label: 'Base', description: 'Defense.', cost: { money: 5000000, tech: 8000 }, production: { reputation: 1000 }, consumption: { money: 250000 }, workerCapacity: 5000, repImpact: 15000, width: 6, height: 6 },

  // --- INFRASTRUCTURE ---
  road: { category: 'infrastructure', label: 'Asfalt', description: 'Premium.', cost: { money: 10 }, production: {}, consumption: {}, workerCapacity: 0, repImpact: 5, isRoad: true, width: 1, height: 1 },
  dirt_path: { category: 'infrastructure', label: 'Staza', description: 'Spora.', cost: { money: 5 }, production: {}, consumption: {}, workerCapacity: 0, repImpact: 1, isRoad: true, width: 1, height: 1 },
  water_works: { category: 'infrastructure', label: 'Voda', description: 'Hidro.', cost: { money: 5000, tools: 100 }, production: { water: 1000 }, consumption: { energy: 100 }, workerCapacity: 30, repImpact: 100, width: 2, height: 2 },
  trash_depot: { category: 'infrastructure', label: 'Depo', description: 'Waste.', cost: { money: 8000, stone: 800 }, production: { reputation: 30 }, consumption: { waste: 500 }, workerCapacity: 50, repImpact: 300, width: 2, height: 2 },
  powerplant: { category: 'infrastructure', label: 'Energija', description: 'Ugalj.', cost: { money: 100000, tools: 800 }, production: { energy: 5000 }, consumption: { money: 5000 }, workerCapacity: 150, repImpact: -400, width: 3, height: 2 },
  solar_farm: { category: 'infrastructure', label: 'Solar', description: 'Eco.', cost: { money: 350000, tech: 800 }, production: { energy: 10000 }, consumption: { money: 1500 }, workerCapacity: 20, repImpact: 1000, width: 4, height: 4 },
  nuclear_plant: { category: 'infrastructure', label: 'Nuklearka', description: 'Mega.', cost: { money: 10000000, tech: 8000 }, production: { energy: 100000 }, consumption: { money: 50000, water: 20000 }, workerCapacity: 500, repImpact: -3000, width: 6, height: 6 },
  teleport_pad: { category: 'infrastructure', label: 'Teleport', description: 'Instant.', cost: { money: 30000000, tech: 30000 }, production: { money: 2000000 }, consumption: { energy: 40000 }, workerCapacity: 0, repImpact: 15000, width: 2, height: 2 },
  hyperloop_station: { category: 'infrastructure', label: 'Hyperloop', description: 'Fast.', cost: { money: 4000000, stone: 50000 }, production: { money: 800000, reputation: 2000 }, consumption: { energy: 8000 }, workerCapacity: 200, repImpact: 3000, width: 8, height: 2 },
  airport: { category: 'infrastructure', label: 'Airport', description: 'Global.', cost: { money: 5000000, stone: 80000 }, production: { money: 1500000, luxury: 2000 }, consumption: { energy: 12000 }, workerCapacity: 2000, repImpact: 10000, width: 10, height: 6 },
  harbor: { category: 'infrastructure', label: 'Luka', description: 'Ships.', cost: { money: 3500000, tools: 10000 }, production: { money: 1200000 }, consumption: { energy: 6000 }, workerCapacity: 1500, repImpact: 8000, width: 8, height: 4 },
};

export const GRID_SIZE = 32; 
export const DAY_DURATION = 30000; 
