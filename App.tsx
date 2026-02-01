
import React, { useState, useEffect, useRef } from 'react';
import { 
  Building, 
  BuildingType, 
  GameState, 
  Resources, 
  ResourceType, 
  MarketPrice,
  NPC,
  Zone,
  BuildingCategory
} from './types';
import { INITIAL_RESOURCES, BUILDINGS, ZONES } from './constants';
import { 
  Plus,
  Minus,
  Sun,
  Moon,
  TrendingUp,
  Menu,
  Car,
  Target,
  Coins,
  Waves,
  Undo2,
  RotateCcw,
  Zap,
  Users,
  ArrowUpCircle,
  TrendingDown,
  Home,
  Factory,
  Trees,
  CloudLightning,
  ShoppingCart,
  University,
  ShieldCheck,
  Stethoscope,
  Building as BuildingIcon,
  Warehouse,
  Cpu,
  HardDrive,
  Component,
  Castle,
  Store,
  Hotel,
  Wind,
  Flame,
  Globe
} from 'lucide-react';
import { getAIAdvice } from './services/gemini';

const CELL_SIZE = 48; 
const TICK_RATE_MS = 1000; 

const App: React.FC = () => {
  const getInitialGameState = (): GameState => ({
    resources: { ...INITIAL_RESOURCES },
    buildings: [{
      id: 'starter-home',
      type: 'starter_home',
      level: 1,
      position: { x: 15, y: 15 },
      width: 2,
      height: 2,
      isIncorporated: true
    }],
    day: 1,
    aiAdvice: "Direktore, grad je spreman za ekspanziju. Gradite kuće da privučete ljude.",
    isAnalyzing: false,
    marketPrices: {
      food: { current: 15, trend: 'stable' },
      wood: { current: 20, trend: 'stable' },
      stone: { current: 45, trend: 'stable' },
      tools: { current: 250, trend: 'stable' },
      luxury: { current: 1200, trend: 'stable' },
      tech: { current: 3000, trend: 'stable' },
    },
    reputation: 50,
    happiness: 80,
    limitedItems: [],
    lastStockReset: Date.now(),
    unlockedZones: ['tier1'],
    tier: 1,
    camera: { x: window.innerWidth / 2, y: window.innerHeight / 2, zoom: 1.0 },
    npcs: [],
    activeQuests: [{ title: 'Prvih 10 domova', isCompleted: false }],
    gridSize: 32
  });

  const [gameState, setGameState] = useState<GameState>(getInitialGameState());
  const [history, setHistory] = useState<Building[][]>([]);
  const [isNight, setIsNight] = useState(false);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'build' | 'market' | 'map'>('build');
  const [shopCategory, setShopCategory] = useState<BuildingCategory>('residential');
  const [selectedBlueprint, setSelectedBlueprint] = useState<BuildingType | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [floatingTexts, setFloatingTexts] = useState<{id: number, x: number, y: number, text: string}[]>([]);
  
  const dragStart = useRef({ x: 0, y: 0 });
  const dragDistance = useRef(0);

  const pushToHistory = () => {
    setHistory(prev => [gameState.buildings, ...prev].slice(0, 20));
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsNight(prev => {
        if (prev) setGameState(g => ({ ...g, day: g.day + 1 }));
        return !prev;
      });
    }, isNight ? 600000 : 1200000);
    return () => clearTimeout(timer);
  }, [isNight]);

  useEffect(() => {
    const fetchAdvice = async () => {
      setGameState(prev => ({ ...prev, isAnalyzing: true }));
      try {
        const advice = await getAIAdvice(gameState);
        setGameState(prev => ({ ...prev, aiAdvice: advice, isAnalyzing: false }));
      } catch (e) {
        setGameState(prev => ({ ...prev, isAnalyzing: false }));
      }
    };
    const adviceInterval = setInterval(fetchAdvice, 45000);
    fetchAdvice();
    return () => clearInterval(adviceInterval);
  }, []);

  useEffect(() => {
    const tick = setInterval(() => {
      setGameState(prev => {
        const nr: Resources = { ...prev.resources };
        const tickMult = TICK_RATE_MS / 30000;

        prev.buildings.forEach(b => {
          const stats = BUILDINGS[b.type];
          const levelMult = 1 + (b.level - 1) * 0.5;
          Object.entries(stats.production).forEach(([res, amt]) => {
             if (res in nr) (nr as any)[res] += Number(amt) * tickMult * levelMult;
          });
          Object.entries(stats.consumption).forEach(([res, amt]) => {
             if (res in nr) (nr as any)[res] = Math.max(0, (nr as any)[res] - Number(amt) * tickMult);
          });
        });

        const nmp = { ...prev.marketPrices };
        Object.keys(nmp).forEach(k => {
          const p = nmp[k] as MarketPrice;
          const change = (Math.random() - 0.5) * (p.current * 0.05);
          p.current = Math.max(5, p.current + change);
          p.trend = change > 0 ? 'up' : 'down';
        });

        return { ...prev, resources: nr, marketPrices: nmp, npcs: updateNPCLogic(prev) };
      });
    }, TICK_RATE_MS);
    return () => clearInterval(tick);
  }, []);

  const updateNPCLogic = (prev: GameState) => {
    const houses = prev.buildings.filter(b => BUILDINGS[b.type].category === 'residential');
    if (houses.length < 5) return [];

    let nextNpcs = [...prev.npcs];
    if (nextNpcs.length < Math.min(houses.length * 2, 50)) {
      const h = houses[Math.floor(Math.random() * houses.length)];
      nextNpcs.push({
        id: Math.random().toString(),
        x: h.position.x + h.width/2, y: h.position.y + h.height/2,
        targetX: Math.random() * prev.gridSize, targetY: Math.random() * prev.gridSize,
        type: 'citizen', state: 'leisure', isDriving: false, lastSpendingTick: 0
      });
    }

    return nextNpcs.map(npc => {
      const roadUnder = prev.buildings.find(b => 
        BUILDINGS[b.type].isRoad && 
        npc.x >= b.position.x && npc.x <= b.position.x + b.width &&
        npc.y >= b.position.y && npc.y <= b.position.y + b.height
      );

      const isDriving = !!roadUnder;
      const spd = isDriving ? 0.3 : 0.08;
      
      let dx = npc.targetX - npc.x;
      let dy = npc.targetY - npc.y;

      if (isDriving) {
        if (Math.abs(dx) > Math.abs(dy)) dy = 0; else dx = 0;
      }

      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 0.2) {
        return { ...npc, targetX: Math.random() * prev.gridSize, targetY: Math.random() * prev.gridSize };
      }

      return { ...npc, x: npc.x + (dx/dist)*spd, y: npc.y + (dy/dist)*spd, isDriving };
    });
  };

  const sellResource = (res: ResourceType, amt: number) => {
    const price = gameState.marketPrices[res]?.current || 0;
    const currentAmt = (gameState.resources as any)[res] || 0;
    
    if (currentAmt >= amt) {
      setGameState(prev => {
        const nr = { ...prev.resources };
        (nr as any)[res] -= amt;
        nr.money += amt * price;
        return { ...prev, resources: nr };
      });
    }
  };

  const handleBuild = (type: BuildingType, x: number, y: number) => {
    const stats = BUILDINGS[type];
    const isBlocked = gameState.buildings.some(b => 
      x < b.position.x + b.width && x + stats.width > b.position.x && 
      y < b.position.y + b.height && y + stats.height > b.position.y
    );
    if (isBlocked) return;

    const affordable = Object.entries(stats.cost).every(([res, amt]) => (gameState.resources as any)[res] >= (amt || 0));
    if (!affordable) return;

    pushToHistory();
    setGameState(prev => {
      const nr = { ...prev.resources };
      Object.entries(stats.cost).forEach(([res, amt]) => (nr as any)[res] -= (amt || 0));
      return {
        ...prev,
        resources: nr,
        buildings: [...prev.buildings, { id: Math.random().toString(), type, level: 1, position: { x, y }, width: stats.width, height: stats.height, isIncorporated: false }]
      };
    });
  };

  const handleUpgrade = (id: string) => {
    const b = gameState.buildings.find(x => x.id === id);
    if (!b) return;
    const stats = BUILDINGS[b.type];
    const cost = Math.floor(stats.cost.money! * b.level * 2);
    
    if (gameState.resources.money >= cost) {
      pushToHistory();
      setGameState(p => ({
        ...p,
        resources: { ...p.resources, money: p.resources.money - cost },
        buildings: p.buildings.map(x => x.id === id ? { ...x, level: x.level + 1 } : x)
      }));
    }
  };

  const handleBuildingClick = (e: React.MouseEvent, b: Building) => {
    if (dragDistance.current > 10) return;
    e.stopPropagation();
    
    const stats = BUILDINGS[b.type];
    setSelectedBuildingId(b.id);

    if (stats.category === 'residential') {
      const gain = b.level * 50;
      setGameState(prev => ({
        ...prev,
        resources: { ...prev.resources, money: prev.resources.money + gain }
      }));
      
      const tid = Date.now();
      setFloatingTexts(prev => [...prev, { id: tid, x: e.clientX, y: e.clientY, text: `+$${gain}` }]);
      setTimeout(() => setFloatingTexts(f => f.filter(t => t.id !== tid)), 1000);
    }
  };

  const getRoadConnections = (b: Building) => {
    const isHighway = b.type === 'highway';
    const step = isHighway ? 4 : 2;
    const neighbors = {
      t: gameState.buildings.some(n => n.id !== b.id && BUILDINGS[n.type].isRoad && n.position.x === b.position.x && n.position.y === b.position.y - step),
      b: gameState.buildings.some(n => n.id !== b.id && BUILDINGS[n.type].isRoad && n.position.x === b.position.x && n.position.y === b.position.y + step),
      l: gameState.buildings.some(n => n.id !== b.id && BUILDINGS[n.type].isRoad && n.position.x === b.position.x - step && n.position.y === b.position.y),
      r: gameState.buildings.some(n => n.id !== b.id && BUILDINGS[n.type].isRoad && n.position.x === b.position.x + step && n.position.y === b.position.y),
    };
    return neighbors;
  };

  const getBuildingVisual = (type: BuildingType, level: number = 1) => {
    const iconSize = 28;
    const cat = BUILDINGS[type].category;

    // Visual progression based on level
    if (cat === 'residential') {
      if (level >= 5) return <BuildingIcon size={iconSize} className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />;
      if (level >= 3) return <Warehouse size={iconSize} className="text-blue-300" />;
      return <Home size={iconSize} className="text-blue-400" />;
    }

    if (cat === 'production') {
      if (level >= 5) return <Cpu size={iconSize} className="text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />;
      if (level >= 3) return <HardDrive size={iconSize} className="text-amber-500" />;
      return <Factory size={iconSize} className="text-amber-600" />;
    }

    if (cat === 'infrastructure') {
      if (type === 'powerplant' || type === 'nuclear_plant') {
        if (level >= 5) return <Globe size={iconSize} className="text-yellow-200 drop-shadow-[0_0_10px_rgba(254,240,138,0.7)]" />;
        return <CloudLightning size={iconSize} className="text-yellow-400" />;
      }
      if (level >= 3) return <Wind size={iconSize} className="text-slate-300" />;
      return <Zap size={iconSize} className="text-slate-400" />;
    }

    if (cat === 'commercial') {
      if (level >= 5) return <Hotel size={iconSize} className="text-emerald-200 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />;
      if (level >= 3) return <Store size={iconSize} className="text-emerald-400" />;
      return <ShoppingCart size={iconSize} className="text-emerald-600" />;
    }

    if (cat === 'public') {
      if (level >= 5) return <Castle size={iconSize} className="text-indigo-200 drop-shadow-[0_0_8px_rgba(99,102,241,0.6)]" />;
      if (type === 'school' || type === 'university') return <University size={iconSize} className="text-indigo-400" />;
      if (type === 'police_station') return <ShieldCheck size={iconSize} className="text-blue-600" />;
      if (type === 'hospital') return <Stethoscope size={iconSize} className="text-red-400" />;
      return <Target size={iconSize} className="text-indigo-400" />;
    }

    if (cat === 'nature') {
      if (level >= 3) return <Trees size={iconSize} className="text-green-400" />;
      return <Trees size={iconSize} className="text-green-600" opacity={0.6} />;
    }

    return <span>🏛️</span>;
  };

  const getBuildingEmoji = (type: BuildingType) => {
    switch(type) {
      case 'starter_home': return '🏢';
      case 'suburban_house': return '🏡';
      case 'skyscraper': return '🌆';
      case 'farm': return '🚜';
      case 'quarry': return '⛏️';
      case 'park': return '🌳';
      case 'forest': return '🌲';
      case 'sidewalk': return '⬜';
      default: return '';
    }
  };

  return (
    <div className={`flex h-screen w-full ${isNight ? 'bg-[#03060a]' : 'bg-[#081226]'} transition-colors duration-[5000ms] text-slate-100 overflow-hidden relative`}>
      
      {/* SIDEBAR */}
      <div className={`${isSidebarOpen ? 'w-[380px]' : 'w-0'} h-full bg-[#07101f] border-r border-indigo-500/30 flex flex-col z-50 transition-all shadow-2xl overflow-hidden`}>
        <div className="p-6 border-b border-indigo-500/30 flex justify-between items-center">
          <h1 className="font-black text-xl italic text-indigo-100 uppercase tracking-tighter">Sim <span className="text-indigo-400">Ultra</span></h1>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden"><Menu/></button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          <div className="flex bg-black/40 p-1 rounded-2xl border border-white/5">
            {['build', 'market', 'map'].map(t => (
              <button key={t} onClick={() => setActiveTab(t as any)} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === t ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>{t}</button>
            ))}
          </div>

          {activeTab === 'build' && (
            <div className="space-y-4">
              <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
                {['residential', 'production', 'commercial', 'public', 'infrastructure', 'nature'].map(cat => (
                  <button key={cat} onClick={() => setShopCategory(cat as any)} className={`px-4 py-2 rounded-xl border text-[9px] font-black uppercase whitespace-nowrap transition-all ${shopCategory === cat ? 'bg-indigo-700 border-indigo-400 text-white' : 'bg-indigo-950/30 border-indigo-500/20 text-slate-500 hover:border-indigo-400/50'}`}>{cat}</button>
                ))}
              </div>
              <div className="grid grid-cols-1 gap-2">
                {Object.entries(BUILDINGS).filter(([_, s]) => s.category === shopCategory).map(([type, stats]) => {
                  const affordable = Object.entries(stats.cost).every(([res, amt]) => (gameState.resources as any)[res] >= (amt || 0));
                  return (
                    <button key={type} onClick={() => setSelectedBlueprint(type as BuildingType)} className={`p-4 rounded-3xl border text-left transition-all flex gap-4 items-center ${selectedBlueprint === type ? 'border-indigo-400 bg-indigo-600/20 shadow-[inset_0_0_20px_rgba(79,70,229,0.1)]' : affordable ? 'bg-indigo-950/20 border-white/5 hover:bg-indigo-900/30' : 'opacity-40 grayscale cursor-not-allowed border-white/5 bg-black/20'}`}>
                      <div className="w-12 h-12 rounded-xl bg-black/30 flex items-center justify-center shrink-0">
                         {getBuildingVisual(type as BuildingType, 1)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-0.5">
                          <h4 className="font-black text-[11px] uppercase tracking-tight">{stats.label}</h4>
                          <span className="text-emerald-400 font-mono text-[10px] font-bold">${stats.cost.money?.toLocaleString()}</span>
                        </div>
                        <p className="text-[9px] text-slate-500 italic leading-tight">{stats.description} ({stats.width}x{stats.height})</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'market' && (
            <div className="space-y-4">
               {Object.entries(gameState.marketPrices).map(([res, priceObj]) => {
                 const p = priceObj as MarketPrice;
                 const currentStock = (gameState.resources as any)[res] || 0;
                 return (
                   <div key={res} className="p-5 bg-indigo-950/20 border border-white/5 rounded-3xl space-y-4 shadow-xl">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-black uppercase text-xs text-indigo-100 tracking-widest">{res}</h4>
                          <span className="text-[10px] text-slate-500 uppercase font-bold">Zalihe: {Math.floor(currentStock)}</span>
                        </div>
                        <div className="text-right">
                          <p className={`font-mono text-sm font-black flex items-center gap-1 ${p.trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                            {p.trend === 'up' ? <TrendingUp size={14}/> : <TrendingDown size={14}/>}
                            ${Math.floor(p.current)}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => sellResource(res as ResourceType, 10)} disabled={currentStock < 10} className="py-2 bg-emerald-600/10 border border-emerald-500/20 rounded-xl text-[9px] font-black uppercase text-emerald-400 hover:bg-emerald-600/20 disabled:opacity-20 transition-all">Prodaj 10</button>
                        <button onClick={() => sellResource(res as ResourceType, 100)} disabled={currentStock < 100} className="py-2 bg-emerald-600/20 border border-emerald-500/30 rounded-xl text-[9px] font-black uppercase text-white hover:bg-emerald-600 transition-all disabled:opacity-20">Prodaj 100</button>
                      </div>
                   </div>
                 );
               })}
            </div>
          )}
        </div>
      </div>

      {/* MAP VIEWPORT */}
      <div className="flex-1 relative bg-[#05080f] overflow-hidden">
        {/* HUD */}
        <div className="absolute top-0 left-0 right-0 h-16 bg-[#07101f]/90 backdrop-blur-xl border-b border-white/5 flex items-center px-10 z-40 gap-10 shadow-2xl">
           <div className="flex gap-10 overflow-x-auto scrollbar-hide flex-1 items-center">
              {Object.entries(gameState.resources).slice(0, 6).map(([r, v]) => (
                <div key={r} className="flex flex-col items-center min-w-[70px]">
                  <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1">{r}</span>
                  <span className={`font-mono text-sm font-black ${r === 'money' ? 'text-emerald-400' : 'text-white'}`}>
                    {r === 'money' ? '$' : ''}{Math.floor(v as number).toLocaleString()}
                  </span>
                </div>
              ))}
           </div>
           <div className="flex items-center gap-4">
              {isNight ? <Moon size={20} className="text-indigo-400 animate-pulse"/> : <Sun size={20} className="text-amber-400"/>}
              <div className="h-8 w-px bg-white/10 mx-2" />
              <div className="px-4 py-1.5 bg-black/40 rounded-full border border-white/5 text-[10px] font-black tracking-tighter uppercase">DAN {gameState.day}</div>
           </div>
        </div>

        {/* CONTROLS */}
        <div className="absolute top-20 right-6 flex flex-col gap-3 z-40">
          <button onClick={() => setGameState(p => ({...p, camera: {...p.camera, zoom: Math.min(4, p.camera.zoom + 0.2)}}))} className="w-12 h-12 bg-[#07101f]/90 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-indigo-600 transition-all shadow-2xl"><Plus/></button>
          <button onClick={() => setGameState(p => ({...p, camera: {...p.camera, zoom: Math.max(0.2, p.camera.zoom - 0.2)}}))} className="w-12 h-12 bg-[#07101f]/90 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-indigo-600 transition-all shadow-2xl"><Minus/></button>
          <button onClick={() => setGameState(p => ({...p, camera: {x: window.innerWidth/2, y: window.innerHeight/2, zoom: 1}}))} className="w-12 h-12 bg-[#07101f]/90 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-indigo-600 transition-all shadow-2xl"><Target/></button>
          <div className="h-px bg-white/10 my-1" />
          <button onClick={() => { 
            if (history.length > 0) {
              setGameState(p => ({ ...p, buildings: history[0] }));
              setHistory(h => h.slice(1));
            }
          }} className="w-12 h-12 bg-amber-600/10 border border-amber-500/30 rounded-2xl flex items-center justify-center hover:bg-amber-600 transition-all shadow-2xl" title="Undo"><Undo2/></button>
          <button onClick={() => { if(window.confirm("Ovo će obrisati sav vaš napredak. Da li ste sigurni?")) setGameState(getInitialGameState()); }} className="w-12 h-12 bg-red-600/10 border border-red-500/30 rounded-2xl flex items-center justify-center hover:bg-red-600 transition-all shadow-2xl" title="Reset"><RotateCcw/></button>
        </div>

        {/* THE WORLD */}
        <div 
          onMouseDown={e => { dragStart.current = { x: e.clientX - gameState.camera.x, y: e.clientY - gameState.camera.y }; setIsDragging(true); dragDistance.current = 0; }}
          onMouseMove={e => { if(isDragging) { dragDistance.current++; setGameState(p => ({...p, camera: {...p.camera, x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y }})); } }}
          onMouseUp={() => setIsDragging(false)}
          className="w-full h-full relative cursor-grab active:cursor-grabbing grass-pattern"
        >
          <div className="absolute origin-center transition-transform map-view"
               style={{ 
                 left: gameState.camera.x, top: gameState.camera.y, 
                 transform: `translate(-50%, -50%) scale(${gameState.camera.zoom})`,
                 width: gameState.gridSize * CELL_SIZE, height: gameState.gridSize * CELL_SIZE
               }}>
            
            <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${gameState.gridSize}, ${CELL_SIZE}px)` }}>
               {Array.from({length: gameState.gridSize * gameState.gridSize}).map((_, i) => (
                 <div key={i} onClick={() => { if(dragDistance.current < 5 && selectedBlueprint) handleBuild(selectedBlueprint, i % gameState.gridSize, Math.floor(i / gameState.gridSize)); }} 
                      className="border border-white/[0.02] hover:bg-indigo-400/10 transition-colors" />
               ))}
            </div>

            {gameState.buildings.map(b => {
              const stats = BUILDINGS[b.type];
              if (stats.isRoad) {
                const conn = getRoadConnections(b);
                const isH = b.type === 'highway';
                return (
                  <div key={b.id} className="absolute road-base overflow-hidden shadow-inner" 
                       style={{ left: b.position.x * CELL_SIZE, top: b.position.y * CELL_SIZE, width: b.width * CELL_SIZE, height: b.height * CELL_SIZE }}>
                    {(conn.l || conn.r || (!conn.t && !conn.b)) && (
                      <>{isH ? <div className="highway-center-line" /> : <div className="road-2x2-line" />}</>
                    )}
                    {(conn.t || conn.b) && (
                      <>{isH ? <div className="highway-center-line rotate-90" /> : <div className="road-2x2-line-v" />}</>
                    )}
                  </div>
                );
              }

              return (
                <div key={b.id} onClick={(e) => handleBuildingClick(e, b)}
                     className={`absolute building-3d bg-slate-800 rounded-xl flex flex-col items-center justify-center cursor-pointer border border-white/10 ${selectedBuildingId === b.id ? 'ring-2 ring-indigo-400 z-30 scale-105' : 'z-20'}`}
                     style={{ 
                        left: b.position.x * CELL_SIZE, top: b.position.y * CELL_SIZE, 
                        width: b.width * CELL_SIZE, height: b.height * CELL_SIZE,
                        boxShadow: b.level >= 5 ? '0 0 20px rgba(79, 70, 229, 0.4)' : '10px 10px 0px rgba(0,0,0,0.4)'
                     }}>
                   
                   <div className={`flex flex-col items-center gap-1 transition-all duration-500 ${b.level >= 5 ? 'scale-110' : ''}`}>
                      <div className={`drop-shadow-xl filter transition-all ${b.level >= 5 ? 'saturate-200 brightness-110' : 'saturate-150'}`}>
                        {getBuildingVisual(b.type, b.level)}
                      </div>
                      <span className="text-[10px] font-black opacity-30 select-none">
                        {getBuildingEmoji(b.type)}
                      </span>
                   </div>

                   <div className="absolute top-1 right-1 bg-indigo-600 px-1.5 py-0.5 rounded shadow text-[8px] font-black uppercase">L{b.level}</div>
                   {stats.category === 'residential' && <div className="absolute -bottom-1 -right-1 animate-bounce"><Coins size={14} className="text-yellow-400 drop-shadow-md"/></div>}
                </div>
              );
            })}

            {gameState.npcs.map(n => (
              <div key={n.id} className="absolute transition-all duration-1000 ease-linear pointer-events-none z-50"
                   style={{ left: n.x * CELL_SIZE, top: n.y * CELL_SIZE, transform: 'translate(-50%, -50%)' }}>
                {n.isDriving ? (
                  <div className="car-3d" style={{ transform: `rotate(${Math.random() > 0.5 ? 0 : 90}deg)` }} />
                ) : (
                  <span className="text-lg drop-shadow-md">🚶</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* FLOATING TEXT */}
        {floatingTexts.map(ft => (
          <div key={ft.id} className="fixed font-black text-emerald-400 text-3xl italic drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] z-[100] animate-pulse pointer-events-none transform -translate-y-20 transition-all duration-1000" style={{ left: ft.x, top: ft.y }}>{ft.text}</div>
        ))}

        {/* UPGRADE PANEL */}
        {selectedBuildingId && (() => {
          const b = gameState.buildings.find(x => x.id === selectedBuildingId);
          if (!b) return null;
          const stats = BUILDINGS[b.type];
          const upgradeCost = Math.floor(stats.cost.money! * b.level * 2);
          const canAfford = gameState.resources.money >= upgradeCost;

          return (
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[600px] bg-[#07101f]/95 backdrop-blur-3xl border border-white/10 p-10 rounded-[40px] shadow-2xl z-50 flex flex-col gap-8 animate-in slide-in-from-bottom-20">
               <div className="flex items-center gap-8">
                  <div className="w-28 h-28 rounded-3xl bg-indigo-600/10 flex items-center justify-center shadow-inner border border-white/5">
                    <div className="scale-[2] transition-transform duration-700">
                       {getBuildingVisual(b.type, b.level)}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-3xl font-black uppercase tracking-tighter text-white mb-2">{stats.label} <span className="text-indigo-400 font-mono">L{b.level}</span></h2>
                    <p className="text-xs text-slate-400 italic mb-6 leading-relaxed">{stats.description || 'Važan deo vašeg grada.'}</p>
                    <div className="flex gap-4">
                       <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
                          <Zap size={18} className="text-amber-400"/>
                          <div className="flex flex-col">
                            <span className="text-[8px] uppercase font-black text-slate-500">Produkcija</span>
                            <span className="text-xs font-black text-white">+{Math.floor((Object.values(stats.production)[0] as number || 0) * b.level)}</span>
                          </div>
                       </div>
                       <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
                          <Users size={18} className="text-indigo-400"/>
                          <div className="flex flex-col">
                            <span className="text-[8px] uppercase font-black text-slate-500">Kapacitet</span>
                            <span className="text-xs font-black text-white">{stats.workerCapacity * b.level}</span>
                          </div>
                       </div>
                    </div>
                  </div>
               </div>

               <div className="flex gap-4">
                  <button onClick={() => handleUpgrade(b.id)} disabled={!canAfford}
                          className={`flex-[2] py-5 rounded-3xl flex items-center justify-center gap-3 font-black uppercase text-sm transition-all shadow-xl ${canAfford ? 'bg-indigo-600 hover:bg-indigo-500 upgrade-glow text-white' : 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5'}`}>
                    <ArrowUpCircle size={24}/>
                    {canAfford ? `Nadogradi na nivo ${b.level + 1} ($${upgradeCost.toLocaleString()})` : 'Nedovoljno novca'}
                  </button>
                  <button onClick={() => setSelectedBuildingId(null)} className="flex-1 py-5 bg-white/5 border border-white/10 rounded-3xl font-black uppercase text-sm hover:bg-white/10 transition-all">Zatvori</button>
               </div>
            </div>
          );
        })()}

        {/* AI ADVISOR */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 px-10 py-4 bg-[#07101f]/95 backdrop-blur-xl rounded-full border border-indigo-500/30 shadow-2xl z-40 flex items-center gap-6 pointer-events-none">
           <div className={`w-3 h-3 rounded-full ${gameState.isAnalyzing ? 'bg-amber-400 animate-spin' : 'bg-indigo-400 animate-pulse'}`} />
           <p className="text-xs font-bold italic text-indigo-100 tracking-tight">{gameState.aiAdvice}</p>
        </div>
      </div>
    </div>
  );
};

export default App;
