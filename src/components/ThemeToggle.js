import { Switch } from "@mui/material";
import { useThemeContext } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { mode, setMode } = useThemeContext();
  return (
    <Switch
      checked={mode === "dark"}
      onChange={() => setMode(mode === "light" ? "dark" : "light")}
      color="primary"
    />
  );
}
