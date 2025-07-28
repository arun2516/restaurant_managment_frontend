export interface Reservation {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  partySize: number;
  reservationDate: Date;
  reservationTime: string;
  tableId?: string;
  status: ReservationStatus;
  specialRequests?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum ReservationStatus {
  CONFIRMED = 'confirmed',
  PENDING = 'pending',
  SEATED = 'seated',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show'
}