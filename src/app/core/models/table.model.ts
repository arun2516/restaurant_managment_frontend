export interface Table {
  id: string;
  tableNumber: string;
  capacity: number;
  status: TableStatus;
  currentOrderId?: string;
  position: TablePosition;
  qrCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TablePosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export enum TableStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  RESERVED = 'reserved',
  CLEANING = 'cleaning',
  OUT_OF_ORDER = 'out_of_order'
}