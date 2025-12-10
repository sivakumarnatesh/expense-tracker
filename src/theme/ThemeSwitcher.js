// import Store from "../config/store";

//  function ThemeSwitcher() {
//   const theme = Store((state) => state.theme);
//   const setTheme = Store((state) => state.setTheme);

//   return (
//     <div style={{ marginBottom: 12 }}>
//       <button
//         onClick={() => setTheme("light")}
//         style={{
//           marginRight: 6,
//           fontWeight: theme === "light" ? "bold" : "normal",
//         }}
//       >
//         Light
//       </button>
//       <button
//         onClick={() => setTheme("dark")}
//         style={{
//           marginRight: 6,
//           fontWeight: theme === "dark" ? "bold" : "normal",
//         }}
//       >
//         Dark
//       </button>
//       <button
//         onClick={() => setTheme("unique")}
//         style={{ fontWeight: theme === "unique" ? "bold" : "normal" }}
//       >
//         Unique
//       </button>
//     </div>
//   );
// }

// export default ThemeSwitcher;

import Store  from "../config/store";

function ThemeSwitcher() {
  const theme = Store((state) => state.theme);
  const setTheme = Store((state) => state.setTheme);

  // Toggle handler (optional radio switch style)
  const handleToggle = (selectedTheme) => {
    setTheme(selectedTheme);
  };

  return (
    <div
      style={{
        marginBottom: 16,
        display: "flex",
        gap: 8,
        justifyContent: "center",
        alignItems: "center",
        background: "#333",
        borderRadius: 20,
        padding: 8,
      }}
    >
      <button
        onClick={() => handleToggle("light")}
        style={{
          padding: "6px 18px",
          borderRadius: 12,
          border: "none",
          background: theme === "light" ? "#ffd700" : "#222",
          color: theme === "light" ? "#333" : "#fff",
          fontWeight: theme === "light" ? "bold" : "normal",
          transition: "0.2s",
          cursor: "pointer",
        }}
      >
        ☀️ Light
      </button>
      <button
        onClick={() => handleToggle("dark")}
        style={{
          padding: "6px 18px",
          borderRadius: 12,
          border: "none",
          background: theme === "dark" ? "#333" : "#222",
          color: theme === "dark" ? "#ffd700" : "#fff",
          fontWeight: theme === "dark" ? "bold" : "normal",
          transition: "0.2s",
          cursor: "pointer",
        }}
      >
        🌙 Dark
      </button>
      <button
        onClick={() => handleToggle("unique")}
        style={{
          padding: "6px 18px",
          borderRadius: 12,
          border: "none",
          background: theme === "unique" ? "linear-gradient(90deg, #ffedbc, #ed4264)" : "#222",
          color: theme === "unique" ? "#fff" : "#ff6e7f",
          fontWeight: theme === "unique" ? "bold" : "normal",
          transition: "0.2s",
          cursor: "pointer",
        }}
      >
        🦄 Unique
      </button>
    </div>
  );
}

export default ThemeSwitcher;
