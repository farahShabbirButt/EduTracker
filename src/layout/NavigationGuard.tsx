import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useBlocker, type BlockerFunction } from 'react-router-dom';
import DeleteDialog from '../common/Dialogs/DeleteDialog/DeleteDialog';

interface NavigationGuardValue {
  setDirty: (dirty: boolean) => void;
  confirmLeaving: (go: () => void) => void;
}

const NavigationGuardContext = createContext<NavigationGuardValue | null>(null);

// Leaving a screen unmounts it, which loses anything typed. The blocker catches
// every route change, Back and Forward included, so a screen with unsaved work
// only has to call setDirty(). A way out that isn't a route change, such as
// signing out, asks through confirmLeaving().
export function NavigationGuardProvider({ children }: { children: ReactNode }) {
  const dirty = useRef(false);
  const [pending, setPending] = useState<(() => void) | null>(null);

  const blocker = useBlocker(
    useCallback<BlockerFunction>(
      ({ currentLocation, nextLocation }) =>
        dirty.current && currentLocation.pathname !== nextLocation.pathname,
      []
    )
  );

  const setDirty = useCallback((value: boolean) => {
    dirty.current = value;
  }, []);

  const confirmLeaving = useCallback((go: () => void) => {
    if (dirty.current) setPending(() => go);
    else go();
  }, []);

  const value = useMemo(
    () => ({ setDirty, confirmLeaving }),
    [setDirty, confirmLeaving]
  );

  const stay = () => {
    if (blocker.state === 'blocked') blocker.reset();
    setPending(null);
  };

  const discard = () => {
    dirty.current = false;
    if (blocker.state === 'blocked') blocker.proceed();
    pending?.();
    setPending(null);
  };

  return (
    <NavigationGuardContext value={value}>
      {children}
      <DeleteDialog
        open={blocker.state === 'blocked' || pending !== null}
        title="Discard unsaved marks?"
        subtitle="The marks typed here haven't been saved."
        confirmLabel="Discard"
        onCancel={stay}
        onConfirm={discard}
      />
    </NavigationGuardContext>
  );
}

export function useNavigationGuard() {
  const value = useContext(NavigationGuardContext);
  if (!value) {
    throw new Error('useNavigationGuard needs a NavigationGuardProvider');
  }
  return value;
}
