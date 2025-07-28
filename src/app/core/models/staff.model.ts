import { User } from "./user.model";

export interface Staff extends User {
  employeeId: string;
  department: Department;
  position: string;
  salary: number;
  hireDate: Date;
  workSchedule: WorkSchedule[];
  emergencyContact: EmergencyContact;
  isActive: boolean;
}

export interface Department {
  id: string;
  name: string;
  description: string;
}

export interface WorkSchedule {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  startTime: string;
  endTime: string;
  isWorkingDay: boolean;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}