
import React, { useState, useEffect, useMemo, useRef } from 'react';
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
import { INITIAL_RESOURCES, BUILDINGS, INITIAL_LIMITED_ITEMS, ZONES, DAY_DURATION } from './constants';
import { getAIAdvice } from './services/gemini';
import { 
  Zap, 
  Hammer, 
  Wheat, 
  Coins, 
  Gem, 
  HelpCircle,
  Lock,
  Award,
  Maximize2,
  RefreshCw,
  Move,
  Plus,
  Droplets,
  Trash2,
  Cpu,
  Home,
  Factory,
  Building as BuildingIcon,
  ShoppingBag,
  Wrench,
  Sun,
  Moon,
  ArrowUpCircle,
  TrendingUp,
  DollarSign,
  ChevronRight,
  Menu
} from 'lucide-react';

const CELL_SIZE = 40; // Dense grid for large map

interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  type?: 'income' | 'spend';
}

const App: React.FC = () => {
  const initialHome: Building = {
    id: 'starter-home',
    type: 'starter_home',
    level: 1,
    position: { x: 15, y: 15 },
    width: 1,
    height: 1,
    isIncorporated: true
  };

  const [gameState, setGameState] = useState<GameState>({
    resources: INITIAL_RESOURCES,
    buildings: [initialHome],
    day: 1,
    aiAdvice: "Gospodine, grid je spreman za ekspanziju do 200x200. Shop je sada reaktivan u mikrosekundi!",
    isAnalyzing: false,
    marketPrices: {
      food: { current: 30, trend: 'stable' },
      wood: { current: 35, trend: 'stable' },
      stone: { current: 85, trend: 'stable' },
      tools: { current: 450, trend: 'stable' },
      luxury: { current: 2200, trend: 'stable' },
      tech: { current: 5000, trend: 'stable' },
    },
    reputation: 50,
    happiness: 80,
    limitedItems: INITIAL_LIMITED_ITEMS,
    lastStockReset: Date.now(),
    unlockedZones: ['z1'],
    tier: 1,
    camera: { x: window.innerWidth/2 - 16*40, y: window.innerHeight/2 - 16*40, zoom: 0.8 },
    npcs: [{ id: 'player', x: 15.5, y: 15.5, targetX: 15.5, targetY: 15.5, type: 'player', state: 'leisure', lastSpendingTick: 0 }],
    activeQuests: [{ title: 'Proširi teritoriju na 64x64', isCompleted: false }],
    activeEvent: undefined,
    gridSize: 32
  });

  const [selectedCell, setSelectedCell] = useState<{x: number, y: number} | null>(null);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'build' | 'market' | 'map'>('build');
  const [shopCategory, setShopCategory] = useState<BuildingCategory>('residential');
  const [isDragging, setIsDragging] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const dragStart = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const isNight = useMemo(() => (gameState.day % 2 === 0), [gameState.day]);

  // Main Loop
  useEffect(() => {
    const timer = setInterval(() => {
      setGameState(prev => {
        const nextResources: Resources = { ...prev.resources };
        let nextReputation = prev.reputation;
        
        prev.buildings.forEach(b => {
          const stats = BUILDINGS[b.type];
          const mult = 1 + (b.level - 1) * 0.8;
          
          Object.entries(stats.production).forEach(([res, amount]) => {
            if (res === 'reputation') {
              nextReputation += Number(amount) * mult;
            } else {
              (nextResources as any)[res] = Number((nextResources as any)[res]) + Number(amount) * mult;
            }
          });
          Object.entries(stats.consumption).forEach(([res, amount]) => {
            (nextResources as any)[res] = Math.max(0, Number((nextResources as any)[res]) - Number(amount) * mult);
          });
        });

        return {
          ...prev,
          resources: nextResources,
          day: prev.day + 1,
          reputation: nextReputation,
          npcs: updateNPCs(prev)
        };
      });
    }, DAY_DURATION);
    return () => clearInterval(timer);
  }, []);

  // Fetch AI Advice periodically using the Gemini API service
  useEffect(() => {
    if (gameState.day > 1 && gameState.day % 5 === 0) {
      const fetchAdvice = async () => {
        setGameState(prev => ({ ...prev, isAnalyzing: true }));
        try {
          const advice = await getAIAdvice(gameState);
          setGameState(prev => ({ ...prev, aiAdvice: advice, isAnalyzing: false }));
        } catch (error) {
          console.error("AI Advice retrieval error:", error);
          setGameState(prev => ({ ...prev, isAnalyzing: false }));
        }
      };
      fetchAdvice();
    }
  }, [gameState.day]);

  const updateNPCs = (prev: GameState) => {
    const targetCount = Math.min(100, Math.floor(prev.resources.workers / 1.1) + 12);
    let nextNpcs = [...prev.npcs];
    
    const homes = prev.buildings.filter(b => BUILDINGS[b.type].category === 'residential');
    const shops = prev.buildings.filter(b => BUILDINGS[b.type].category === 'commercial');

    if (nextNpcs.length < targetCount) {
      const home = homes[Math.floor(Math.random() * homes.length)];
      nextNpcs.push({
        id: Math.random().toString(),
        x: home ? home.position.x + 0.5 : Math.random() * prev.gridSize,
        y: home ? home.position.y + 0.5 : Math.random() * prev.gridSize,
        targetX: Math.random() * prev.gridSize,
        targetY: Math.random() * prev.gridSize,
        type: 'citizen',
        homeId: home?.id,
        state: 'leisure',
        lastSpendingTick: 0
      });
    }

    const dayCycle = prev.day % 2; 

    return nextNpcs.map(npc => {
      let targetX = npc.targetX;
      let targetY = npc.targetY;
      let state = npc.state;

      if (dayCycle === 0) { // DAY
        if (Math.random() > 0.9 && shops.length > 0 && npc.state !== 'shopping') {
          const shop = shops[Math.floor(Math.random() * shops.length)];
          targetX = shop.position.x + (shop.width / 2);
          targetY = shop.position.y + (shop.height / 2);
          state = 'shopping';
        }
      } else if (npc.homeId) { // NIGHT
        const homeB = prev.buildings.find(b => b.id === npc.homeId);
        if (homeB) {
          targetX = homeB.position.x + (homeB.width / 2);
          targetY = homeB.position.y + (homeB.height / 2);
          state = 'sleeping';
        }
      }

      const dx = targetX - npc.x;
      const dy = targetY - npc.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      let speed = 0.08;

      if (dist < 0.2) {
        if (state === 'shopping' && Math.random() > 0.97) state = 'leisure';
        return { ...npc, state };
      }

      return { ...npc, x: npc.x + dx * speed, y: npc.y + dy * speed, state };
    });
  };

  // Fixed missing handleBuildingClick error
  const handleBuildingClick = (e: React.MouseEvent, b: Building) => {
    e.stopPropagation();
    setSelectedBuildingId(b.id);
    setSelectedCell(null);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsDragging(true);
      dragStart.current = { x: e.clientX - gameState.camera.x, y: e.clientY - gameState.camera.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setGameState(prev => ({
        ...prev,
        camera: { ...prev.camera, x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y }
      }));
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const isZoneUnlocked = (x: number, y: number) => {
    const zone = ZONES.find(z => x >= z.gridRange.xMin && x <= z.gridRange.xMax && y >= z.gridRange.yMin && y <= z.gridRange.yMax);
    return zone && gameState.unlockedZones.includes(zone.id);
  };

  const handleBuild = (type: BuildingType) => {
    if (!selectedCell) return;
    const stats = BUILDINGS[type];
    
    if (selectedCell.x + stats.width > gameState.gridSize || selectedCell.y + stats.height > gameState.gridSize) return;

    for (let i = 0; i < stats.width; i++) {
      for (let j = 0; j < stats.height; j++) {
        if (!isZoneUnlocked(selectedCell.x + i, selectedCell.y + j)) return;
      }
    }

    const collision = gameState.buildings.some(b => {
      return (selectedCell.x < b.position.x + b.width && selectedCell.x + stats.width > b.position.x &&
              selectedCell.y < b.position.y + b.height && selectedCell.y + stats.height > b.position.y);
    });
    if (collision) return;

    const canAfford = Object.entries(stats.cost).every(([res, amount]) => 
      (gameState.resources as any)[res] >= (amount || 0)
    );
    if (!canAfford) return;

    setGameState(prev => {
      const nextRes = { ...prev.resources };
      Object.entries(stats.cost).forEach(([res, amt]) => { (nextRes as any)[res] -= (amt || 0); });
      
      return {
        ...prev,
        resources: nextRes,
        buildings: [...prev.buildings, { 
          id: Math.random().toString(), 
          type, level: 1, 
          position: { ...selectedCell }, 
          width: stats.width, height: stats.height, 
          isIncorporated: false 
        }],
        reputation: prev.reputation + (stats.repImpact || 0)
      };
    });
    setSelectedCell(null);
  };

  const handleUpgrade = (bId: string) => {
    const building = gameState.buildings.find(b => b.id === bId);
    if (!building) return;
    const stats = BUILDINGS[building.type];
    const upgradeCost = Math.floor(stats.cost.money! * building.level * 2.5);

    if (gameState.resources.money < upgradeCost) return;

    setGameState(prev => ({
      ...prev,
      resources: { ...prev.resources, money: prev.resources.money - upgradeCost },
      buildings: prev.buildings.map(b => b.id === bId ? { ...b, level: b.level + 1 } : b),
      reputation: prev.reputation + 100
    }));
  };

  const occupancy = useMemo(() => {
    const unlockedZones = ZONES.filter(z => gameState.unlockedZones.includes(z.id));
    const lastZone = unlockedZones[unlockedZones.length - 1];
    if (!lastZone) return 0;
    const totalCells = (lastZone.gridRange.xMax - lastZone.gridRange.xMin + 1) * (lastZone.gridRange.yMax - lastZone.gridRange.yMin + 1);
    const occupiedInLastZone = gameState.buildings.filter(b => 
      b.position.x >= lastZone.gridRange.xMin && b.position.x <= lastZone.gridRange.xMax &&
      b.position.y >= lastZone.gridRange.yMin && b.position.y <= lastZone.gridRange.yMax
    ).reduce((acc, b) => acc + (b.width * b.height), 0);
    return (occupiedInLastZone / totalCells) * 100;
  }, [gameState.buildings, gameState.unlockedZones]);

  const selectedBuilding = useMemo(() => gameState.buildings.find(b => b.id === selectedBuildingId), [selectedBuildingId, gameState.buildings]);

  const getResourceIcon = (res: string) => {
    switch(res) {
      case 'money': return <Coins size={14} className="text-emerald-400" />;
      case 'food': return <Wheat size={14} className="text-emerald-400" />;
      case 'energy': return <Zap size={14} className="text-yellow-400" />;
      case 'water': return <Droplets size={14} className="text-blue-400" />;
      case 'waste': return <Trash2 size={14} className="text-orange-500" />;
      case 'tech': return <Cpu size={14} className="text-indigo-400" />;
      default: return null;
    }
  };

  return (
    <div className={`flex h-screen w-full transition-colors duration-[3000ms] ${isNight ? 'bg-[#010106]' : 'bg-[#040404]'} text-gray-100 font-sans select-none overflow-hidden relative`}>
      {/* SIDEBAR */}
      <div className={`${isSidebarOpen ? 'w-full lg:w-[440px]' : 'w-0 lg:w-[60px]'} h-full bg-[#0c0c0e]/98 backdrop-blur-3xl border-r border-white/5 flex flex-col z-50 transition-all duration-500 shadow-2xl relative overflow-hidden shrink-0`}>
        <div className="p-6 border-b border-white/5 bg-indigo-900/10 shrink-0">
          <div className="flex items-center justify-between mb-6">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-2xl border border-indigo-400/40">
                  <TrendingUp size={28} className="text-white" />
                </div>
                {isSidebarOpen && (
                  <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                    <h1 className="font-black text-xl tracking-tighter uppercase italic text-white leading-none">TYCOON <span className="text-indigo-400">ULTRA</span></h1>
                    <span className="text-[9px] font-black text-indigo-400/50 uppercase tracking-[0.4em] block mt-1">Expansion System</span>
                  </div>
                )}
             </div>
             <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all border border-white/5 lg:block hidden">
               <Menu size={20} />
             </button>
             <button onClick={() => setIsSidebarOpen(false)} className="p-3 bg-white/5 rounded-2xl lg:hidden block">
               <ChevronRight size={20} />
             </button>
          </div>

          {isSidebarOpen && (
            <div className="grid grid-cols-2 gap-4 mb-2 animate-in fade-in duration-500">
              <div className="bg-black/60 p-4 rounded-[2rem] border border-white/10 shadow-2xl">
                <span className="text-[9px] font-black text-gray-500 uppercase block mb-2 tracking-widest">Sektor: {gameState.gridSize}x{gameState.gridSize}</span>
                <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 transition-all duration-1000 shadow-[0_0_15px_rgba(99,102,241,1)]" style={{ width: `${Math.min(100, occupancy)}%` }} />
                </div>
              </div>
              <div className="bg-black/60 p-4 rounded-[2rem] border border-white/10 shadow-2xl text-center flex flex-col justify-center">
                <p className="text-2xl font-black font-mono tracking-tighter text-indigo-400 leading-none">{Math.floor(gameState.reputation)}</p>
                <span className="text-[8px] font-black text-gray-600 uppercase mt-1">RANK</span>
              </div>
            </div>
          )}
        </div>

        {isSidebarOpen && (
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 animate-in fade-in duration-500">
            <div className="flex bg-black/60 p-1.5 rounded-[2.5rem] border border-white/5 backdrop-blur-3xl">
              {['build', 'market', 'map'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`flex-1 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                    activeTab === tab ? 'bg-indigo-600 text-white shadow-2xl scale-105' : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {tab === 'build' ? 'OBJEKTI' : tab === 'market' ? 'BERZA' : 'MAPA'}
                </button>
              ))}
            </div>

            {activeTab === 'build' && (
              <div className="space-y-6 pb-24">
                <div className="flex justify-between gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {(['residential', 'production', 'commercial', 'public', 'infrastructure'] as BuildingCategory[]).map(cat => (
                    <button 
                      key={cat}
                      onClick={() => setShopCategory(cat)}
                      className={`flex flex-col items-center justify-center min-w-[80px] h-14 rounded-2xl border transition-all ${
                        shopCategory === cat ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-white/5 border-white/5 text-gray-500 hover:bg-white/10'
                      }`}
                    >
                      <span className="text-[9px] font-black uppercase tracking-tighter">{cat.slice(0, 4)}</span>
                    </button>
                  ))}
                </div>

                {Object.entries(BUILDINGS)
                  .filter(([_, stats]) => stats.category === shopCategory)
                  .filter(([type]) => type !== 'starter_home')
                  .map(([type, stats]) => {
                  const unlocked = gameState.buildings.filter(b => b.type === stats.unlockRequirement?.type).length >= (stats.unlockRequirement?.count || 0);
                  const canAfford = Object.entries(stats.cost).every(([res, amount]) => (gameState.resources as any)[res] >= (amount || 0));
                  
                  return (
                    <button
                      key={type}
                      disabled={!canAfford || !unlocked}
                      onClick={() => { handleBuild(type as BuildingType); if (window.innerWidth < 1024) setIsSidebarOpen(false); }}
                      className={`w-full p-6 rounded-[3rem] border text-left transition-all relative overflow-hidden group shadow-xl ${
                        !unlocked ? 'bg-black/95 opacity-20 grayscale pointer-events-none' : !canAfford ? 'bg-white/[0.01] border-white/5 opacity-50 grayscale' : 'bg-white/[0.04] border-white/10 hover:border-indigo-500/50 hover:bg-white/[0.08] hover:-translate-y-2 active:scale-95'
                      }`}
                    >
                      {!unlocked && (
                        <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center p-4 text-center z-10">
                          <Lock size={20} className="text-gray-800 mb-2" />
                          <p className="text-[8px] font-black text-gray-700 uppercase tracking-widest">{stats.unlockRequirement?.count}x {stats.unlockRequirement?.type}</p>
                        </div>
                      )}
                      <div className="flex justify-between items-start mb-3">
                        <h5 className="font-black text-sm uppercase tracking-tight text-white italic">{stats.label} <span className="text-[10px] text-indigo-500/30 ml-2 font-mono">{stats.width}x{stats.height}</span></h5>
                        <span className={`text-[12px] font-black font-mono px-3 py-1 rounded-2xl ${canAfford ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10'}`}>${stats.cost.money?.toLocaleString()}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(stats.cost).map(([res, amt]) => amt! > 0 && res !== 'money' && (
                          <div key={res} className="flex items-center gap-2 bg-black/60 px-3 py-1 rounded-xl text-[10px] font-black uppercase text-gray-400 border border-white/5">
                            {getResourceIcon(res)} {amt}
                          </div>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {activeTab === 'market' && (
              <div className="space-y-4">
                {(Object.entries(gameState.marketPrices) as [string, MarketPrice][]).map(([res, data]) => (
                  <div key={res} className="bg-black/60 p-6 rounded-[2.5rem] border border-white/10 flex justify-between items-center group shadow-xl hover:bg-white/5 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-[1.5rem] bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 group-hover:scale-110 transition-transform">
                        {getResourceIcon(res)}
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 italic">{res}</p>
                        <p className="text-2xl font-black font-mono tracking-tighter text-white">${data.current}</p>
                      </div>
                    </div>
                    <button 
                      disabled={gameState.resources[res as ResourceType] < 1}
                      onClick={() => {
                        setGameState(prev => ({
                          ...prev,
                          resources: { ...prev.resources, [res]: prev.resources[res as ResourceType] - 1, money: prev.resources.money + data.current }
                        }));
                      }}
                      className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[2rem] text-[11px] font-black uppercase tracking-widest transition-all shadow-xl disabled:opacity-20 active:scale-90"
                    >
                      PRODAJ
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'map' && (
              <div className="space-y-6">
                {ZONES.map((zone, idx) => {
                  const isUnlocked = gameState.unlockedZones.includes(zone.id);
                  const canUnlockNext = occupancy >= 60;
                  const isNext = !isUnlocked && gameState.unlockedZones.length === idx;

                  return (
                    <div key={zone.id} className={`p-8 rounded-[3.5rem] border transition-all shadow-xl ${isUnlocked ? 'bg-emerald-500/5 border-emerald-500/10 opacity-70 scale-95' : 'bg-black/80 border-white/10 hover:border-indigo-500/30'}`}>
                      <div className="flex justify-between items-center mb-8">
                        <div className="flex flex-col">
                          <h5 className="font-black text-lg uppercase tracking-[0.2em] text-white italic leading-none mb-2">{zone.name}</h5>
                          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{isUnlocked ? 'STATUS: KONTROLISANO' : 'STATUS: DOSTUPNO'}</span>
                        </div>
                        {isUnlocked ? <Award size={32} className="text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]" /> : <Lock size={24} className="text-gray-800" />}
                      </div>
                      {!isUnlocked && (
                        <button
                          disabled={!isNext || !canUnlockNext || gameState.resources.money < zone.cost}
                          onClick={() => {
                            setGameState(prev => ({
                              ...prev,
                              resources: { ...prev.resources, money: prev.resources.money - zone.cost },
                              unlockedZones: [...prev.unlockedZones, zone.id],
                              gridSize: zone.expansionSize,
                              aiAdvice: `Ekspanzija uspešna! Grid proširen na ${zone.expansionSize}x${zone.expansionSize}.`
                            }));
                          }}
                          className="w-full py-6 bg-white text-black hover:bg-indigo-600 hover:text-white disabled:opacity-20 rounded-[2.5rem] text-[12px] font-black uppercase tracking-[0.4em] transition-all shadow-2xl"
                        >
                          {!canUnlockNext ? `POTREBNO 60% POPUNJENOSTI` : `OTKUPI ZA $${zone.cost.toLocaleString()}`}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* VIEWPORT */}
      <div className="flex-1 relative flex flex-col overflow-hidden">
        {/* HUD Top - Mobile Responsive */}
        <div className="h-24 lg:h-28 bg-black/95 backdrop-blur-3xl border-b border-white/10 flex items-center justify-between px-6 lg:px-12 z-40 shadow-2xl shrink-0">
           <button onClick={() => setIsSidebarOpen(true)} className="p-3 bg-white/5 rounded-2xl mr-4 lg:hidden">
              <Menu size={24} />
           </button>
           <div className="flex items-center gap-6 lg:gap-10 overflow-x-auto scrollbar-hide py-2 flex-1 mask-linear-gradient">
             {Object.entries(gameState.resources).map(([res, val]) => (
               <div key={res} className="flex flex-col items-center min-w-[70px] lg:min-w-[80px]">
                  <span className="text-[9px] font-black uppercase text-gray-500 mb-1 tracking-tighter leading-none">{res}</span>
                  <span className={`font-mono font-black text-lg lg:text-2xl leading-none ${res === 'money' ? 'text-emerald-400' : 'text-white'}`}>
                    {res === 'money' ? '$' : ''}{Math.floor(val as number).toLocaleString()}
                  </span>
               </div>
             ))}
           </div>
           <div className="flex items-center gap-4 lg:gap-8 pl-6 lg:pl-10 border-l border-white/10 shrink-0">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] italic drop-shadow-lg">DAN {gameState.day}</span>
              </div>
              <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                 {isNight ? <Moon size={24} className="text-indigo-400" /> : <Sun size={24} className="text-amber-400" />}
              </div>
           </div>
        </div>

        <div 
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="flex-1 relative overflow-hidden cursor-grab active:cursor-grabbing bg-[#050508]"
        >
          <div 
            className="absolute origin-top-left transition-transform duration-100 ease-out"
            style={{ 
              transform: `translate(${gameState.camera.x}px, ${gameState.camera.y}px) scale(${gameState.camera.zoom})`,
              width: gameState.gridSize * CELL_SIZE,
              height: gameState.gridSize * CELL_SIZE
            }}
          >
            {/* Infinite Grid Visual */}
            <div className="absolute inset-0 bg-[#080a08]" style={{ 
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.01) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.01) 1px, transparent 1px)', 
              backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px` 
            }} />

            {/* Selection Grid */}
            {Array.from({ length: gameState.gridSize * gameState.gridSize }).map((_, i) => {
              const x = i % gameState.gridSize;
              const y = Math.floor(i / gameState.gridSize);
              const unlocked = isZoneUnlocked(x, y);
              const isSelected = selectedCell?.x === x && selectedCell?.y === y;
              
              if (!unlocked) return <div key={i} className="absolute w-[40px] h-[40px] bg-black/90 z-0 border border-black/40" style={{ left: x * CELL_SIZE, top: y * CELL_SIZE }} />;

              return (
                <div 
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setSelectedCell({x, y}); setSelectedBuildingId(null); }}
                  className={`absolute w-[40px] h-[40px] border-[0.5px] border-white/5 transition-all ${isSelected ? 'bg-indigo-500/30 ring-4 ring-indigo-400/40 z-10 scale-105 shadow-2xl' : 'hover:bg-white/[0.03]'}`}
                  style={{ left: x * CELL_SIZE, top: y * CELL_SIZE }}
                />
              );
            })}

            {/* Smart Footprint Buildings */}
            {gameState.buildings.map(b => {
              const emoji = BUILDINGS[b.type].isRoad ? (b.type === 'road' ? '⬛' : '🟫') : '';
              return (
               <div
                 key={b.id}
                 onClick={(e) => handleBuildingClick(e, b)}
                 className={`absolute z-10 animate-in fade-in duration-300 cursor-pointer transition-all group ${selectedBuildingId === b.id ? 'ring-4 ring-indigo-500 rounded-xl z-20' : ''}`}
                 style={{ 
                   left: b.position.x * CELL_SIZE, top: b.position.y * CELL_SIZE, 
                   width: b.width * CELL_SIZE, height: b.height * CELL_SIZE 
                 }}
               >
                  <div className={`w-full h-full flex items-center justify-center relative transition-all duration-300 overflow-hidden
                    ${BUILDINGS[b.type].isRoad 
                      ? 'bg-[#18181a] border border-white/5 shadow-inner' 
                      : 'bg-white/[0.07] rounded-xl border border-white/10 shadow-2xl group-hover:from-white/[0.1] group-hover:-translate-y-1'
                    }`}>
                    
                    {BUILDINGS[b.type].isRoad && (
                       <div className="absolute w-full h-[2px] bg-yellow-500/30 shadow-[0_0_8px_yellow]" style={{ top: '50%', transform: 'translateY(-50%)' }} />
                    )}

                    <div 
                      className="drop-shadow-2xl filter saturate-[1.4] brightness-125 transform group-hover:scale-110 transition-transform leading-none text-center select-none"
                      style={{ fontSize: `${Math.min(b.width, b.height) * 28}px` }}
                    >
                       {b.type === 'starter_home' && '🏛️'}
                       {b.type === 'small_shack' && '🏚️'}
                       {b.type === 'suburban_house' && '🏡'}
                       {b.type === 'factory' && '🏭'}
                       {b.type === 'school' && '🏫'}
                       {b.type === 'skyscraper' && '🏢'}
                       {b.type === 'road' && '⬛'}
                       {b.type === 'mall' && '🛍️'}
                       {b.type === 'stadium' && '🏟️'}
                       {b.type === 'university' && '🎓'}
                       {b.type === 'airport' && '✈️'}
                       {b.type === 'luxury_mansion' && '🏰'}
                       {b.type === 'modern_villa' && '🏠'}
                       {b.type === 'capsule_hotel' && '🏨'}
                       {b.type === 'bank' && '🏦'}
                       {b.type === 'hospital' && '🏥'}
                       {b.type === 'park' && '🌳'}
                       {b.type === 'cinema' && '🎬'}
                       {b.type === 'iron_mine' && '⛏️'}
                       {b.type === 'quarry' && '🧱'}
                       {b.type === 'farm' && '🌾'}
                       {b.type === 'orchard' && '🍎'}
                    </div>
                    {b.level > 1 && (
                      <div className="absolute top-1 right-1 bg-indigo-600 text-[7px] font-black px-1 py-0.5 rounded-md border border-white/10 shadow-lg">LV {b.level}</div>
                    )}
                  </div>
               </div>
            )})}

            {/* Smart NPCs */}
            {gameState.npcs.map(npc => (
               <div key={npc.id} className="absolute w-6 h-6 flex items-center justify-center z-30 pointer-events-none transition-all duration-[600ms] ease-linear" 
                 style={{ 
                   left: npc.x * CELL_SIZE, 
                   top: npc.y * CELL_SIZE, 
                   transform: 'translate(-50%, -50%)' 
                 }}>
                  <div className={`text-lg filter drop-shadow-2xl flex flex-col items-center ${npc.type === 'player' ? 'scale-150 brightness-150 z-40' : 'opacity-100'}`}>
                    {npc.type === 'player' ? '👑' : '🚶'}
                  </div>
               </div>
            ))}
          </div>

          {/* Night Overlay */}
          <div className={`absolute inset-0 pointer-events-none transition-opacity duration-[3000ms] ${isNight ? 'opacity-35' : 'opacity-0'} bg-[#020310] z-40`} />
        </div>

        {/* FEEDBACK & HUD */}
        {floatingTexts.map(ft => (
          <div key={ft.id} className="fixed text-emerald-400 font-black text-3xl pointer-events-none animate-bounce z-50 drop-shadow-[0_0_15px_rgba(52,211,153,1)]" style={{ left: ft.x, top: ft.y - 60 }}>
            {ft.text}
          </div>
        ))}

        {/* CONTROLS */}
        <div className="absolute bottom-8 right-8 z-30 flex flex-col gap-4">
           <div className="bg-[#0b0b0d]/95 p-4 rounded-[2rem] border border-white/10 flex flex-col gap-4 shadow-2xl backdrop-blur-3xl ring-2 ring-white/5">
              <button onClick={() => setGameState(p => ({ ...p, camera: { ...p.camera, zoom: Math.min(2.0, p.camera.zoom + 0.3) } }))} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl shadow-xl transition-all active:scale-90"><Maximize2 size={24} /></button>
              <button onClick={() => setGameState(p => ({ ...p, camera: { ...p.camera, zoom: Math.max(0.1, p.camera.zoom - 0.3) } }))} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl rotate-180 shadow-xl transition-all active:scale-90"><Maximize2 size={24} /></button>
              <button onClick={() => setGameState(p => ({ ...p, camera: { x: window.innerWidth/2 - 16*40, y: window.innerHeight/2 - 16*40, zoom: 0.8 } }))} className="p-4 text-indigo-400 hover:bg-indigo-500/10 rounded-2xl transition-all active:scale-90"><Move size={24} /></button>
           </div>
        </div>

        {/* UPGRADE OVERLAY */}
        {selectedBuilding && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-40 w-[90%] sm:w-auto animate-in slide-in-from-bottom-20 duration-500">
             <div className="bg-[#0b0b0d]/98 border-2 border-indigo-500/50 p-6 lg:p-10 rounded-[4rem] shadow-2xl flex flex-col sm:flex-row items-center gap-6 lg:gap-12 backdrop-blur-3xl">
                <div className="flex flex-col text-center sm:text-left">
                   <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1 italic leading-none">SELEKCIJA</span>
                   <p className="text-xl lg:text-3xl font-black font-mono tracking-tighter text-white uppercase leading-none">{BUILDINGS[selectedBuilding.type].label} <span className="text-gray-500">LV {selectedBuilding.level}</span></p>
                </div>
                <div className="h-px sm:h-12 w-full sm:w-px bg-white/10" />
                <div className="flex items-center gap-4 lg:gap-8">
                   <button 
                      onClick={() => handleUpgrade(selectedBuilding.id)}
                      disabled={gameState.resources.money < Math.floor(BUILDINGS[selectedBuilding.type].cost.money! * selectedBuilding.level * 2.5)}
                      className="px-8 lg:px-12 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-20 rounded-[2rem] text-[12px] lg:text-[14px] font-black uppercase tracking-widest transition-all shadow-2xl active:scale-95"
                   >
                      UPGRADE (${Math.floor(BUILDINGS[selectedBuilding.type].cost.money! * selectedBuilding.level * 2.5).toLocaleString()})
                   </button>
                   <button onClick={() => setSelectedBuildingId(null)} className="px-8 lg:px-12 py-4 bg-white/5 hover:bg-white/10 rounded-[2rem] text-[12px] lg:text-[14px] font-black uppercase border border-white/10 transition-all active:scale-95">ZATVORI</button>
                </div>
             </div>
          </div>
        )}

        {/* SELECTION HUD */}
        {selectedCell && !selectedBuildingId && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 w-[90%] sm:w-auto animate-in slide-in-from-bottom-20 duration-700">
             <div className="bg-[#0c0c0e]/98 border-2 border-indigo-500/50 p-8 lg:p-10 rounded-[4rem] shadow-2xl flex flex-col sm:flex-row items-center gap-6 lg:gap-16 backdrop-blur-[50px]">
                <div className="flex flex-col text-center sm:text-left">
                   <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1 italic leading-none">KOORDINATE</span>
                   <p className="text-3xl lg:text-4xl font-black font-mono tracking-tighter text-white leading-none">{selectedCell.x}, {selectedCell.y}</p>
                </div>
                <div className="h-px sm:h-16 w-full sm:w-px bg-white/10" />
                <div className="flex items-center gap-4 lg:gap-8">
                   <button onClick={() => setSelectedCell(null)} className="px-8 lg:px-12 py-4 bg-white/5 hover:bg-white/10 rounded-[2rem] text-[12px] lg:text-[13px] font-black uppercase border border-white/5 transition-all active:scale-95">RESETOVALI</button>
                   {isZoneUnlocked(selectedCell.x, selectedCell.y) ? (
                     <div className="px-8 lg:px-12 py-4 bg-emerald-500/20 rounded-[2rem] border border-emerald-400/30 text-[12px] lg:text-[13px] font-black uppercase text-emerald-400 tracking-widest flex items-center gap-3 animate-pulse">
                        <Plus size={18} /> DOSTUPNO
                     </div>
                   ) : (
                     <div className="px-8 lg:px-12 py-4 bg-red-500/10 rounded-[2rem] border border-red-500/20 text-[12px] lg:text-[13px] font-black uppercase text-red-400 tracking-widest">
                        ZAKLJUČANO
                     </div>
                   )}
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
