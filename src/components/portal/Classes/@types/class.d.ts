export interface Class {
  id: number;
  externalId: string;
  name: string;
  isActive: boolean;
  students?: any[];
  subjectClasses?: any[];
}

export interface ClassFormValues {
  name: string;
}
