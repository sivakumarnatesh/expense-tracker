import {
  List,
  IconButton,
  Typography,
  Card,
  Box,
  Avatar,
  Stack,
  Tooltip,
  Chip
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/EditOutlined";
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import dayjs from "dayjs";

export default function TransactionList({
  transactions,
  onEditClick,
  onDelete,
}) {
  if (!transactions.length)
    return (
      <Box sx={{ textAlign: 'center', mt: 5, opacity: 0.6 }}>
        <Typography variant="h6">No transactions found</Typography>
        <Typography variant="body2">Add a new transaction to get started</Typography>
      </Box>
    );

  return (
    <Stack spacing={2} sx={{ width: '100%' }}>
      {transactions.map((txn) => (
        <Card 
          key={txn.id} 
          sx={{ 
            p: 2,
            boxShadow: (theme) => theme.palette.mode === 'dark' ? '0 4px 20px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.05)',
            bgcolor: 'background.paper',
            borderRadius: 3,
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: (theme) => theme.palette.mode === 'dark' ? '0 8px 30px rgba(0,0,0,0.5)' : '0 4px 12px rgba(0,0,0,0.1)'
            }
          }}
        >
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            alignItems={{ xs: 'flex-start', sm: 'center' }} 
            justifyContent="space-between"
            spacing={{ xs: 2, sm: 0 }}
          >
            {/* Left Side: Icon + Info */}
            <Stack direction="row" alignItems="center" spacing={2} sx={{ width: '100%' }}>
              <Avatar 
                sx={{ 
                  bgcolor: txn.type === 'income' ? 'success.light' : 'error.light',
                  color: txn.type === 'income' ? 'success.dark' : 'error.dark',
                  width: 48,
                  height: 48
                }}
              >
                {txn.type === 'income' ? <TrendingUpIcon /> : <TrendingDownIcon />}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ lineHeight: 1.2 }}>
                  {txn.note || "Untitled"}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                  <Typography variant="body2" color="text.secondary">
                    {dayjs(txn.date).format("DD MMM, YYYY")}
                  </Typography>
                  {txn.category && (
                    <Chip 
                      label={txn.category} 
                      size="small" 
                      variant="outlined" 
                      sx={{ height: 20, fontSize: '0.7rem' }} 
                    />
                  )}
                </Stack>
              </Box>
            </Stack>

            {/* Right Side: Amount + Actions */}
            <Stack 
              direction="row" 
              alignItems="center" 
              spacing={2}
              sx={{ 
                width: { xs: '100%', sm: 'auto' },
                justifyContent: { xs: 'space-between', sm: 'flex-end' },
                pl: { xs: 8, sm: 0 } // Align with text on mobile (48px avatar + 16px gap)
              }}
            >
              <Typography 
                variant="h6" 
                fontWeight="bold"
                sx={{ 
                  color: txn.type === 'income' ? 'success.main' : 'error.main',
                  textAlign: { xs: 'left', sm: 'right' },
                  minWidth: { sm: '120px' }, // Ensure consistent width on desktop
                  whiteSpace: 'nowrap'
                }}
              >
                {txn.type === 'income' ? "+" : "-"} ₹{Number(txn.amount).toLocaleString()}
              </Typography>
              
              <Stack direction="row" spacing={1}>
                <Tooltip title="Edit">
                  <IconButton 
                    onClick={() => onEditClick(txn)} 
                    size="small"
                    sx={{ 
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      '&:hover': { bgcolor: 'primary.light', color: 'primary.main', borderColor: 'primary.main' }
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton 
                    onClick={() => onDelete(txn.id)} 
                    size="small"
                    sx={{ 
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      '&:hover': { bgcolor: 'error.light', color: 'error.main', borderColor: 'error.main' }
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>
          </Stack>
        </Card>
      ))}
    </Stack>
  );
}
