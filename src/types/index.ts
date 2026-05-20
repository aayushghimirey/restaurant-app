// ── Auth ──────────────────────────────────────────
export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  userType: string;
  tenantId?: string;
  tenantName?: string;
  branchId?: string;
  branchName?: string;
}

// ── Business Detail ───────────────────────────────
export interface BusinessDetailResponse {
  id: string;
  businessName: string;
  address?: string;
  businessEmail?: string;
  businessPhone?: string;
  panNumber?: string;
}

export interface BusinessDetailRequest {
  businessName: string;
  address?: string;
  businessEmail?: string;
  businessPhone?: string;
  panNumber?: string;
}

// ── Pageable ──────────────────────────────────────
export interface Pageable {
  page: number;
  size: number;
  sort?: string[];
}

export interface PagedResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

// ── Tenant ────────────────────────────────────────
export interface TenantResponse {
  id: string;
  name: string;
  slug: string;
  status: string;
}

export interface CreateTenantRequest {
  name: string;
  slug: string;
  adminEmail: string;
  adminPassword: string;
}

export interface UpdateTenantRequest {
  name: string;
  status: string;
}

export interface TenantStatsResponse {
  totalTenants: number;
  activeTenants: number;
  inactiveTenants: number;
  suspendedTenants: number;
}


// ── Branch ────────────────────────────────────────
export interface BranchResponse {
  id: string;
  name: string;
  address?: string;
  tenantId: string;
  createdAt: string;
}

export interface CreateBranchRequest {
  name: string;
  address?: string;
}

// ── Role ──────────────────────────────────────────
export interface RoleResponse {
  id: string;
  name: string;
  description?: string;
  tenantId?: string;
  branchId?: string;
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
}

// ── Staff ─────────────────────────────────────────
export interface StaffResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  roleId?: string;
  roleName?: string;
}

export interface CreateStaffRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export interface UpdateStaffRequest {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  roleId?: string;
}

// ── Menu ──────────────────────────────────────────
export interface MenuCategoryResponse {
  id: string;
  name: string;
  description?: string;
}

export interface CreateMenuCategoryRequest {
  name: string;
  description?: string;
}

export interface MenuItemResponse {
  id: string;
  categoryId: string;
  categoryName: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
  isStockLinked: boolean;
}

export interface CreateMenuItemRequest {
  categoryId: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isStockLinked?: boolean;
}

export interface MenuRecipeResponse {
  id: string;
  stockItemId: string;
  stockItemName: string;
  baseUnitSymbol: string;
  quantity: number;
}

export interface CreateMenuRecipeRequest {
  stockItemId: string;
  quantity: number;
}

// ── Options ───────────────────────────────────────
export interface MenuOptionResponse {
  id: string;
  name: string;
  priceAdjustment: number;
  isAvailable: boolean;
  isStockLinked: boolean;
}

export interface CreateMenuOptionRequest {
  name: string;
  priceAdjustment: number;
}

// ── Table ─────────────────────────────────────────
export type TableStatus = 'AVAILABLE' | 'RESERVED' | 'DISABLED';

export interface TableResponse {
  id: string;
  name: string;
  capacity: number;
  location: string;
  tableStatus: TableStatus;
}

export interface CreateTableRequest {
  name: string;
  capacity: number;
  location: string;
}

export interface TableSummaryResponse {
  totalTables: number;
  reservedTables: number;
  availableTables: number;
  disabledTables: number;
}

// ── Order ─────────────────────────────────────────
export type OrderStatus = 'PENDING' | 'SERVED' | 'CANCELLED' | 'COMPLETED';

export interface OrderItemMenuOptionResponse {
  id: string;
  name: string;
  priceAdjustment: number;
}

export interface OrderItemResponse {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  options: OrderItemMenuOptionResponse[];
}

export interface OrderResponse {
  id: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  totalAmount: number;
  tableName?: string;
  tableId?: string;
  items: OrderItemResponse[];
}

export interface OrderItemRequest {
  menuItemId: string;
  menuOptionIds: string[];
  quantity: number;
}

export interface CreateOrderRequest {
  items: OrderItemRequest[];
  tableId?: string;
}

// ── Vendor ────────────────────────────────────────
export interface VendorResponse {
  id: string;
  name: string;
  address: string;
  contactNumber: string;
  panNumber: string;
}

export interface CreateVendorRequest {
  name: string;
  address: string;
  contactNumber: string;
  panNumber: string;
}

// ── Invoice ───────────────────────────────────────
export type InvoiceStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED';
export type PaymentMethod = 'CASH' | 'CARD' | 'FONEPAY' | 'OTHER';

export const DateFilter = {
  TODAY: 'TODAY',
  THIS_WEEK: 'THIS_WEEK',
  THIS_MONTH: 'THIS_MONTH',
} as const;

export type DateFilter = (typeof DateFilter)[keyof typeof DateFilter];

export interface InvoiceMenuItems {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface InvoiceResponse {
  invoiceId: string;
  status: InvoiceStatus;
  netTotal: number;
  discountAmount: number;
  grossTotal: number;
  tableId: string;
  orderId: string;
  tableName?: string;
  paymentMethod?: string;
  items: InvoiceMenuItems[];
}

export interface ProcessInvoiceRequest {
  id: string;
  discountAmount: number;
  paymentMethod: PaymentMethod;
}

export interface InvoiceSummaryResponse {
  totalInvoices: number;
  pendingInvoices: number;
  completedInvoices: number;
  cancelledInvoices: number;
  totalSales: number;
  totalDiscount: number;
  cashSales: number;
  cardSales: number;
  fonepaySales: number;
  otherSales: number;
}

