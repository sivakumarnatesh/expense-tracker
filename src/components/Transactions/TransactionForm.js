import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import Store from "../../config/store";

function TransactionForm() {
  const addTransaction = Store((state) => state.addTransaction);
  const [form, setForm] = useState({ amount: "", type: "expense", label: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.amount || !form.label) return;
    addTransaction({ ...form, id: uuidv4() });
    setForm({ amount: "", type: "expense", label: "" });
  };

  return (
    <form
      style={{
        display: "flex",
        gap: 8,
        flexWrap: "wrap",
        marginBottom: 16,
      }}
      onSubmit={handleSubmit}
    >
      <input
        type="text"
        value={form.label}
        onChange={(e) => setForm({ ...form, label: e.target.value })}
        placeholder="Label"
        required
        style={{ flex: "2 1 100px" }}
      />
      <input
        type="number"
        value={form.amount}
        onChange={(e) => setForm({ ...form, amount: e.target.value })}
        placeholder="Amount"
        required
        style={{ flex: "1 1 50px" }}
      />
      <select
        value={form.type}
        onChange={(e) => setForm({ ...form, type: e.target.value })}
        style={{ flex: "1 1 70px" }}
      >
        <option value="expense">Expense</option>
        <option value="income">Income</option>
      </select>
      <button type="submit" style={{ flex: "1 1 60px" }}>
        Add
      </button>
    </form>
  );
}

export default TransactionForm;
