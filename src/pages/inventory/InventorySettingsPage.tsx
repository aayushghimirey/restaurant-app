import { motion } from 'framer-motion';
import {
  Hash,
  Info,
  Layers,
  Plus,
  Ruler,
  Trash2
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { useAuth } from '../../contexts/AuthContext';
import { inventoryService } from '../../services/inventoryService';
import {
  UnitType,
  type CreateCustomUnitRequest,
  type UnitResponse
} from '../../types/inventory';

export default function InventorySettingsPage() {
  const { isTenant } = useAuth();
  const [systemUnits, setSystemUnits] = useState<UnitResponse[]>([]);
  const [customUnits, setCustomUnits] = useState<UnitResponse[]>([]);
  const [loading, setLoading] = useState(true);
  
  // New Unit Form State
  const [showAddUnit, setShowAddUnit] = useState(false);
  const [newUnit, setNewUnit] = useState<CreateCustomUnitRequest>({
    name: '',
    symbol: '',
    unitType: UnitType.COUNT,
    conversionFactor: 1,
  });
  const [confirmConfig, setConfirmConfig] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    isLoading: boolean;
  }>({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {},
    isLoading: false
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sys, cust] = await Promise.all([
        inventoryService.getSystemUnits(),
        inventoryService.getCustomUnits()
      ]);
      setSystemUnits(sys.data?.content || []);
      setCustomUnits(cust.data?.content || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await inventoryService.createCustomUnit(newUnit);
      if (res.success) {
        toast.success('Custom unit created');
        setShowAddUnit(false);
        setNewUnit({ name: '', symbol: '', unitType: UnitType.COUNT, conversionFactor: 1 });
        fetchData();
      }
    } catch (err) {
      toast.error('Failed to create unit');
    }
  };

  const handleDeleteUnit = async (id: string) => {
    setConfirmConfig({
      open: true,
      title: 'Delete Custom Unit',
      message: 'Are you sure? This may affect items using this unit.',
      isLoading: false,
      onConfirm: async () => {
        setConfirmConfig(prev => ({ ...prev, isLoading: true }));
        try {
          await inventoryService.deleteCustomUnit(id);
          toast.success('Unit deleted');
          fetchData();
        } catch (err) {
          toast.error('Failed to delete unit');
        } finally {
          setConfirmConfig(prev => ({ ...prev, open: false, isLoading: false }));
        }
      }
    });
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Ruler className="text-brand-400" />
          Units & Measurement
        </h1>
        <p className="text-slate-400 text-sm mt-1">Manage standard and custom units of measurement for your inventory.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Custom Units Management */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card overflow-hidden">
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <Ruler size={18} className="text-brand-400" />
                <h2 className="font-bold text-white">Custom Units</h2>
              </div>
              <button 
                onClick={() => setShowAddUnit(!showAddUnit)}
                className="btn-primary py-1.5 px-3 text-xs"
              >
                <Plus size={14} />
                Add Unit
              </button>
            </div>

            {showAddUnit && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="p-4 border-b border-white/5 bg-brand-500/5"
              >
                <form onSubmit={handleAddUnit} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Name</label>
                    <input 
                      type="text" required placeholder="e.g. Dozen"
                      className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                      value={newUnit.name}
                      onChange={e => setNewUnit(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Symbol</label>
                    <input 
                      type="text" required placeholder="e.g. doz"
                      className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                      value={newUnit.symbol}
                      onChange={e => setNewUnit(prev => ({ ...prev, symbol: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Type</label>
                    <select 
                      className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                      value={newUnit.unitType}
                      onChange={e => setNewUnit(prev => ({ ...prev, unitType: e.target.value as UnitType }))}
                    >
                      {Object.values(UnitType).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                      Factor
                      <div title="How many base units (e.g. grams/ml/count) in this unit?">
                        <Info size={10} className="text-slate-600" />
                      </div>
                    </label>
                    <input 
                      type="number" step="any" required
                      className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                      value={newUnit.conversionFactor}
                      onChange={e => setNewUnit(prev => ({ ...prev, conversionFactor: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="flex-1 btn-primary py-2 text-sm">Save</button>
                    <button type="button" onClick={() => setShowAddUnit(false)} className="btn-ghost py-2 text-sm">Cancel</button>
                  </div>
                </form>
              </motion.div>
            )}

            <div className="divide-y divide-white/5">
              {customUnits.length === 0 ? (
                <div className="p-8 text-center text-slate-500 italic text-sm">
                  No custom units defined yet.
                </div>
              ) : customUnits.map(unit => (
                <div key={unit.id} className="p-4 flex items-center justify-between group hover:bg-white/[0.01] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-brand-400 transition-colors">
                      <Hash size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{unit.name}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                        {unit.unitType} • {unit.symbol} • Factor: <span className="text-brand-400 font-bold">{unit.conversionFactor}</span>
                      </p>
                    </div>
                  </div>
                  {isTenant && (
                    <button 
                      onClick={() => handleDeleteUnit(unit.id)}
                      className="p-2 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-brand-500/5 border border-brand-500/10 rounded-2xl p-6 flex gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-400 shrink-0">
              <Info size={24} />
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-white">Understanding Units</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Units of measurement are the foundation of your inventory tracking. 
                **System Units** are universal (kg, L, g), while **Custom Units** allow you to 
                define business-specific measurements like "Sacks" or "Crates".
              </p>
            </div>
          </div>
        </div>

        {/* Right Col: System Units Reference */}
        <div className="space-y-6">
          <div className="glass-card overflow-hidden">
            <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center gap-2">
              <Layers size={18} className="text-slate-500" />
              <h2 className="font-bold text-white text-sm">System Units (ReadOnly)</h2>
            </div>
            <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto scrollbar-hide">
              {systemUnits.map(unit => (
                <div key={unit.id} className="p-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded bg-white/5 flex items-center justify-center text-[10px] font-bold text-slate-500">
                      {unit.symbol}
                    </div>
                    <span className="text-slate-300 font-medium">{unit.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 uppercase">{unit.unitType}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmConfig.open}
        onClose={() => setConfirmConfig(prev => ({ ...prev, open: false }))}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        isLoading={confirmConfig.isLoading}
      />
    </div>
  );
}
