import { Avatar } from '@mui/material';

// "Muhammad Qasim Ali" → "MA": the first and last words' first letters
export const initialsOf = (name: string) => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  const first = Array.from(words[0])[0];
  const last = words.length > 1 ? Array.from(words[words.length - 1])[0] : '';
  return (first + last).toUpperCase();
};

// The same name always lands on the same colour
const colourIndex = (name: string, count: number) => {
  let hash = 0;
  for (const ch of name.trim().toLowerCase()) {
    hash = (hash * 31 + ch.codePointAt(0)!) | 0;
  }
  return Math.abs(hash) % count;
};

export default function StudentAvatar({
  name,
  size = 36,
  dim = false,
}: {
  // The student's full name
  name: string;
  size?: number;
  // Faded, e.g. a student left out of a print run
  dim?: boolean;
}) {
  return (
    <Avatar
      aria-hidden="true"
      sx={(theme) => {
        const { avatars } = theme.palette.studio;
        const colour = avatars[colourIndex(name, avatars.length)];
        return {
          width: size,
          height: size,
          flex: 'none',
          fontSize: Math.round(size * 0.36),
          fontWeight: 800,
          letterSpacing: '0.02em',
          bgcolor: colour.bg,
          color: colour.ink,
          opacity: dim ? 0.5 : 1,
          transition: `opacity ${theme.studio.motion.medium}`,
        };
      }}
    >
      {initialsOf(name)}
    </Avatar>
  );
}
