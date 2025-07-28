export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  currentStock: number;
  minimumStock: number;
  maximumStock: number;
  unitCost: number;
  supplier: string;
  expiryDate?: Date;
  lastUpdated: Date;
  isActive: boolean;
}

export interface StockTransaction {
  id: string;
  inventoryItemId: string;
  type: TransactionType;
  quantity: number;
  unitCost: number;
  totalCost: number;
  reason: string;
  performedBy: string;
  createdAt: Date;
}

export enum TransactionType {
  STOCK_IN = 'stock_in',
  STOCK_OUT = 'stock_out',
  ADJUSTMENT = 'adjustment',
  WASTE = 'waste'
}