export interface Student {
  id: number;
  externalId: string;
  firstName: string;
  lastName: string;
  fatherName: string;
  rollNumber: string;
  email?: string;
  contactNo?: string;
  classId: number;
  class?: {
    name: string;
    externalId: string;
  };
  subjects?: {
    externalId: string;
    name: string;
    subjectType: string;
    maxMarks: number;
  }[];
  isActive: boolean;
  createdAt: string;
}

export type StudentFormValues = {
  firstName: string;
  lastName: string;
  fatherName: string;
  rollNumber: string;
  classId: string; // Used for the select dropdown (externalId)
  contactNo?: string;
  email?: string;
};
