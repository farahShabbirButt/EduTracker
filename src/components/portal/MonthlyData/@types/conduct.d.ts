// Real `PUT/GET /conduct/student/:externalId` shapes (Task 5, edutracker-backend
// ConductService). Values must match the backend enum exactly — an unrecognised
// value is rejected with a 400 listing the valid ones.
export enum ConductRating {
  EXCELLENT = 'EXCELLENT',
  VERY_GOOD = 'VERY_GOOD',
  GOOD = 'GOOD',
  SATISFACTORY = 'SATISFACTORY',
  UNSATISFACTORY = 'UNSATISFACTORY',
}

// The school's own wording for the printed result card (e.g. "Behaviour:
// Excellent") — not the raw enum names.
export const CONDUCT_RATING_OPTIONS: { value: ConductRating; label: string }[] =
  [
    { value: ConductRating.EXCELLENT, label: 'Excellent' },
    { value: ConductRating.VERY_GOOD, label: 'Very Good' },
    { value: ConductRating.GOOD, label: 'Good' },
    { value: ConductRating.SATISFACTORY, label: 'Satisfactory' },
    { value: ConductRating.UNSATISFACTORY, label: 'Un-Satisfactory' },
  ];

// GET /conduct/student/:externalId returns this record, or `null` (HTTP 200)
// when nothing has been recorded yet for that month/year — that's the normal
// "not set" state, not an error.
export type ApiConduct = {
  externalId: string;
  studentExternalId: string;
  month: number;
  year: number;
  behaviour: ConductRating;
  uniformCleanliness: ConductRating;
};

export type ConductFormValues = {
  month: number;
  year: number;
  behaviour: ConductRating;
  uniformCleanliness: ConductRating;
};
