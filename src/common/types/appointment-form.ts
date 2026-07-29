export type AppointmentFormPatient = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string | null;
};

export type AppointmentFormDoctor = {
  id: string;
  branchId: string;
  user: {
    firstName: string;
    lastName: string;
  };
};

export type AppointmentFormService = {
  id: string;
  name: string;
  durationMinutes: number;
};

export type AppointmentFormBranch = {
  id: string;
  name: string;
};

export type AppointmentFormOptions = {
  patients: AppointmentFormPatient[];
  doctors: AppointmentFormDoctor[];
  services: AppointmentFormService[];
  branches: AppointmentFormBranch[];
};

export type CreateAppointmentPayload = {
  patientId: string;
  doctorProfileId: string;
  serviceId: string;
  branchId: string;
  startsAt: string;
  durationMinutes: number;
  comment?: string;
};
