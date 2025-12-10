import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  InputAdornment
} from "@mui/material";

export default function BudgetModal({ open, onClose, onSave, currentBudget }) {
  const [budget, setBudget] = useState("");

  useEffect(() => {
    if (currentBudget) {
      setBudget(currentBudget);
    }
  }, [currentBudget, open]);

  const handleSave = () => {
    if (!budget || isNaN(budget) || Number(budget) < 0) return;
    onSave(Number(budget));
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Set Monthly Budget</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Monthly Budget"
          type="number"
          fullWidth
          variant="outlined"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  );
}
