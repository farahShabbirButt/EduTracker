import { useEffect } from 'react';
import TestMarksEntry from './TestMarksEntry';
import { useNavigationGuard } from '../../../layout/NavigationGuard';

export default function MarksPage() {
  const { setDirty } = useNavigationGuard();

  useEffect(() => () => setDirty(false), [setDirty]);

  return <TestMarksEntry onDirtyChange={setDirty} />;
}
