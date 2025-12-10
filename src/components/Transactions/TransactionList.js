import Store from "../../config/store";

function TransactionList() {
  const transactions = Store((state) => state.transactions);
  const removeTransaction = Store((state) => state.removeTransaction);

  return (
    <ul style={{ listStyle: "none", padding: 0 }}>
      {transactions.map((tx) => (
        <li
          key={tx.id}
          style={{
            display: "flex",
            justifyContent: "space-between",
            borderBottom: "1px solid #eee",
            padding: "8px 0",
          }}
        >
          <span>
            {tx.label} ({tx.type})
          </span>
          <span>
            ₹{tx.amount}
            <button
              onClick={() => removeTransaction(tx.id)}
              style={{
                marginLeft: 10,
                color: "#d32f2f",
                background: "none",
                border: "none",
              }}
            >
              ❌
            </button>
          </span>
        </li>
      ))}
    </ul>
  );
}

export default TransactionList;
