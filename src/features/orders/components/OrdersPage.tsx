import { useState } from 'react';
import { Plus, LayoutGrid, RotateCcw, Table as TableIcon } from 'lucide-react';
import { useTables, useCreateTable, useOrderWebSocket } from '../api';
import { useInvoiceWebSocket } from '@/features/invoices/api/websockets/useInvoiceWebSocket';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TableGrid } from './TableGrid';
import { OrderBuilder } from './OrderBuilder';
import { SkeletonCard } from "@/components/ui/SkeletonCard";

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
  const [isAddingTable, setIsAddingTable] = useState(false);
  const [activeTableId, setActiveTableId] = useState<string | null>(null);
  useOrderWebSocket();
  useInvoiceWebSocket();

  const activeTable = tables?.find(t => t.id === activeTableId);

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
            {activeTableId ? (
              <div className="bg-card border border-border/50 shadow-2xl rounded-[2rem] animate-in fade-in slide-in-from-bottom-4 relative overflow-hidden min-h-[500px] flex flex-col">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 border-b border-border bg-muted/20 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20">
                      <TableIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold tracking-tight">Process Table Order</h3>
                      <p className="text-muted-foreground text-sm font-medium mt-0.5 flex items-center gap-2">
                        Editing <span className="text-primary font-bold">{activeTable?.name}</span>
                        <span className="opacity-30">•</span> {activeTable?.location}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="rounded-full px-6 font-semibold"
                    onClick={() => setActiveTableId(null)}
                  >
                    Close Order
                  </Button>
                </div>
                <OrderBuilder
                  tableId={activeTableId}
                  tableName={activeTable?.name || ""}
                  onComplete={() => setActiveTableId(null)}
                />
              </div>
            ) : (
              <div className="h-[400px] flex flex-col items-center justify-center text-center bg-muted/30 border-2 border-dashed border-border rounded-[2rem]">
                <div className="p-6 rounded-full bg-background shadow-sm border border-border mb-5">
                  <LayoutGrid className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <h4 className="text-lg font-bold tracking-tight mb-2">Interactive Floor Plan</h4>
                <p className="text-muted-foreground text-sm font-medium max-w-sm">
                  Select a table from above to start creating or modifying its active order payload.
                </p>
              </div>
            )}
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
