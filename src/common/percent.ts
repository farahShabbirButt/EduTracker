// Rounds down, so a test with one mark missing can't read as 100%
export const percentOf = (done: number, total: number) =>
  total ? Math.floor((done / total) * 100) : 0;
