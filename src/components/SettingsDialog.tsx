import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { useSettings } from '../SettingsProvider';
import FontPresetPicker from './FontPresetPicker';
import ColorThemePicker from './ColorThemePicker';

function SettingsDialog() {
  const { open, closeSettings } = useSettings();

  return (
    <Dialog
      open={open}
      onClose={closeSettings}
      maxWidth="sm"
      fullWidth
      aria-labelledby="settings-dialog-title"
      PaperProps={{
        sx: {
          bgcolor: 'background.default',
          border: '1px solid',
          borderColor: 'divider',
          backgroundImage: 'none',
        },
      }}
    >
      <DialogTitle
        id="settings-dialog-title"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pr: 1,
          pb: 1,
        }}
      >
        <Typography variant="h3" component="span" color="text.primary">
          Settings
        </Typography>
        <IconButton onClick={closeSettings} aria-label="Close settings" size="small">
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 2 }}>
        <Box className="settings-section" sx={{ mb: 3 }}>
          <Typography variant="overline" sx={{ color: 'primary.main', display: 'block', mb: 0.5 }}>
            Color theme
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.disabled', mb: 2 }}>
            Pick an accent palette for the site. Your selection is saved automatically.
          </Typography>
          <ColorThemePicker />
        </Box>

        <Box className="settings-section">
          <Typography variant="overline" sx={{ color: 'primary.main', display: 'block', mb: 0.5 }}>
            Typography
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.disabled', mb: 2 }}>
            Choose a font style for the site. Your selection is saved automatically.
          </Typography>
          <FontPresetPicker />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={closeSettings} variant="outlined" color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default SettingsDialog;
