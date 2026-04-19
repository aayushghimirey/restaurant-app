import { useState, useEffect } from 'react';
import { Plus, Users, MapPin, AlertCircle, CheckCircle, Pencil, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useVendors, useCreateVendor, useUpdateVendor } from '../api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/Dialog';
import { Vendor, UpdateVendorPayload } from '../types';

// ─── Schema ────────────────────────────────────────────────────────────────────

const vendorSchema = z.object({
  name: z.string().min(2, 'Company name must be at least 2 characters'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  contactNumber: z
    .string()
    .regex(/^\+?[0-9\s]{7,15}$/, 'Invalid phone number format'),
  panNumber: z.string().min(5, 'Invalid PAN / Tax ID'),
});

type VendorFormValues = z.infer<typeof vendorSchema>;

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
}

// ─── Shared form fields ────────────────────────────────────────────────────────

interface VendorFieldsProps {
  register: ReturnType<typeof useForm<VendorFormValues>>['register'];
  errors: ReturnType<typeof useForm<VendorFormValues>>['formState']['errors'];
}

function VendorFields({ register, errors }: VendorFieldsProps) {
  return (
    <>
      {/* Company details */}
      <div className="space-y-4">
        <p className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground">
          Company details
        </p>

        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-sm font-medium">Company name</Label>
          <Input
            id="name"
            {...register('name')}
            placeholder="Full legal company name"
            className={cn('h-10 rounded-lg text-sm', errors.name && 'border-destructive focus-visible:ring-destructive/30')}
          />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="address" className="text-sm font-medium">Address</Label>
          <Input
            id="address"
            {...register('address')}
            placeholder="Corporate office address"
            className={cn('h-10 rounded-lg text-sm', errors.address && 'border-destructive focus-visible:ring-destructive/30')}
          />
          {errors.address && <p className="text-xs text-destructive">{errors.address.message}</p>}
        </div>
      </div>

      <div className="border-t border-border" />

      {/* Contact & tax */}
      <div className="space-y-4">
        <p className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground">
          Contact &amp; tax
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="contactNumber" className="text-sm font-medium">Phone number</Label>
            <Input
              id="contactNumber"
              type="tel"
              {...register('contactNumber')}
              placeholder="+977 981-XXXXXXX"
              className={cn('h-10 rounded-lg text-sm', errors.contactNumber && 'border-destructive focus-visible:ring-destructive/30')}
            />
            {errors.contactNumber && <p className="text-xs text-destructive">{errors.contactNumber.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="panNumber" className="text-sm font-medium">Tax ID (PAN)</Label>
            <Input
              id="panNumber"
              {...register('panNumber')}
              placeholder="ABCDE1234F"
              className={cn('h-10 rounded-lg text-sm font-mono', errors.panNumber && 'border-destructive focus-visible:ring-destructive/30')}
            />
            {errors.panNumber && <p className="text-xs text-destructive">{errors.panNumber.message}</p>}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function VendorsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [size] = useState(10);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => setSearchTerm(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: pagedData, isLoading, error } = useVendors({
    name: searchTerm || undefined,
    page,
    size
  });

  const vendors = pagedData?.data || [];
  const totalElements = pagedData?.totalElements || 0;
  const totalPages = pagedData?.totalPages || 0;

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);

  return (
    <div className="min-h-screen p-6 md:p-8 animate-in max-w-[1200px] mx-auto space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-foreground">Vendors</h1>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full border border-border">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {totalElements} partners
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your supply chain partners and their details.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search vendors..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(0); // Reset to first page on search
              }}
              className="pl-9 h-10 rounded-lg text-sm bg-muted/50 border-border focus:bg-background transition-all"
            />
          </div>

          {/* Create dialog */}
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="h-10 px-5 gap-2 text-sm font-medium rounded-lg">
                <Plus className="h-4 w-4" />
                Add vendor
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold">Add vendor</DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  Register a new supplier to your organization.
                </DialogDescription>
              </DialogHeader>
              <CreateVendorForm onSuccess={() => setIsCreateOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Edit dialog — opened by clicking Edit on a row */}
      <Dialog
        open={!!editingVendor}
        onOpenChange={(open) => { if (!open) setEditingVendor(null); }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Edit vendor</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Update the details for{' '}
              <span className="font-medium text-foreground">{editingVendor?.name}</span>.
            </DialogDescription>
          </DialogHeader>
          {/* Only mount the form when a vendor is selected so defaultValues are fresh */}
          {editingVendor && (
            <EditVendorForm
              vendor={editingVendor}
              onSuccess={() => setEditingVendor(null)}
              onCancel={() => setEditingVendor(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Body */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : error ? (
        <EmptyState
          icon={AlertCircle}
          title="Could not load vendors"
          description="Unable to fetch your partner list. Check your connection and try again."
        />
      ) : !vendors?.length ? (
        <EmptyState
          icon={Users}
          title="No vendors yet"
          description="Add your first supplier to get started."
        />
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-5 py-3 text-xs font-medium text-muted-foreground">Vendor</th>
                  <th className="px-5 py-3 text-xs font-medium text-muted-foreground">Address</th>
                  <th className="px-5 py-3 text-xs font-medium text-muted-foreground">Phone</th>
                  <th className="px-5 py-3 text-xs font-medium text-muted-foreground text-right">Tax ID (PAN)</th>
                  <th className="px-5 py-3 text-xs font-medium text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {vendors.map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-muted/30 transition-colors">

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                          {getInitials(vendor.name)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground leading-tight">{vendor.name}</p>
                          <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                            {vendor.id.substring(0, 8).toUpperCase()}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
                        {vendor.address}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <span className="h-2 w-2 rounded-full bg-emerald-500/70" />
                        {vendor.contactNumber}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <span className="inline-block font-mono text-xs bg-muted text-foreground border border-border px-2.5 py-1 rounded-md">
                        {vendor.panNumber}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-3 gap-1.5 rounded-md text-muted-foreground hover:text-foreground"
                        onClick={() => setEditingVendor(vendor)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-5 py-4 border-t border-border bg-muted/20 flex items-center justify-between gap-4">
              <p className="text-xs text-muted-foreground">
                Showing page <span className="font-semibold text-foreground">{page + 1}</span> of <span className="font-semibold text-foreground">{totalPages}</span>
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-lg border-border"
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-lg border-border"
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Create Vendor Form ────────────────────────────────────────────────────────

interface CreateVendorFormProps {
  onSuccess: () => void;
}

function CreateVendorForm({ onSuccess }: CreateVendorFormProps) {
  const mutation = useCreateVendor();

  const { register, handleSubmit, formState: { errors } } = useForm<VendorFormValues>({
    resolver: zodResolver(vendorSchema),
  });

  const onSubmit = (data: VendorFormValues) => {
    mutation.mutate(data, { onSuccess });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-2" noValidate>
      <VendorFields register={register} errors={errors} />

      {mutation.error && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          Something went wrong. Please try again.
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" className="h-10 px-4 text-sm rounded-lg" onClick={onSuccess}>
          Cancel
        </Button>
        <Button type="submit" className="h-10 px-5 text-sm rounded-lg gap-2" disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving...' : <><CheckCircle className="h-4 w-4" />Save vendor</>}
        </Button>
      </div>
    </form>
  );
}

// ─── Edit Vendor Form ──────────────────────────────────────────────────────────

interface EditVendorFormProps {
  vendor: Vendor;
  onSuccess: () => void;
  onCancel: () => void;
}

function EditVendorForm({ vendor, onSuccess, onCancel }: EditVendorFormProps) {
  const mutation = useUpdateVendor();

  const { register, handleSubmit, formState: { errors } } = useForm<VendorFormValues>({
    resolver: zodResolver(vendorSchema),
    // Pre-populate all fields with the existing vendor data
    defaultValues: {
      name: vendor.name,
      address: vendor.address,
      contactNumber: vendor.contactNumber,
      panNumber: vendor.panNumber,
    },
  });

  const onSubmit = (data: VendorFormValues) => {
    mutation.mutate(
      { vendorId: vendor.id, payload: data as UpdateVendorPayload },
      { onSuccess },
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-2" noValidate>
      <VendorFields register={register} errors={errors} />

      {mutation.error && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          Something went wrong. Please try again.
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" className="h-10 px-4 text-sm rounded-lg" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="h-10 px-5 text-sm rounded-lg gap-2" disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving...' : <><CheckCircle className="h-4 w-4" />Save changes</>}
        </Button>
      </div>
    </form>
  );
}