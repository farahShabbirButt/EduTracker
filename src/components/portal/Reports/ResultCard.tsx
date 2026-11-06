import { forwardRef } from 'react';
import type { CSSProperties } from 'react';
import type { IReportCard, IReportPeriod } from './@types/reportCard.d';
import { MonthList } from '../../../config/constants';
import { CONDUCT_RATING_OPTIONS } from '../MonthlyData/@types/conduct.d';
import { cardColors, fonts } from '../../../theme/tokens';

type ResultCardProps = {
  data: IReportCard;
};

// print.css styles the card, because it must look the same in the print frame
// Every card has room for a full year, so it's the same size however many
// tests have happened. Unused rows print empty.
const STANDARD_ROWS = 12;

const cardVariables = {
  '--card-accent': cardColors.accent,
  '--card-label': cardColors.label,
  '--card-on-label': cardColors.onLabel,
  '--card-tint': cardColors.tint,
  '--card-stripe': cardColors.stripe,
  '--card-block': cardColors.block,
  '--card-line': cardColors.line,
  '--card-ink': cardColors.ink,
  '--card-paper': cardColors.paper,
  '--card-rule': cardColors.rule,
  '--card-font': fonts.body,
  '--card-display': fonts.display,
} as CSSProperties;

// The school's wording, not the stored enum
const conductLabel = (rating: string | null) =>
  CONDUCT_RATING_OPTIONS.find((option) => option.value === rating)?.label ??
  rating ??
  '—';

const periodMonth = ({ month, year }: { month: number; year: number }) =>
  `${MonthList.find((m) => m.value === month)?.label ?? month} ${year}`;

const periodLabel = (period: IReportPeriod) =>
  `${periodMonth(period.from)} to ${periodMonth(period.to)}`;

export const ResultCard = forwardRef<HTMLDivElement, ResultCardProps>(
  ({ data }, ref) => {
    // Columns come from the endpoint's explicit `subjects` list — NEVER from a
    // single row's `marks`. A test that omits a subject must not be able to
    // drop that subject's column.
    const blankRows = Math.max(0, STANDARD_ROWS - data.rows.length);
    const { overall, position, conduct, student, institute } = data;

    return (
      <div ref={ref} className="card-root" style={cardVariables}>
        <div className="card-strip" />
        <div className="card-body">
          <div className={`card-head ${institute.logo ? 'with-logo' : ''}`}>
            {institute.logo && <img src={institute.logo} alt="" />}
            <div>
              <b>{institute.name}</b>
              <span>
                {institute.address}, {institute.phone}
              </span>
            </div>
          </div>

          <div className="card-title">{data.title}</div>
          <div className="card-period">{periodLabel(data.period)}</div>

          <div className="card-student">
            <span>STUDENT’S NAME</span>
            <span>{student.name}</span>
            <span>FATHER’S NAME</span>
            <span>{student.fatherName}</span>
            <span>CLASS</span>
            <span>{student.class}</span>
            <span>ROLL NO.</span>
            <span>{student.rollNumber}</span>
          </div>

          <table className="card-marks">
            <thead>
              <tr>
                <th>Subjects / Tests</th>
                {data.subjects.map((s) => (
                  <th key={s.externalId}>{s.name}</th>
                ))}
                <th>Total</th>
                <th>%</th>
                <th>Grade</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row) => (
                <tr key={row.testExternalId}>
                  <td>
                    {data.rows.filter((r) => r.testName === row.testName)
                      .length > 1
                      ? `${row.testName} (${periodMonth(row)})`
                      : row.testName}
                  </td>
                  {data.subjects.map((s) => {
                    // No mark entered, or the subject wasn't examined:
                    // blank. A blank and a zero are different facts.
                    const mark = row.marks[s.externalId];
                    return (
                      <td key={s.externalId} className="card-total-cell">
                        {mark && mark.obtained !== null
                          ? `${mark.obtained} / ${mark.max}`
                          : ''}
                      </td>
                    );
                  })}
                  <td className="card-total-cell">
                    {row.maxTotal ? `${row.total} / ${row.maxTotal}` : ''}
                  </td>
                  <td>{row.percentage?.toFixed(2) ?? ''}</td>
                  <td>{row.grade ?? ''}</td>
                </tr>
              ))}
              {Array.from({ length: blankRows }, (_, i) => (
                <tr key={i}>
                  <td>&nbsp;</td>
                  {data.subjects.map((s) => (
                    <td key={s.externalId} />
                  ))}
                  <td />
                  <td />
                  <td />
                </tr>
              ))}
              <tr className="card-total">
                <td>Subject Total</td>
                {data.subjects.map((s) => {
                  const total = data.subjectTotals[s.externalId];
                  return (
                    <td key={s.externalId} className="card-total-cell">
                      {total?.max ? `${total.obtained} / ${total.max}` : ''}
                    </td>
                  );
                })}
                <td className="card-total-cell">
                  {overall.totalMarks
                    ? `${overall.obtainedMarks} / ${overall.totalMarks}`
                    : ''}
                </td>
                <td />
                <td />
              </tr>
            </tbody>
          </table>

          <div className="card-conduct">
            {conduct.month && conduct.year && (
              <span>
                Conduct for{' '}
                <b>
                  {periodMonth({ month: conduct.month, year: conduct.year })}
                </b>
              </span>
            )}
            <span>
              Behaviour: <b>{conductLabel(conduct.behaviour)}</b>
            </span>
            <span>
              Uniform & Cleanliness:{' '}
              <b>{conductLabel(conduct.uniformCleanliness)}</b>
            </span>
          </div>

          <div className="card-bottom">
            <div className="card-overall">
              <h4>OVERALL RESULT</h4>
              <dl>
                <div>
                  <dt>Obtained Marks</dt>
                  <dd>{overall.totalMarks ? overall.obtainedMarks : '—'}</dd>
                </div>
                <div>
                  <dt>Grade</dt>
                  <dd>{overall.grade ?? '—'}</dd>
                </div>
                <div>
                  <dt>Total Marks</dt>
                  <dd>{overall.totalMarks || '—'}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>{overall.status ?? '—'}</dd>
                </div>
                <div>
                  <dt>%</dt>
                  <dd>{overall.percentage?.toFixed(2) ?? '—'}</dd>
                </div>
                <div>
                  <dt>Position</dt>
                  <dd>
                    {position ? `${position.rank} / ${position.outOf}` : '—'}
                  </dd>
                </div>
              </dl>
            </div>
            <div className="card-remarks">
              <b>Remarks</b>
              <p>{overall.remarks}</p>
              <div className="card-signatures">
                <span>Principal’s Signature</span>
                <span>Parent’s Signature</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);
