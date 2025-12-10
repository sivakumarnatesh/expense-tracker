import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  Stack,
  IconButton,
  Tooltip,
  CircularProgress,
  Typography,
  Checkbox,
  FormControlLabel
} from "@mui/material";
import MicIcon from "@mui/icons-material/Mic";
import dayjs from "dayjs";

export default function TransactionFormModal({ open, onClose, onSubmit, initialData }) {
  const [form, setForm] = useState({
    type: "expense",
    amount: "",
    note: "",
    date: dayjs().format("YYYY-MM-DD"),
    isSubscription: false,
    renewalDate: ""
  });
  const [errors, setErrors] = useState({});
  const [listening, setListening] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        ...initialData,
        date: dayjs(initialData.date).format("YYYY-MM-DD"),
        category: initialData.category || "Others"
      });
    } else {
      setForm({
        type: "expense",
        amount: "",
        note: "",
        date: dayjs().format("YYYY-MM-DD"),
        category: "Others",
        isRecurring: false,
        recurrenceFrequency: "Monthly",
        nextDueDate: ""
      });
    }
    setErrors({});
  }, [initialData, open]);

  const validate = () => {
    let tempErrors = {};
    if (!form.amount) tempErrors.amount = "Amount is required";
    if (!form.note) tempErrors.note = "Note is required";
    if (!form.date) tempErrors.date = "Date is required";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const handleSubmit = () => {
    if (!validate()) return;
    
    const finalCategory = form.category === 'custom' ? form.customCategory : form.category;

    onSubmit({
      ...form,
      amount: Number(form.amount),
      date: dayjs(form.date).toISOString(),
      category: finalCategory || "Others"
    });
    onClose();
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Voice input is not supported in this browser.");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-IN'; // Optimized for Indian English
    recognition.interimResults = false;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log("Voice Input:", transcript);
      parseVoiceInput(transcript);
    };

    recognition.start();
  };

  const parseVoiceInput = (text) => {
    const lowerText = text.toLowerCase();
    let newForm = { ...form };

    // Detect Type
    if (lowerText.includes("income") || lowerText.includes("salary") || lowerText.includes("credit")) {
      newForm.type = "income";
    } else if (lowerText.includes("expense") || lowerText.includes("spent") || lowerText.includes("paid")) {
      newForm.type = "expense";
    }

    // Detect Amount (handle "crore", "lakh", "thousand" and commas)
    // Regex to match numbers, potentially with commas, followed by optional multipliers
    const amountRegex = /([\d,]+(?:\.\d+)?)\s*(crore|lakh|thousand)?/i;
    const amountMatch = text.match(amountRegex);

    if (amountMatch) {
      let rawNumber = amountMatch[1].replace(/,/g, ''); // Remove commas
      let multiplier = 1;
      
      if (amountMatch[2]) {
        const unit = amountMatch[2].toLowerCase();
        if (unit === 'crore') multiplier = 10000000;
        else if (unit === 'lakh') multiplier = 100000;
        else if (unit === 'thousand') multiplier = 1000;
      }

      const parsedAmount = parseFloat(rawNumber);
      if (!isNaN(parsedAmount)) {
        newForm.amount = parsedAmount * multiplier;
      }
    }

    // Detect Note (everything else, cleanup keywords)
    let note = text
      .replace(amountRegex, "") // Remove amount
      .replace(/income|expense|spent|paid|salary|credit/gi, "") // Remove keywords
      .replace(/rupees|rs|in/gi, "") // Remove currency words
      .trim();
    
    // Capitalize first letter
    if (note) {
      newForm.note = note.charAt(0).toUpperCase() + note.slice(1);
    }

    setForm(newForm);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {initialData ? "Edit Transaction" : "Add Transaction"}
        <Tooltip title="Voice Input (e.g. 'Spent 500 rupees for lunch')">
          <IconButton onClick={startListening} color={listening ? "error" : "primary"}>
            {listening ? <CircularProgress size={24} /> : <MicIcon />}
          </IconButton>
        </Tooltip>
      </DialogTitle>
      <DialogContent>
        {listening && (
          <Typography variant="caption" color="error" sx={{ display: 'block', mb: 2 }}>
            Listening... Speak now.
          </Typography>
        )}
        <Stack spacing={3} sx={{ mt: 1 }}>
          <TextField
            select
            label="Type"
            name="type"
            value={form.type}
            onChange={handleChange}
            fullWidth
            variant="outlined"
          >
            <MenuItem value="income">Income</MenuItem>
            <MenuItem value="expense">Expense</MenuItem>
          </TextField>
          <TextField
            label="Amount"
            name="amount"
            type="number"
            value={form.amount}
            onChange={handleChange}
            fullWidth
            variant="outlined"
            InputProps={{ inputProps: { min: 0 } }}
            error={!!errors.amount}
            helperText={errors.amount}
          />
          <TextField
            label="Note"
            name="note"
            value={form.note}
            onChange={handleChange}
            fullWidth
            variant="outlined"
            error={!!errors.note}
            helperText={errors.note}
          />
          <TextField
            select
            label="Category"
            name="category"
            value={form.category}
            onChange={(e) => {
              if (e.target.value === 'custom') {
                setForm({ ...form, category: 'custom', customCategory: '' });
              } else {
                setForm({ ...form, category: e.target.value });
              }
            }}
            fullWidth
            variant="outlined"
            error={!!errors.category}
            helperText={errors.category}
          >
            {["Food", "Travel", "Bills", "Shopping", "Salary", "Investment", "Health", "Entertainment", "Education", "Others"].map((cat) => (
              <MenuItem key={cat} value={cat}>{cat}</MenuItem>
            ))}
            <MenuItem value="custom"><em>+ Add Custom Category</em></MenuItem>
          </TextField>

          {form.category === 'custom' && (
            <TextField
              label="Custom Category Name"
              value={form.customCategory || ''}
              onChange={(e) => setForm({ ...form, customCategory: e.target.value })}
              fullWidth
              variant="outlined"
              placeholder="e.g. Gym, Pet Care"
            />
          )}

          <TextField
            label="Date"
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            fullWidth
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            error={!!errors.date}
            helperText={errors.date}
          />
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.isRecurring || false}
                  onChange={(e) => setForm({ ...form, isRecurring: e.target.checked })}
                  name="isRecurring"
                />
              }
              label="Recurring Payment?"
            />
          </Box>

          {form.isRecurring && (
            <Stack spacing={2}>
              <TextField
                select
                label="Frequency"
                name="recurrenceFrequency"
                value={form.recurrenceFrequency || "Monthly"}
                onChange={handleChange}
                fullWidth
                variant="outlined"
              >
                <MenuItem value="Weekly">Weekly</MenuItem>
                <MenuItem value="Monthly">Monthly</MenuItem>
                <MenuItem value="Yearly">Yearly</MenuItem>
              </TextField>
              <TextField
                label="Next Due Date"
                name="nextDueDate"
                type="date"
                value={form.nextDueDate || ""}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                helperText="We'll automatically add this transaction when due"
              />
            </Stack>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {initialData ? "Update" : "Add"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
