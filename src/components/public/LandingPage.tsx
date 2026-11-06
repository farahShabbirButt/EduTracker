import { useEffect, useRef, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Button, useTheme } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PeopleOutlineOutlinedIcon from '@mui/icons-material/PeopleOutlineOutlined';
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import { routes } from '../../config/routes';
import './landing.css';

const STORY = [
  {
    title: 'Set up the school once',
    text: 'Add your classes, subjects and grade boundaries, then your students. Your school name, address, phone and logo are saved once and printed on every card.',
  },
  {
    title: "Enter each month's marks",
    text: "Create the month's test, choose which subjects it covers and their max marks, then fill in the whole class on one grid. Add behaviour and uniform ratings alongside.",
  },
  {
    title: 'Print the cards',
    text: 'Pick a class, preview each result card, then print them all at once, one per A4 page. Grade, status and position are filled in for you.',
  },
];

const DETAILS = [
  {
    icon: <WarningAmberOutlinedIcon />,
    title: 'Blank is not zero',
    text: "A mark not entered prints blank and isn't counted, so a missing paper never looks like a fail.",
  },
  {
    icon: <EditOutlinedIcon />,
    title: 'Half marks work',
    text: 'Enter 24.5 and it stays 24.5 on the card, in the totals and in the percentage.',
  },
  {
    icon: <PeopleOutlineOutlinedIcon />,
    title: 'Marks follow the student',
    text: 'Move a student to another class and their earlier marks stay on their card.',
  },
  {
    icon: <StarBorderOutlinedIcon />,
    title: 'Fair positions',
    text: 'Position ranks the class by percentage, and warns you while classmates still have marks to enter.',
  },
  {
    icon: <PrintOutlinedIcon />,
    title: 'Print a class in one go',
    text: 'Choose the students, and every card prints together, one per A4 page.',
  },
  {
    icon: <EventOutlinedIcon />,
    title: 'Your school year',
    text: 'Set the date your year starts, and Reports fills in the right months for you.',
  },
];

const FAQS = [
  {
    q: 'What happens when a mark is missing?',
    a: "The cell stays amber on the grid and blank on the card. It isn't counted as zero, and the card tells you it's incomplete before you print.",
  },
  {
    q: 'Can a test leave out some subjects?',
    a: 'Yes. Each test lists the subjects it covers and their max marks. A subject left out prints blank and the total is out of a smaller number.',
  },
  {
    q: "Does the card keep our school's format?",
    a: 'Yes. Your header, student line, test-by-subject grid, behaviour, overall result, remarks and signature lines all stay, with your logo at the top.',
  },
  {
    q: 'Can I use it on my phone?',
    a: 'Yes. Every screen has its own phone layout, so you can enter marks between classes. Printing is easier from a laptop.',
  },
  {
    q: 'Who can sign in?',
    a: "The school admin. Teachers, students and parents don't need accounts.",
  },
];

const PAPER_ROWS = [
  ['Test 1', 28, 44, 54, 27, '90.1'],
  ['Test 2', 26, 47, 58, 26, '91.5'],
  ['Test 3', 29, 43, 55, 28, '91.2'],
  ['Test 4', 29, 47, 58, 28, '94.7'],
];

const FILL_ROWS = [
  ['Qasim', 26, 40, 58, 30],
  ['Hira', 24, 38, 52, 30],
  ['Bilal', 22, 35, 49, 28],
  ['Sana', 29, 45, 56, 30],
  ['Usman', 18, 30, 44, 25],
];

