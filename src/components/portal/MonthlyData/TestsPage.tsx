import { useState } from 'react';
import { Box, Button, Card, Modal } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
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
