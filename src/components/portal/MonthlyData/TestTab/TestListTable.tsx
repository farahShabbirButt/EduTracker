import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Tooltip,
  MenuItem,
} from '@mui/material';

import {
  MoreVert as MenuIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { DummyTests } from '../../../../config/constants';
import DropdownMenu from '../../../../common/DropdownMenu/DropdownMenu';

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
              <DropdownMenu icon={<MenuIcon fontSize="small" />}>
                <Tooltip title="Edit">
                  <MenuItem onClick={() => onEditTest(t.id)}>
                    <EditIcon fontSize="small" sx={{ mr: 1 }} />
                    Edit
                  </MenuItem>
                </Tooltip>
                <Tooltip title="Delete">
                  <MenuItem onClick={() => handleDelete(t.id)}>
                    <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                    Delete
                  </MenuItem>
                </Tooltip>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
