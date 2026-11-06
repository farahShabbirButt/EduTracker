import { useState } from 'react';
import { Box, Button, Modal, Paper } from '@mui/material';
import TestListTable from './TestTab/TestListTable';
import TestModal from './TestTab/TestModal';

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
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'end' }}>
          <Button variant="contained" onClick={handleAddTest} sx={{ mb: 2 }}>
            Add Test
          </Button>
        </Box>

        <TestListTable onEditTest={handleEditTest} />
      </Paper>

      <Modal open={openCreateModal} onClose={() => setOpenCreateModal(false)}>
        <Box
          sx={{
            width: { xs: 'calc(100% - 32px)', sm: 500 },
            mx: 'auto',
            mt: { xs: 2, sm: 5 },
            maxHeight: { xs: 'calc(100vh - 32px)', sm: 'calc(100vh - 80px)' },
            overflow: 'auto',
            backgroundColor: 'background.paper',
            borderRadius: 2,
            p: 3,
          }}
        >
          <TestModal
            onClose={() => setOpenCreateModal(false)}
            editTestId={editTestId}
          />
        </Box>
      </Modal>
    </>
  );
}
