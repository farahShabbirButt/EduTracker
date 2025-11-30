import { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Paper,
  Button,
  Modal,
  Stack,
  Card,
  CardHeader,
  Divider,
  CardContent,
} from '@mui/material';

import TestMarksEntry from './TestMarksEntry';
import TestListTable from './TestTab/TestListTable';
import TestModal from './TestTab/TestModal';

export default function MonthlyDataManagement() {
  const [activeTab, setActiveTab] = useState(0);
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
    <Stack spacing={2}>
      <Card>
        <CardHeader
          title="Monthly Data Management"
          subheader="Add Tests and monthly marks"
        />
        <Divider />
        <CardContent>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems="center"
          >
            <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)}>
              <Tab label="Tests" />
              <Tab label="Marks Entry" />
            </Tabs>
          </Stack>
        </CardContent>
      </Card>

      <Box sx={{ mt: 4 }}>
        {activeTab === 0 && (
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'end' }}>
              <Button
                variant="contained"
                onClick={handleAddTest}
                sx={{ mb: 2 }}
              >
                Add Test
              </Button>
            </Box>

            <TestListTable onEditTest={handleEditTest} />
          </Paper>
        )}

        {activeTab === 1 && <TestMarksEntry />}
      </Box>

      <Modal open={openCreateModal} onClose={() => setOpenCreateModal(false)}>
        <Box
          sx={{
            width: 500,
            mx: 'auto',
            mt: 10,
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
    </Stack>
  );
}
