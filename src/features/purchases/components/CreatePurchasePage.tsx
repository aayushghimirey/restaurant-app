import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CreatePurchaseForm from './CreatePurchaseForm';

export default function CreatePurchasePage() {
  const navigate = useNavigate();

  return (
    <div className="p-6 md:p-8 space-y-10 animate-in max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <Button variant="ghost" size="icon" onClick={() => navigate('/purchases')} className="h-8 w-8 rounded-full border border-border hover:bg-muted/50 transition-all">
                <ArrowLeft className="h-4 w-4" />
             </Button>
            <h2 className="text-3xl font-black tracking-tight text-foreground">Draft Purchase</h2>
            <div className="h-6 w-[1px] bg-border hidden md:block" />
          </div>
          <p className="text-muted-foreground text-sm font-medium flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" /> Initialize vendor inventory acquisitions below. Changes are saved automatically.
          </p>
        </div>
      </div>
      
      <div className="bg-card border border-border p-6 md:p-10 rounded-2xl shadow-sm mb-8">
        <CreatePurchaseForm onSuccess={() => navigate('/purchases')} onCancel={() => navigate('/purchases')} />
      </div>
    </div>
  );
}
