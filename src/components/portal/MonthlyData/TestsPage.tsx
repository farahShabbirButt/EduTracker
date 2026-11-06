import { useState } from 'react';
import { Box, Button, Card } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import TestListTable from './TestTab/TestListTable';
import TestModal from './TestTab/TestModal';
import FormPanel from '../../../common/FormPanel';

export default function TestsPage() {
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [editTestId, setEditTestId] = useState<string | null>(null);

  const handleAddTest = () => {
    setEditTestId(null);
    setOpenCreateModal(true);
  };

  const handleEditTest = (id: string) => {
    setEditTestId(id);
    setOpenCreateModal(true);
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'end', mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddTest}
        >
          New test
        </Button>
      </Box>
      <Card sx={{ p: 1.5 }}>
        <TestListTable onEditTest={handleEditTest} />
      </Card>

      <FormPanel open={openCreateModal} label="Test details">
        <Box sx={{ p: 3, overflow: 'auto' }}>
          <TestModal
            onClose={() => setOpenCreateModal(false)}
            editTestId={editTestId}
          />
        </Box>
      </FormPanel>
    </>
  );
}
