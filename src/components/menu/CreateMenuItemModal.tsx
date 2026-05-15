import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle, AlignLeft,
  Beer, CakeSlice,
  CheckCircle2,
  Coffee,
  Image as ImageIcon,
  Package,
  Pizza,
  Plus,
  Sandwich,
  Save,
  Upload, Utensils,
  X
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { type FieldErrors, type UseFormRegister, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { fileService } from '../../services/fileService';
import { menuService } from '../../services/menuService';
import { DEFAULT_MENU_IMAGE } from '../../lib/utils';
import type {
  CreateMenuItemRequest,
  MenuCategoryResponse,
  MenuItemResponse,
} from '../../types';
import { Spinner } from '../ui/Feedback';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categories: MenuCategoryResponse[];
  editingItem?: MenuItemResponse | null;
  onSubmit: (data: CreateMenuItemRequest) => Promise<void>;
}

const categoryIcons: Record<string, any> = {
  Drinks: Coffee, Beverages: Beer, Pizza: Pizza, Main: Utensils,
  Starters: Utensils, Desserts: CakeSlice, Snacks: Sandwich,
};

// --- Sub-components for better modularity ---

const CategorySelector = ({
  categories, watchedCategoryId, setValue, errors, newCatName,
  setNewCatName, showAddCategory, setShowAddCategory, handleCreateCategory
}: any) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div>
        <label className="text-sm font-semibold text-slate-400">
          Category <span className="text-brand-400">*</span>
        </label>
        <p className="text-xs text-slate-500 mt-0.5">Select a category for your menu item</p>
      </div>
      <button
        type="button"
        onClick={() => setShowAddCategory(!showAddCategory)}
        className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1.5 transition-colors"
      >
        {showAddCategory ? <><X size={14} /> Cancel</> : <><Plus size={14} /> New Category</>}
      </button>
    </div>

    <AnimatePresence>
      {showAddCategory && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          <div className="flex gap-2 p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
            <input
              className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 flex-1"
              placeholder="Enter category name"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateCategory()}
              autoFocus
            />
            <button
              type="button"
              onClick={handleCreateCategory}
              disabled={!newCatName.trim()}
              className="btn-primary px-5 h-11 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-h-48 overflow-y-auto pr-2">
      {categories.map((cat: any) => {
        const Icon = categoryIcons[cat.name] || Utensils;
        const isSelected = watchedCategoryId === cat.id;

        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => setValue('categoryId', cat.id)}
            className={`relative group rounded-xl p-4 flex flex-col items-center gap-2.5 transition-all duration-200 ${isSelected ? 'bg-brand-500/15 border-2 border-brand-400 shadow-lg shadow-brand-500/10'
              : 'bg-slate-800/50 border border-white/10 hover:border-brand-500/50 hover:bg-slate-800/80'
              }`}
          >
            <Icon size={22} className={isSelected ? 'text-brand-400' : 'text-slate-400 group-hover:text-slate-300'} />
            <span className={`text-sm font-medium ${isSelected ? 'text-brand-300' : 'text-slate-300'}`}>{cat.name}</span>
            {isSelected && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-brand-400 rounded-full flex items-center justify-center">
                <CheckCircle2 size={10} className="text-slate-900" />
              </div>
            )}
          </button>
        );
      })}
    </div>

    {errors.categoryId && (
      <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">
        <AlertCircle size={14} /><span>{errors.categoryId.message}</span>
      </div>
    )}
  </div>
);

