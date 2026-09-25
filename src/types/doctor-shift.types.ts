export interface DoctorShift {
  id: string;
  doctorId: string;
  workDate: string;
  startTime: string;
  endTime: string;
  doctor?: {
    id: string;
    user?: { fullName?: string };
    specialty?: { name?: string };
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateDoctorShiftDto {
  workDate: string;
  startTime: string;
  endTime: string;
}