export interface DoctorRating {
  id?: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  rating: number;
  feedback: string;
  comment?: string;
  date: string;
  doctorName: string;
  patientName: string;
  createdAt?: string;
}
