import { useSelector } from 'react-redux';
import { Card, CardContent, Typography } from '@mui/material';
import type { RootState } from '../../../redux/store';

export default function ProfilePage() {
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6">{user?.name ?? 'School admin'}</Typography>
        <Typography variant="body2">{user?.email}</Typography>
      </CardContent>
    </Card>
  );
}
