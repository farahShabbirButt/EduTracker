export interface Student {
  externalId: string;
  firstName: string;
  lastName: string;
  fatherName: string;
  rollNumber: string;
  email: string | null;
  contactNo: string | null;
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
}

export type StudentFormValues = {
  firstName: string;
  lastName: string;
  fatherName: string;
  rollNumber: string;
  classId: string; // Used for the select dropdown (externalId)
  contactNo?: string;
  email?: string;
  // Left out when the subject list isn't loaded, so saved electives aren't wiped
  electiveSubjectIds?: string[];
};
