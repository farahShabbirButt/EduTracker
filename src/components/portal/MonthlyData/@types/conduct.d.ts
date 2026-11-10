// Values must match the backend enum exactly
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
