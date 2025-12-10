import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Divider,
  Tabs,
  Tab,
  Fab,
  useTheme,
  useMediaQuery,
  Snackbar,
  Alert,
  LinearProgress,
  IconButton
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SettingsIcon from "@mui/icons-material/Settings";
import TransactionList from "./TransactionList";
import TransactionFormModal from "./TransactionFormModal";
import BudgetModal from "./BudgetModal";
import useNotificationManager from "./NotificationManager";
import { processRecurringExpenses } from "./RecurringExpenseManager";
import { db } from "../firebase/config";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  where
} from "firebase/firestore";
import dayjs from "dayjs";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState("today");
  const [modalOpen, setModalOpen] = useState(false);
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  
  // Persist budget in local storage for now (keyed by uid)
  const [budget, setBudget] = useState(() => {
    return Number(localStorage.getItem(`monthlyBudget_${currentUser?.uid}`)) || 0;
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Initialize Notification Manager
  useNotificationManager(transactions, budget);

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Fetch transactions
  useEffect(() => {
    if (!currentUser) return;

    async function fetchData() {
      try {
        // Check for recurring expenses first (pass uid)
        await processRecurringExpenses(currentUser.uid, showSnackbar);

        let q = query(
          collection(db, "transactions"), 
          where("uid", "==", currentUser.uid),
          orderBy("date", "desc")
        );
        const snapshot = await getDocs(q);
        // Ensure doc.id overwrites any 'id' field in the data
        let docs = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        setTransactions(docs);
      } catch (error) {
        console.error("Error fetching transactions:", error);
        showSnackbar("Failed to load transactions", "error");
      }
    }
    fetchData();
  }, [currentUser]);

  const handleSaveBudget = (newBudget) => {
    setBudget(newBudget);
    localStorage.setItem(`monthlyBudget_${currentUser.uid}`, newBudget);
    showSnackbar("Monthly budget updated");
  };

  const getFilteredTransactions = () => {
    const now = dayjs();
    if (filter === "today") {
      return transactions.filter((txn) => dayjs(txn.date).isSame(now, "day"));
    } else if (filter === "yesterday") {
      return transactions.filter((txn) =>
        dayjs(txn.date).isSame(now.subtract(1, "day"), "day")
      );
    } else if (filter === "month") {
      return transactions.filter((txn) => dayjs(txn.date).isSame(now, "month"));
    }
    return transactions;
  };

  const handleAddClick = () => {
    setEditingTransaction(null);
    setModalOpen(true);
  };

  const handleEditClick = (txn) => {
    setEditingTransaction(txn);
    setModalOpen(true);
  };

  const handleModalSubmit = async (txnData) => {
    if (editingTransaction && editingTransaction.id) {
      // Edit existing
      const updatedTxn = { ...editingTransaction, ...txnData };
      
      // Optimistic Update
      setTransactions((prev) => 
        prev.map((t) => (t.id === editingTransaction.id ? updatedTxn : t))
      );

      try {
        await updateDoc(doc(db, "transactions", editingTransaction.id), txnData);
        showSnackbar("Transaction updated successfully");
      } catch (error) {
        console.error("Error updating document:", error);
        showSnackbar("Failed to update transaction", "error");
      }
    } else {
      // Add new
      // Optimistic Update (temporary ID)
      const tempId = Date.now().toString();
      const newTxn = { id: tempId, ...txnData };
      setTransactions((prev) => [newTxn, ...prev]);

      try {
        const docRef = await addDoc(collection(db, "transactions"), { ...txnData, uid: currentUser.uid });
        
        // Handle Recurring Rule Creation
        if (txnData.isRecurring) {
          const recurringData = {
            uid: currentUser.uid,
            type: txnData.type,
            amount: txnData.amount,
            note: txnData.note,
            category: txnData.category,
            frequency: txnData.recurrenceFrequency,
            nextDueDate: txnData.nextDueDate || dayjs(txnData.date).add(
              txnData.recurrenceFrequency === 'Weekly' ? 1 : 
              txnData.recurrenceFrequency === 'Monthly' ? 1 : 1, 
              txnData.recurrenceFrequency === 'Weekly' ? 'week' : 
              txnData.recurrenceFrequency === 'Monthly' ? 'month' : 'year'
            ).format("YYYY-MM-DD")
          };
          await addDoc(collection(db, "recurring_expenses"), recurringData);
          showSnackbar("Recurring rule created");
        }

        // Update with real ID
        setTransactions((prev) => 
          prev.map((t) => (t.id === tempId ? { ...t, id: docRef.id, uid: currentUser.uid } : t))
        );
        showSnackbar("Transaction added successfully");
      } catch (error) {
        console.error("Error adding document:", error);
        setTransactions((prev) => prev.filter((t) => t.id !== tempId));
        showSnackbar(`Failed to add transaction: ${error.message}`, "error");
      }
    }
  };

  const deleteTransaction = async (id) => {
    // Optimistic Update
    const backup = transactions;
    setTransactions((prev) => prev.filter((t) => t.id !== id));

    try {
      await deleteDoc(doc(db, "transactions", id));
      showSnackbar("Transaction deleted successfully");
    } catch (error) {
      console.error("Error deleting document:", error);
      setTransactions(backup);
      showSnackbar(`Failed to delete transaction: ${error.message}`, "error");
    }
  };

  // Calculate stats based on ALL transactions (or filtered? usually stats are for current view)
  // Let's stick to filtered view for stats to make it dynamic
  const filteredTransactions = getFilteredTransactions();
  
  let income = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((acc, curr) => acc + Number(curr.amount), 0);
  let expense = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((acc, curr) => acc + Number(curr.amount), 0);
  let balance = income - expense;

  // Calculate monthly expense for budget progress
  const currentMonthExpenses = transactions
    .filter(t => t.type === 'expense' && dayjs(t.date).isSame(dayjs(), 'month'))
    .reduce((acc, curr) => acc + Number(curr.amount), 0);
  
  const budgetProgress = budget > 0 ? Math.min((currentMonthExpenses / budget) * 100, 100) : 0;

  return (
    <Box sx={{ pb: 10 }}>
      <Card 
        sx={{ 
          mb: 3, 
          background: (theme) => theme.palette.mode === 'dark' 
            ? 'linear-gradient(135deg, #312e81 0%, #4c1d95 100%)' // Darker gradient for dark mode
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          color: 'white',
          borderRadius: 4,
          boxShadow: '0 10px 20px rgba(0,0,0,0.15)',
          position: 'relative'
        }}
      >
        <IconButton 
          sx={{ position: 'absolute', top: 10, right: 10, color: 'rgba(255,255,255,0.7)' }}
          onClick={() => setBudgetModalOpen(true)}
        >
          <SettingsIcon />
        </IconButton>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="subtitle1" sx={{ opacity: 0.8 }}>Total Balance</Typography>
          <Typography variant="h3" sx={{ fontWeight: 'bold', my: 1 }}>
            ₹{balance.toLocaleString()}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 3 }}>
            <Box>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>Income</Typography>
              <Typography variant="h6" sx={{ color: '#4ade80', fontWeight: 'bold' }}>
                +₹{income.toLocaleString()}
              </Typography>
            </Box>
            <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
            <Box>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>Expense</Typography>
              <Typography variant="h6" sx={{ color: '#f87171', fontWeight: 'bold' }}>
                -₹{expense.toLocaleString()}
              </Typography>
            </Box>
          </Box>
          
          {budget > 0 && (
            <Box sx={{ mt: 3, textAlign: 'left' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  Monthly Budget: ₹{currentMonthExpenses} / ₹{budget}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  {budgetProgress.toFixed(0)}%
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={budgetProgress} 
                sx={{ 
                  height: 6, 
                  borderRadius: 3,
                  bgcolor: 'rgba(255,255,255,0.2)',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: budgetProgress > 90 ? '#ef4444' : '#4ade80'
                  }
                }} 
              />
            </Box>
          )}
        </CardContent>
      </Card>

      <Tabs 
        value={filter} 
        onChange={(e, val) => setFilter(val)} 
        centered={!isMobile}
        variant={isMobile ? "fullWidth" : "standard"}
        sx={{ 
          mb: 3, 
          '& .MuiTab-root': { 
            fontWeight: 'bold',
            color: 'text.secondary',
            '&.Mui-selected': { color: 'primary.main' }
          } 
        }}
      >
        <Tab label="Today" value="today" />
        <Tab label="Yesterday" value="yesterday" />
        <Tab label="Month" value="month" />
        <Tab label="All" value="" />
      </Tabs>

      <TransactionList
        transactions={filteredTransactions}
        onEditClick={handleEditClick}
        onDelete={deleteTransaction}
      />

      <Fab 
        color="primary" 
        aria-label="add" 
        sx={{ 
          position: 'fixed', 
          bottom: 32, 
          right: 32,
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)'
        }}
        onClick={handleAddClick}
      >
        <AddIcon />
      </Fab>

      <TransactionFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={editingTransaction}
      />

      <BudgetModal
        open={budgetModalOpen}
        onClose={() => setBudgetModalOpen(false)}
        onSave={handleSaveBudget}
        currentBudget={budget}
      />
      
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Dashboard;