const BasicInfoFields = ({ register, errors }: { register: UseFormRegister<CreateMenuItemRequest>, errors: FieldErrors<CreateMenuItemRequest> }) => (
  <div className="space-y-4">
    <div>
      <h3 className="text-sm font-semibold text-slate-400">Basic Information</h3>
      <p className="text-xs text-slate-500">Essential details about your menu item</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-400">Item Name <span className="text-brand-400">*</span></label>
        <input
          {...register('name', { required: 'Item name is required', minLength: { value: 2, message: 'Min 2 chars' } })}
          className={`w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 ${errors.name ? 'border-red-500' : ''}`}
          placeholder="e.g., Grilled Chicken Burger"
        />
        {errors.name && <p className="text-xs text-red-400 flex items-center gap-1"><AlertCircle size={12} />{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-400">Price <span className="text-brand-400">*</span></label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">Rs.</span>
          <input
            type="number" step="0.01"
            {...register('price', { required: 'Price is required', valueAsNumber: true, min: { value: 0, message: 'Cannot be negative' } })}
            className={`w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2.5 pl-12 text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 ${errors.price ? 'border-red-500' : ''}`}
            placeholder="0.00"
          />
        </div>
        {errors.price && <p className="text-xs text-red-400 flex items-center gap-1"><AlertCircle size={12} />{errors.price.message}</p>}
      </div>
    </div>

    <div className="space-y-2">
      <label className="text-sm font-semibold text-slate-400">Description</label>
      <div className="relative">
        <AlignLeft className="absolute left-4 top-3.5 text-slate-400" size={16} />
        <textarea
          {...register('description')}
          className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2.5 pl-12 text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 min-h-[100px] resize-none"
          placeholder="Describe the dish, ingredients, and flavor profile..."
        />
      </div>
    </div>
  </div>
);

const ImageUploadArea = ({ imageUrl, handleRemoveImage, handleFileUpload, uploading, setImageError }: any) => (
  <div className="space-y-3">
    <div>
      <h3 className="text-sm font-semibold text-slate-400">Item Image</h3>
    </div>
    <div className="border-2 border-dashed border-white/10 rounded-xl p-4 bg-slate-800/50 transition-all flex items-center gap-4">
      {imageUrl ? (
        <>
          <div className="relative group w-20 h-20 shrink-0">
            <div className="w-full h-full rounded-lg overflow-hidden bg-slate-800 border border-white/10">
              <img src={imageUrl} alt="Menu item" className="w-full h-full object-cover" onError={() => setImageError(true)} onLoad={() => setImageError(false)} />
            </div>
            <button type="button" onClick={handleRemoveImage} className="absolute -top-2 -right-2 p-1.5 bg-red-600 hover:bg-red-500 rounded-full transition-all opacity-0 group-hover:opacity-100 shadow-lg">
              <X size={12} className="text-white" />
            </button>
          </div>
          <div className="flex-1">
            <label htmlFor="media-upload" className="btn-secondary h-9 px-4 text-xs cursor-pointer inline-flex items-center">Change Image</label>
          </div>
        </>
      ) : (
        <>
          <div className="w-12 h-12 shrink-0 rounded-lg bg-slate-800 overflow-hidden border border-white/5 relative group">
            <img src={DEFAULT_MENU_IMAGE} className="w-full h-full object-cover opacity-30 group-hover:opacity-50 transition-opacity" alt="Default" />
            <div className="absolute inset-0 flex items-center justify-center text-slate-500">
              <ImageIcon size={20} />
            </div>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-white">Upload Image</h4>
            <p className="text-[10px] text-slate-400">PNG, JPG, or WEBP (Max 5MB)</p>
          </div>
          <label htmlFor="media-upload" className="btn-primary h-9 px-4 text-xs cursor-pointer flex items-center gap-2 shrink-0">
            {uploading ? <Spinner /> : <Upload size={14} />}
            {uploading ? 'Uploading...' : 'Choose File'}
          </label>
        </>
      )}
      <input type="file" id="media-upload" className="hidden" accept="image/jpeg,image/png,image/webp" onChange={handleFileUpload} disabled={uploading} />
    </div>
  </div>
);

// --- Main Component ---

export default function CreateMenuItemModal({
  isOpen, onClose, onSuccess, categories: initialCategories, editingItem, onSubmit,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState(initialCategories);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [imageError, setImageError] = useState(false);
  const [activeTab, setActiveTab] = useState<'BASE' | 'MEDIA' | 'ADVANCED'>('BASE');

  const { register, handleSubmit, watch, setValue, reset, formState: { isSubmitting, errors } } = useForm<CreateMenuItemRequest>({
    defaultValues: { isStockLinked: true, price: 0 },
  });

  const watchedValues = watch();
  const imageUrl = watch('imageUrl');

  useEffect(() => {
    if (isOpen) {
      reset(editingItem ? {
        name: editingItem.name, description: editingItem.description || '', price: Number(editingItem.price),
        categoryId: editingItem.categoryId, imageUrl: editingItem.imageUrl || '', isStockLinked: editingItem.isStockLinked ?? true,
      } : {
        name: '', description: '', price: 0, categoryId: '', imageUrl: '', isStockLinked: true,
      });
      setImageError(false);
    }
  }, [isOpen, editingItem, reset]);

  useEffect(() => setCategories(initialCategories), [initialCategories]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast.error('Image size should be less than 5MB');
    if (!file.type.startsWith('image/')) return toast.error('Please upload a valid image file');

    setUploading(true);
    try {
      const res = await fileService.upload(file);
      if (res.success && res.data) {
        setValue('imageUrl', res.data as string);
        setImageError(false);
        toast.success('Image uploaded successfully');
      }
    } catch { toast.error('Upload failed. Please try again.'); }
    finally { setUploading(false); }
  };

  const handleCreateCategory = async () => {
    if (!newCatName.trim()) return;
    try {
      const res = await menuService.createCategory({ name: newCatName });
      if (res.success && res.data) {
        setCategories([...categories, res.data]);
        setValue('categoryId', res.data.id);
        setNewCatName('');
        setShowAddCategory(false);
        toast.success('Category created successfully');
      }
    } catch { toast.error('Failed to create category'); }
  };

  const onFormSubmit = async (data: CreateMenuItemRequest) => {
    try {
      await onSubmit(data);
      onSuccess();
      onClose();
    } catch { /* Error handling done by parent */ }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl glass-card border-white/10 shadow-2xl p-8 bg-slate-900 max-h-[90vh] flex flex-col"
          >
            <div className="flex items-center justify-between mb-8 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center text-brand-400 border border-brand-500/20">
                  <Utensils size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white tracking-tight">{editingItem ? 'Update Dish' : 'New Creation'}</h2>
                  <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Menu Engineering Studio</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl text-slate-500 transition-all active:scale-95">
                <X size={20} />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center gap-1 bg-slate-800/50 p-1 rounded-2xl mb-8 shrink-0 border border-white/5">
              {[
                { id: 'BASE', label: 'Configuration', icon: Utensils },
                { id: 'MEDIA', label: 'Visuals', icon: ImageIcon },
                { id: 'ADVANCED', label: 'Inventory', icon: CheckCircle2 }
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    activeTab === tab.id ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <tab.icon size={14} />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                <div className="lg:col-span-3">
                  <form id="menu-form" onSubmit={handleSubmit(onFormSubmit)} className="space-y-8 pb-10">
                    <AnimatePresence mode="wait">
                      {activeTab === 'BASE' && (
                        <motion.div key="base" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-8">
                          <CategorySelector
                            categories={categories} watchedCategoryId={watchedValues.categoryId}
                            setValue={setValue} errors={errors} newCatName={newCatName} setNewCatName={setNewCatName}
                            showAddCategory={showAddCategory} setShowAddCategory={setShowAddCategory} handleCreateCategory={handleCreateCategory}
                          />
                          <div className="h-px w-full bg-slate-800/50" />
                          <BasicInfoFields register={register} errors={errors} />
                        </motion.div>
                      )}
                      {activeTab === 'MEDIA' && (
                        <motion.div key="media" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                          <ImageUploadArea
                            imageUrl={imageUrl} handleRemoveImage={() => { setValue('imageUrl', ''); setImageError(false); }}
                            handleFileUpload={handleFileUpload} uploading={uploading} setImageError={setImageError}
                          />
                        </motion.div>
                      )}
                      {activeTab === 'ADVANCED' && (
                        <motion.div key="advanced" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-6">
                           <div className="p-6 rounded-3xl bg-slate-800/30 border border-white/5 space-y-4">
                              <div className="flex items-center gap-3 text-amber-400">
                                <AlertCircle size={20} />
                                <h3 className="text-sm font-bold uppercase tracking-wider">Inventory Hook</h3>
                              </div>
                              <p className="text-xs text-slate-500 leading-relaxed">
                                Link this item to your inventory registry to automatically deduct ingredients upon sale.
                              </p>
                              <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-2xl border border-white/5">
                                 <div className="flex flex-col">
                                    <span className="text-xs font-bold text-white">Stock Synchronizer</span>
                                    <span className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-tighter">Automatic Deduction per Order</span>
                                 </div>
                                 <input type="checkbox" checked={watchedValues.isStockLinked} onChange={e => setValue('isStockLinked', e.target.checked)} className="w-10 h-5 accent-brand-500" />
                              </div>
                           </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </form>
                </div>

                <div className="lg:col-span-2 hidden lg:block sticky top-0">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-1">Live Manifest</h4>
                    <div className="glass-card overflow-hidden border-white/10 shadow-2xl">
                       <div className="aspect-video bg-slate-800 relative overflow-hidden">
                          <img src={imageUrl || DEFAULT_MENU_IMAGE} className="w-full h-full object-cover" />
                          <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-white text-[8px] font-bold uppercase tracking-wider border border-white/5">
                            Preview Only
                          </div>
                       </div>
                       <div className="p-4 space-y-2 bg-slate-900">
                          <h3 className="font-bold text-white text-base truncate">{watchedValues.name || 'Untitled Creation'}</h3>
                          <p className="text-slate-500 text-xs line-clamp-2 min-h-[2.5rem] leading-relaxed">
                            {watchedValues.description || 'Provide a compelling description to attract customers...'}
                          </p>
                          <div className="flex items-center justify-between pt-4 border-t border-white/5">
                             <span className="text-brand-400 font-black text-lg">Rs.{Number(watchedValues.price || 0).toLocaleString()}</span>
                             <div className="flex gap-1.5">
                                <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-slate-600"><Utensils size={12} /></div>
                                <div className={`w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center ${watchedValues.isStockLinked ? 'text-emerald-500' : 'text-slate-600'}`}><Package size={12} /></div>
                             </div>
                          </div>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-6 shrink-0 border-t border-white/5 mt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 btn-ghost py-3"
              >
                Cancel
              </button>
              <button
                form="menu-form"
                type="submit"
                disabled={isSubmitting}
                className="flex-[2] btn-primary py-3 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Spinner size={18} />
                    {editingItem ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    {editingItem ? 'Update Menu Item' : 'Create Menu Item'}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}