const StoryScreen = ({ step, on }: { step: number; on: boolean }) => {
  const className = `screen ${on ? 'on' : ''}`;
  if (step === 0) {
    return (
      <div className={className}>
        <h4>Setup guide</h4>
        {[
          'Add classes',
          'Add subjects and assign them',
          'Add students',
          'Set grade boundaries',
        ].map((text, i) => (
          <div
            key={text}
            className="setup-card"
            style={{ '--delay': `${i * 0.14}s` } as React.CSSProperties}
          >
            <span className="tick">
              <CheckIcon />
            </span>
            {text}
          </div>
        ))}
      </div>
    );
  }
  if (step === 1) {
    return (
      <div className={className}>
        <h4>Class 9th, Test 8</h4>
        {FILL_ROWS.map((row, r) => (
          <div key={row[0]} className="fill-row">
            <span>{row[0]}</span>
            {row.slice(1).map((mark, c) => (
              <i
                key={c}
                style={
                  { '--delay': `${(r * 4 + c) * 0.05}s` } as React.CSSProperties
                }
              >
                {mark}
              </i>
            ))}
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className={className}>
      <div className="print-stack">
        {[0, 1, 2].map((sheet) => (
          <div key={sheet} className="print-sheet">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((line) => (
              <u key={line} />
            ))}
            <u style={{ width: '40%' }} />
          </div>
        ))}
      </div>
    </div>
  );
};

const HeroCell = ({
  value,
  shown,
}: {
  value: string;
  shown: string | null;
}) => {
  if (shown === null) return <span className="demo-cell hero-cell empty" />;
  const typing = shown !== value;
  return (
    <span className={`demo-cell hero-cell ${typing ? 'typing' : ''}`}>
      {shown}
      {typing && <i className="caret" />}
    </span>
  );
};

// Sample marks to try: nothing here is saved
const TryGrid = () => {
  const [rows, setRows] = useState([
    { name: 'Qasim', marks: ['29', '47', '58'] },
    { name: 'Hira', marks: ['27', '44', ''] },
  ]);
  const [note, setNote] = useState({
    text: 'Type a mark in the amber cell, or try one over the maximum.',
    bad: false,
  });
  const maxes = [30, 50, 60];
  const subjects = ['Maths', 'Urdu', 'English'];

  const change = (row: number, cell: number, raw: string) => {
    const value = raw.trim();
    setRows((all) =>
      all.map((r, i) =>
        i === row
          ? { ...r, marks: r.marks.map((m, c) => (c === cell ? value : m)) }
          : r
      )
    );
    const over = isOver(value, maxes[cell]);
    setNote({
      bad: over,
      text: over
        ? `That's over the maximum of ${maxes[cell]}, so it can't be saved.`
        : value === ''
          ? "Empty cells stay amber until they're filled."
          : 'The total updated as you typed.',
    });
  };

  return (
    <div className="try">
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Maths /30</th>
              <th>Urdu /50</th>
              <th>English /60</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, r) => (
              <tr key={row.name}>
                <td>{row.name}</td>
                {row.marks.map((mark, c) => (
                  <td key={c}>
                    <input
                      className={`mark ${mark === '' ? 'empty' : isOver(mark, maxes[c]) ? 'over' : ''}`}
                      inputMode="decimal"
                      aria-label={`${row.name}, ${subjects[c]}`}
                      value={mark}
                      onChange={(e) => change(r, c, e.target.value)}
                    />
                  </td>
                ))}
                <td className="row-total">
                  {row.marks.reduce((sum, m) => sum + (Number(m) || 0), 0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className={`try-note ${note.bad ? 'bad' : ''}`} aria-live="polite">
        {note.text}
      </p>
    </div>
  );
};

const isOver = (value: string, max: number) =>
  value !== '' &&
  (Number.isNaN(Number(value)) || Number(value) < 0 || Number(value) > max);

const SignIn = ({ light }: { light?: boolean }) => (
  <Button
    component={RouterLink}
    to={routes.auth.login}
    variant="contained"
    sx={
      light
        ? (theme) => ({
            bgcolor: theme.palette.studio.paper,
            color: theme.palette.studio.paperAccent,
            '&:hover': { bgcolor: theme.palette.studio.paperLine },
          })
        : undefined
    }
  >
    Sign in to EduTracker
  </Button>
);

const Brand = () => (
  <a className="brand" href="#top">
    <span className="brand-mark">
      <SchoolOutlinedIcon fontSize="small" />
    </span>
    EduTracker
  </a>
);

export default function LandingPage() {
  const theme = useTheme();
  const c = theme.palette.studio;
  const { radii, motion, fonts } = theme.studio;

  const root = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [cellA, setCellA] = useState<string | null>(null);
  const [cellB, setCellB] = useState<string | null>(null);
  const [percent, setPercent] = useState(78);
  const [stamped, setStamped] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    const page = root.current;
    const nav = navRef.current;
    if (!page || !nav) return undefined;
    const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timers: number[] = [];
    const later = (fn: () => void, ms: number) =>
      timers.push(window.setTimeout(fn, ms));

    const onScroll = () => nav.classList.toggle('stuck', window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    const reveal = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            reveal.unobserve(entry.target);
          }
        }),
      { threshold: 0.14, rootMargin: '0px 0px -6% 0px' }
    );
    page.querySelectorAll('.reveal').forEach((el) => reveal.observe(el));

    const steps = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setStep(Number((entry.target as HTMLElement).dataset.step));
          }
        }),
      { rootMargin: '-45% 0px -45% 0px' }
    );
    page.querySelectorAll('.story-step').forEach((el) => steps.observe(el));

    if (calm) {
      setCellA('53');
      setCellB('27');
      setPercent(100);
      setStamped(true);
    } else {
      later(() => setCellA(''), 1500);
      later(() => setCellA('5'), 1740);
      later(() => setCellA('53'), 1980);
      later(() => setPercent(89), 2220);
      later(() => setCellB(''), 2500);
      later(() => setCellB('2'), 2740);
      later(() => setCellB('27'), 2980);
      later(() => setPercent(100), 3220);
      later(() => setStamped(true), 3500);
    }

    const tabs = calm
      ? 0
      : window.setInterval(() => setTab((t) => (t + 1) % 3), 1900);

    document.documentElement.classList.add('lp-smooth');
    return () => {
      window.removeEventListener('scroll', onScroll);
      reveal.disconnect();
      steps.disconnect();
      timers.forEach(clearTimeout);
      clearInterval(tabs);
      document.documentElement.classList.remove('lp-smooth');
    };
  }, []);

  const variables = {
    '--bg': c.page,
    '--surface': c.surface,
    '--surface-2': c.surfaceSoft,
    '--line': c.line,
    '--ink': c.ink,
    '--ink-2': c.inkSoft,
    '--ink-3': c.inkMuted,
    '--primary': c.primary,
    '--primary-2': c.primaryBright,
    '--on-primary': c.onPrimary,
    '--tint': c.tint,
    '--tint-ink': c.tintInk,
    '--amber': c.amber,
    '--amber-bg': c.amberSoft,
    '--amber-ink': c.amberInk,
    '--red': c.red,
    '--red-bg': c.redSoft,
    '--green': c.green,
    '--peach': c.peach,
    '--side-bg': c.sidebar,
    '--pill': c.pill,
    '--hero': c.hero,
    '--paper': c.paper,
    '--paper-ink': c.paperInk,
    '--paper-line': c.paperLine,
    '--paper-accent': c.paperAccent,
    '--stamp': c.stamp,
    '--on-hero': c.sidebarInkStrong,
    '--on-hero-soft': c.sidebarInk,
    '--font': fonts.body,
    '--font-display': fonts.display,
    '--r-s': `${radii.small}px`,
    '--r-m': `${radii.medium}px`,
    '--r-l': `${radii.large}px`,
    '--r-xl': `${radii.xlarge}px`,
    '--r-pill': `${radii.pill}px`,
    '--shadow-s': theme.studio.shadows.small,
    '--shadow-m': theme.studio.shadows.medium,
    '--shadow-l': theme.studio.shadows.large,
    '--ease': motion.ease,
    '--spring': motion.spring,
    '--mid': motion.medium,
    '--slow': motion.slow,
  } as React.CSSProperties;

  return (
    <div className="lp" ref={root} style={variables} id="top">
      <div className="lp-nav" ref={navRef}>
        <nav className="pub-nav">
          <Brand />
          <span className="spacer" />
          <div className="lp-links">
            <a href="#how">How it works</a>
            <a href="#features">Features</a>
            <a href="#questions">Questions</a>
          </div>
          <Button
            component={RouterLink}
            to={routes.auth.login}
            variant="contained"
          >
            Sign in
          </Button>
        </nav>
      </div>

      <section className="lp-hero">
        <div>
          <h1>
            <span className="mask">
              <span>Monthly marks in.</span>
            </span>
            <span className="mask">
              <span>Result cards out.</span>
            </span>
          </h1>
          <p className="lp-lead">
            Leave the Excel sheets behind. Enter each month's marks on one
            class-wide grid, see exactly what is still missing, and print every
            student's card on A4 in your school's own format.
          </p>
          <div className="hero-actions">
            <SignIn />
            <Button href="#how" variant="outlined">
              See how it works
            </Button>
          </div>
          <ul className="lp-points">
            {[
              'One grid for the whole class',
              'Blank marks stay blank, never a silent zero',
              'Your card layout, printed on one A4 page',
            ].map((point) => (
              <li key={point}>
                <CheckIcon />
                {point}
              </li>
            ))}
          </ul>
        </div>
        <div className="stage" aria-hidden="true">
          <div className="paper">
            <h3>MONTHLY ASSESSMENT REPORT</h3>
            <p>January 2026 to December 2026</p>
            <div className="paper-grid">
              {[
                'Subjects / Tests',
                'Maths',
                'Urdu',
                'English',
                'Physics',
                '%',
              ].map((head) => (
                <span key={head}>
                  <b>{head}</b>
                </span>
              ))}
              {PAPER_ROWS.flat().map((value, i) => (
                <span key={i}>{value}</span>
              ))}
            </div>
            <div className="paper-foot">
              <span>Principal's Signature ______</span>
              <span className={`stamp ${stamped ? 'down' : ''}`}>PASS</span>
            </div>
          </div>
          <div className="hero-grid">
            <div className="demo-top">
              <span>Class 9th, Test 4</span>
              <span className="demo-count">{percent}% entered</span>
            </div>
            <div className="bar">
              <span style={{ width: `${percent}%` }} />
            </div>
            <div className="demo-grid">
              <span className="h">Student</span>
              <span className="h">Maths</span>
              <span className="h">Urdu</span>
              <span className="h">English</span>
              <span className="h">Physics</span>
              <span>Qasim</span>
              {[29, 47, 58, 28].map((m, i) => (
                <span key={i} className="demo-cell">
                  {m}
                </span>
              ))}
              <span>Hira</span>
              {[27, 44, 55, 26].map((m, i) => (
                <span key={i} className="demo-cell">
                  {m}
                </span>
              ))}
              <span>Bilal</span>
              <span className="demo-cell">24</span>
              <span className="demo-cell">39</span>
              <HeroCell value="53" shown={cellA} />
              <span className="demo-cell">25</span>
              <span>Sana</span>
              <span className="demo-cell">30</span>
              <span className="demo-cell">48</span>
              <span className="demo-cell">57</span>
              <HeroCell value="27" shown={cellB} />
            </div>
          </div>
        </div>
      </section>

      <div className="story-band" id="how">
        <section className="lp-section" style={{ paddingBottom: 40 }}>
          <h2 className="section-title reveal">
            Set up once. Enter monthly. Print at term end.
          </h2>
          <div className="story">
            <div>
              {STORY.map((item, i) => (
                <article
                  key={item.title}
                  className={`story-step ${i === step ? 'on' : ''}`}
                  data-step={i}
                >
                  <b>{i + 1}</b>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                  <div className="inline-visual">
                    <StoryScreen step={i} on />
                  </div>
                </article>
              ))}
            </div>
            <div className="story-sticky" aria-hidden="true">
              {STORY.map((item, i) => (
                <StoryScreen key={item.title} step={i} on={i === step} />
              ))}
            </div>
          </div>
        </section>
      </div>

      <section className="lp-section" id="features">
        <h2 className="section-title reveal">
          The printed result card is the product.
        </h2>
        <p className="lp-intro reveal">
          Everything else exists to get the right numbers onto it.
        </p>
        <div className="bento">
          <div className="tile tile-7 reveal">
            <h3>One grid for the whole class</h3>
            <p>
              No more one subject at a time. Every student and every subject on
              one screen, with totals that update as you type. Try it.
            </p>
            <TryGrid />
          </div>
          <div className="tile tile-5 tinted reveal">
            <h3>See what is still missing</h3>
            <p>
              Every test shows how much is done, so nothing slips through to
              print day.
            </p>
            <div style={{ marginTop: 'auto' }}>
              {[
                ['Test 7, Class 9th', 'Done', 'done', '100%', ''],
                ['Test 8, Class 9th', '3 missing', 'left', '92%', 'warn'],
                ['Test 8, Class 8th', '9 missing', 'left', '68%', 'warn'],
              ].map(([name, state, kind, width, warn]) => (
                <div key={name} className="miss-row">
                  <span>{name}</span>
                  <span className={kind}>{state}</span>
                  <div className="bar">
                    <span
                      className={`grow ${warn}`}
                      style={{ '--w': width } as React.CSSProperties}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="tile tile-5 peach reveal">
            <h3>Your card, your format</h3>
            <p>
              The card keeps the layout your school already prints, from the
              header to the signature lines.
            </p>
            <div className="card-parts">
              {[
                ['Overall result', '2054 / 2260'],
                ['Grade', 'A+'],
                ['Status', 'PASS'],
                ['Position', 'Filled in for you'],
              ].map(([label, value], i) => (
                <div key={label} style={{ '--i': i } as React.CSSProperties}>
                  <span>{label}</span>
                  <span>{value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="tile tile-7 reveal">
            <h3>On the laptop and in your pocket</h3>
            <p>
              Short sessions on a phone between classes, the big print-all
              session on a laptop. Every screen has its own phone layout.
            </p>
            <div className="devices" aria-hidden="true">
              <div className="mini-laptop">
                <i />
                <em />
              </div>
              <div className="mini-phone">
                <em>{['Students', 'Marks', 'Reports'][tab]}</em>
                <div className="mini-tabs">
                  <span style={{ transform: `translateX(${tab * 100}%)` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="lp-section" style={{ paddingTop: 0 }}>
        <h2 className="section-title reveal">
          Built for how result cards really work.
        </h2>
        <div className="details">
          {DETAILS.map((detail) => (
            <div key={detail.title} className="detail reveal">
              <span className="ic">{detail.icon}</span>
              <div>
                <h3>{detail.title}</h3>
                <p>{detail.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="faq-band" id="questions">
        <section className="lp-section faq-wrap">
          <h2 className="section-title reveal">Questions schools ask.</h2>
          <div className="reveal">
            {FAQS.map((faq, i) => (
              <div key={faq.q} className={`faq ${openFaq === i ? 'open' : ''}`}>
                <button
                  type="button"
                  aria-expanded={openFaq === i}
                  aria-controls={`faq-${i}`}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  {faq.q}
                  <AddIcon />
                </button>
                <div
                  className="faq-a"
                  id={`faq-${i}`}
                  aria-hidden={openFaq !== i}
                >
                  <p>{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="lp-cta reveal">
        <div>
          <h2>Term end should not mean a week of copying numbers.</h2>
          <p>Sign in, open Reports, choose a class and print.</p>
        </div>
        <SignIn light />
      </section>

      <footer className="lp-footer">
        <Brand />
        <span>Result cards for schools</span>
        <span className="spacer" />
        <a href="#how">How it works</a>
        <a href="#features">Features</a>
        <a href="#questions">Questions</a>
        <RouterLink to={routes.auth.login}>Sign in</RouterLink>
      </footer>
    </div>
  );
}
