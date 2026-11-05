import { useRef, useState } from 'react';
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
import ConductEntry from './ConductEntry';
import DeleteDialog from '../../../common/Dialogs/DeleteDialog/DeleteDialog';

export default function MonthlyDataManagement() {
  const [activeTab, setActiveTab] = useState(0);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [editTestId, setEditTestId] = useState<string | null>(null);

  const marksDirty = useRef(false);
  const [pendingTab, setPendingTab] = useState<number | null>(null);

  // Leaving Marks Entry unmounts it, which loses anything typed
  const handleTabChange = (tab: number) => {
    if (activeTab === 1 && marksDirty.current) setPendingTab(tab);
    else setActiveTab(tab);
  };

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
            <Tabs value={activeTab} onChange={(_, val) => handleTabChange(val)}>
              <Tab label="Tests" />
              <Tab label="Marks Entry" />
              <Tab label="Conduct" />
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

        {activeTab === 1 && (
          <TestMarksEntry
            onDirtyChange={(dirty) => {
              marksDirty.current = dirty;
            }}
          />
        )}
        {activeTab === 2 && <ConductEntry />}
      </Box>

      <DeleteDialog
        open={pendingTab !== null}
        title="Discard unsaved marks?"
        subtitle="The marks typed here haven't been saved."
        confirmLabel="Discard"
        onCancel={() => setPendingTab(null)}
        onConfirm={() => {
          marksDirty.current = false;
          setActiveTab(pendingTab ?? activeTab);
          setPendingTab(null);
        }}
      />

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
    </Stack>
  );
}
