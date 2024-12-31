'use client';

import { Dialog, DialogContent, IconButton, Stack, Typography } from '@mui/material';
import { IoClose } from 'react-icons/io5';
import LoginForm from 'src/components/forms/login';

export default function LoginPopover({ open, onClose }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: '100%',
          maxWidth: 560,
          borderRadius: 2,
          bgcolor: 'background.paper',
        }
      }}
      BackdropProps={{
        sx: {
          backdropFilter: 'blur(8px)',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }
      }}
    >
      <DialogContent sx={{ p: 3, position: 'relative' }}>
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'text.secondary'
          }}
        >
          <IoClose size={24} />
        </IconButton>

        <Stack mb={5}>
          <Typography textAlign="center" variant="h4" component="h1" gutterBottom>
            Login
          </Typography>
          <Typography textAlign="center" color="text.secondary">
            Login to your account to continue
          </Typography>
        </Stack>

        <LoginForm />
      </DialogContent>
    </Dialog>
  );
}
