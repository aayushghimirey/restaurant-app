import { useState } from 'react';
import { Plus, LayoutGrid, RotateCcw, Table as TableIcon } from 'lucide-react';
import { useTables, useCreateTable, useReservations } from '../api';
import { useMenus } from '@/features/menus/api';
import { ReservationStatus } from '@/types/reservations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TableGrid } from './TableGrid';
import { OrderBuilder } from './OrderBuilder';
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { motion, AnimatePresence } from 'framer-motion';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";

export default function OrdersPage() {
  const { data: tables, isLoading: loadingTables } = useTables();
  const { data: pendingRes } = useReservations(ReservationStatus.PENDING);
  const { data: updatedRes } = useReservations(ReservationStatus.UPDATED);
  const { data: menusData } = useMenus({ size: 500 });
  
  const [isAddingTable, setIsAddingTable] = useState(false);
  const [activeTableId, setActiveTableId] = useState<string | null>(null);
  


  const activeTable = tables?.find(t => t.id === activeTableId);
  
  // Combine all active reservations (Pending + Updated)
  const activeReservations = [
    ...(pendingRes?.data || []),
    ...(updatedRes?.data || [])
  ];
  
  const activeRes = activeReservations.find(r => r.tableId === activeTableId);
  const menus = menusData?.data || [];

  return (
    <div className="p-6 md:p-8 space-y-8 animate-in max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Floor Plan</h2>
            <div className="h-6 w-[1px] bg-border hidden md:block" />
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground bg-muted px-2.5 py-1 rounded-md">
              <TableIcon className="h-4 w-4 text-primary" />
              {tables?.length || 0} Tables
            </div>
          </div>
          <p className="text-muted-foreground text-sm flex items-center gap-2">
            Real-time table status and order management.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Dialog open={isAddingTable} onOpenChange={setIsAddingTable}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="h-10 rounded-lg bg-background"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Table
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-card border-border shadow-2xl rounded-3xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3" />
              <div className="p-8 relative">
                <DialogHeader className="mb-8 space-y-1.5">
                  <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                       <Plus className="h-4 w-4" />
                    </div>
                    New Table Setup
                  </DialogTitle>
                  <DialogDescription className="text-sm font-medium text-muted-foreground">
                    Deploy a new physical or virtual table to the floor plan.
                  </DialogDescription>
                </DialogHeader>
                <CreateTableForm onSuccess={() => setIsAddingTable(false)} />
              </div>
            </DialogContent>
          </Dialog>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 border border-border rounded-lg hover:bg-muted"
            onClick={() => window.location.reload()}
          >
            <RotateCcw className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </div>

      {loadingTables ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 4, 5].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="space-y-10">
          <section className="space-y-4">
            <TableGrid
              tables={tables}
              activeTableId={activeTableId}
              onTableSelect={setActiveTableId}
            />
          </section>

          <section className="space-y-4">
          <AnimatePresence mode="wait">
            {activeTableId ? (
              <motion.div 
                key="order-builder"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                className="bg-card border border-border/50 shadow-2xl rounded-[2.5rem] relative overflow-hidden min-h-[600px] flex flex-col"
              >
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-primary/3 rounded-full blur-[80px] pointer-events-none translate-y-1/2 -translate-x-1/2" />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-8 border-b border-border bg-background/50 backdrop-blur-xl relative z-10">
                  <div className="flex items-center gap-5">
                    <div className="h-14 w-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-xl shadow-primary/20 rotate-3 group-hover:rotate-0 transition-transform">
                      <TableIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black tracking-tight text-foreground">
                        {activeRes ? 'Modify Active Order' : 'Create New Order'}
                      </h3>
                      <p className="text-muted-foreground text-[11px] font-black uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
                        Station: <span className="text-primary">{activeTable?.name}</span>
                        <span className="h-1 w-1 rounded-full bg-border" /> 
                        {activeTable?.location}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="rounded-xl px-8 h-12 font-black text-[10px] uppercase tracking-widest border-border hover:bg-muted hover:text-foreground transition-all shadow-sm"
                    onClick={() => setActiveTableId(null)}
                  >
                    Cancel Session
                  </Button>
                </div>

                <div className="flex-1 relative z-10">
                  <OrderBuilder
                    key={`${activeTableId}-${activeRes?.sessionId || 'new'}-${activeRes?.items?.length || 0}`}
                    tableId={activeTableId}
                    tableName={activeTable?.name || ""}
                    sessionId={activeRes?.sessionId}
                    initialItems={activeRes?.items.map(item => {
                      const menu = menus.find(m => m.id === item.menuItemId);
                      return {
                        menuId: item.menuItemId,
                        name: menu?.name || "Unknown Item",
                        price: item.price,
                        quantity: item.quantity
                      };
                    })}
                    onComplete={() => setActiveTableId(null)}
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="empty-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-[500px] flex flex-col items-center justify-center text-center bg-muted/20 border-2 border-dashed border-border/50 rounded-[3rem] relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--primary-muted)_0%,transparent_100%)] opacity-20 pointer-events-none" />
                <div className="p-8 rounded-[2rem] bg-background shadow-xl border border-border mb-8 group-hover:scale-110 transition-transform duration-500">
                  <LayoutGrid className="h-10 w-10 text-primary/40" />
                </div>
                <h4 className="text-xl font-black tracking-tight mb-3 text-foreground uppercase tracking-widest">Interactive Floor Manager</h4>
                <p className="text-muted-foreground text-xs font-bold max-w-sm leading-relaxed opacity-60">
                  Real-time command center. Select an available or reserved table above to begin transaction processing.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          </section>
        </div>
      )}
    </div>
  );
}

function CreateTableForm({ onSuccess }: { onSuccess: () => void }) {
  const mutation = useCreateTable();
  const [formData, setFormData] = useState({ name: '', location: '', capacity: 2 });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData, { onSuccess });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-5">
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Table Identifier</Label>
          <Input
            className="h-12 bg-muted/50 border-transparent focus-visible:bg-background focus-visible:border-primary/50 focus-visible:ring-primary/20 rounded-xl px-4 font-semibold transition-all"
            placeholder="e.g. T-01"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Location</Label>
            <Input
              className="h-12 bg-muted/50 border-transparent focus-visible:bg-background focus-visible:border-primary/50 focus-visible:ring-primary/20 rounded-xl px-4 font-semibold transition-all"
              placeholder="e.g. Balcony"
              value={formData.location}
              onChange={e => setFormData({ ...formData, location: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Capacity</Label>
            <Input
              className="h-12 bg-muted/50 border-transparent focus-visible:bg-background focus-visible:border-primary/50 focus-visible:ring-primary/20 rounded-xl px-4 font-semibold transition-all"
              type="number"
              min="1"
              value={formData.capacity}
              onChange={e => setFormData({ ...formData, capacity: Number(e.target.value) })}
              required
            />
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-6 border-t border-border mt-8">
        <Button
          type="button"
          variant="ghost"
          className="h-12 rounded-xl px-6 font-semibold hover:bg-muted"
          onClick={onSuccess}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="h-12 rounded-xl px-8 font-bold shadow-lg shadow-primary/20"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? 'Saving...' : 'Deploy Table'}
        </Button>
      </div>
    </form>
  )
}
