import { Box } from '@mui/material';
import { keyframes } from '@mui/material/styles';
import { cardColors } from '../theme/tokens';

// A sample of the real result card, filling itself in once as the page opens:
// the marks go in, the overall result follows, and the grade is stamped on.
const SUBJECTS = [
  { name: 'English', marks: 78 },
  { name: 'Urdu', marks: 84 },
  { name: 'Mathematics', marks: 91 },
  { name: 'Science', marks: 73 },
];

const FIRST_MARK_AT = 0.5;
const MARK_GAP = 0.3;
const OVERALL_AT = FIRST_MARK_AT + SUBJECTS.length * MARK_GAP;
const STAMP_AT = OVERALL_AT + 0.45;

const sheetIn = keyframes`
  from { opacity: 0; transform: translateY(26px) rotate(0deg); }
`;
const markIn = keyframes`
  0% { opacity: 0; box-shadow: 0 0 0 2px ${cardColors.accent}; }
  35% { opacity: 1; box-shadow: 0 0 0 2px ${cardColors.accent}; }
  100% { opacity: 1; box-shadow: 0 0 0 2px transparent; }
`;
const overallIn = keyframes`
  from { opacity: 0; }
`;
const stampIn = keyframes`
  from { opacity: 0; transform: scale(1.7) rotate(-14deg); }
`;

export default function AuthShowcase() {
  return (
    <Box
      aria-hidden
      sx={{
        position: 'relative',
        width: '100%',
        maxWidth: 372,
        mx: 'auto',
        color: cardColors.ink,
        fontSize: 12,
        '@media (max-height: 700px)': { display: 'none' },
      }}
    >
      {/* The rest of the class's cards, under this one */}
      <Box
        sx={(theme) => ({
          position: 'absolute',
          inset: 0,
          bgcolor: cardColors.paper,
          opacity: 0.28,
          borderRadius: `${theme.studio.radii.medium}px`,
          transform: 'rotate(4deg)',
          animation: `${sheetIn} .7s ${theme.studio.motion.ease} both`,
        })}
      />

      <Box
        sx={(theme) => ({
          position: 'relative',
          p: 2.5,
          bgcolor: cardColors.paper,
          borderRadius: `${theme.studio.radii.medium}px`,
          boxShadow: theme.studio.shadows.large,
          transform: 'rotate(-2deg)',
          animation: `${sheetIn} .7s ${theme.studio.motion.ease} both`,
        })}
      >
        <Box
          sx={(theme) => ({
            fontFamily: theme.studio.fonts.display,
            fontSize: 18,
            fontWeight: 600,
            textAlign: 'center',
            color: cardColors.label,
          })}
        >
          Monthly result card
        </Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            mt: 1.5,
            pb: 1,
            borderBottom: `1px solid ${cardColors.rule}`,
            fontWeight: 600,
          }}
        >
          <span>Ayesha Khan</span>
          <span>Class 9, roll no. 14</span>
        </Box>

        <Box sx={{ mt: 1.25 }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 56px 56px',
              py: 0.75,
              px: 1,
              bgcolor: cardColors.label,
              color: cardColors.onLabel,
              fontWeight: 700,
              borderRadius: 0.75,
            }}
          >
            <span>Subject</span>
            <Box sx={{ textAlign: 'end' }}>Max</Box>
            <Box sx={{ textAlign: 'end' }}>Marks</Box>
          </Box>
          {SUBJECTS.map((subject, index) => (
            <Box
              key={subject.name}
              sx={{
                display: 'grid',
                gridTemplateColumns: '1fr 56px 56px',
                alignItems: 'center',
                py: 0.5,
                px: 1,
                bgcolor: index % 2 ? cardColors.stripe : 'transparent',
              }}
            >
              <span>{subject.name}</span>
              <Box sx={{ textAlign: 'end' }}>100</Box>
              <Box
                sx={{
                  justifySelf: 'end',
                  px: 0.5,
                  fontWeight: 700,
                  borderRadius: 0.5,
                  animation: `${markIn} .7s ease-out ${
                    FIRST_MARK_AT + index * MARK_GAP
                  }s both`,
                }}
              >
                {subject.marks}
              </Box>
            </Box>
          ))}
        </Box>

        <Box
          sx={(theme) => ({
            display: 'grid',
            gridTemplateColumns: 'repeat(3, auto) 1fr',
            gap: 2.5,
            mt: 1.5,
            p: 1.5,
            bgcolor: cardColors.block,
            borderRadius: `${theme.studio.radii.small}px`,
            animation: `${overallIn} .5s ease-out ${OVERALL_AT}s both`,
          })}
        >
          {[
            ['Total', '326 / 400'],
            ['Percentage', '81.5%'],
            ['Position', '3rd'],
          ].map(([label, value]) => (
            <div key={label}>
              <Box sx={{ fontSize: 11 }}>{label}</Box>
              <Box sx={{ fontSize: 14, fontWeight: 800 }}>{value}</Box>
            </div>
          ))}
        </Box>

        <Box
          sx={(theme) => ({
            position: 'absolute',
            insetInlineEnd: 14,
            bottom: 12,
            width: 62,
            height: 62,
            display: 'grid',
            placeItems: 'center',
            bgcolor: cardColors.paper,
            border: `2.5px solid ${theme.palette.studio.stamp}`,
            borderRadius: '50%',
            color: theme.palette.studio.stamp,
            fontFamily: theme.studio.fonts.display,
            fontSize: 30,
            fontWeight: 600,
            lineHeight: 1,
            transform: 'rotate(-10deg)',
            animation: `${stampIn} .36s ${theme.studio.motion.spring} ${STAMP_AT}s both`,
          })}
        >
          A
        </Box>
      </Box>
    </Box>
  );
}
