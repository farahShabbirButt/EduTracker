import { useSearchParams } from 'react-router-dom';

// ?import=1 opens a screen's import panel, so the Dashboard's setup steps can link to it
export default function useImportParam() {
  const [searchParams, setSearchParams] = useSearchParams();
  const open = searchParams.get('import') === '1';
  const setOpen = (value: boolean) =>
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        if (value) next.set('import', '1');
        else next.delete('import');
        return next;
      },
      { replace: true }
    );
  return [open, setOpen] as const;
}
