import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
} from '@mui/material';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { DummyTests } from '../../../../config/constants';

export default function TestListTable({
  onEditTest,
}: {
  onEditTest: (id: string) => void;
}) {
  const handleDelete = (id: string) => {
    const idx = DummyTests.findIndex((t) => t.id === id);
    if (idx !== -1) DummyTests.splice(idx, 1);
  };

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Test Name</TableCell>
          <TableCell>Class</TableCell>
          <TableCell>Month</TableCell>
          <TableCell>Year</TableCell>
          <TableCell>Actions</TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {DummyTests.map((t) => (
          <TableRow key={t.id}>
            <TableCell>{t.testName}</TableCell>
            <TableCell>{t.classLevel}</TableCell>
            <TableCell>{t.month}</TableCell>
            <TableCell>{t.year}</TableCell>
            <TableCell>
              <IconButton onClick={() => onEditTest(t.id)}>
                <EditIcon />
              </IconButton>
              <IconButton onClick={() => handleDelete(t.id)}>
                <DeleteIcon />
              </IconButton>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
