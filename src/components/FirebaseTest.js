import { useState } from "react";
import { db } from "../firebase/config";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { Box, Button, Typography, Alert, CircularProgress } from "@mui/material";

export default function FirebaseTest() {
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [details, setDetails] = useState("");

  const runTest = async () => {
    setStatus("loading");
    setMessage("Testing connection...");
    setDetails("");

    try {
      // 1. Test Write
      setMessage("Attempting to write to 'test_collection'...");
      const docRef = await addDoc(collection(db, "test_collection"), {
        timestamp: new Date(),
        test: "Hello Firebase"
      });
      setMessage(`Write successful! Doc ID: ${docRef.id}`);

      // 2. Test Read
      setMessage("Attempting to read from 'test_collection'...");
      const snapshot = await getDocs(collection(db, "test_collection"));
      setMessage(`Read successful! Found ${snapshot.size} documents.`);
      setStatus("success");
    } catch (error) {
      console.error("Firebase Test Error:", error);
      setStatus("error");
      setMessage("Connection Failed");
      setDetails(error.message);
      
      if (error.code === "permission-denied") {
        setDetails("Permission Denied: Check your Firestore Security Rules. They might be set to 'allow read, write: if false;'. Change them to 'allow read, write: if true;' for testing.");
      } else if (error.code === "unavailable") {
        setDetails("Network Error: Check your internet connection or if the client is offline.");
      }
    }
  };

  return (
    <Box sx={{ p: 3, border: '1px dashed grey', m: 2, borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>Firebase Connection Diagnostic</Typography>
      <Button variant="contained" onClick={runTest} disabled={status === "loading"}>
        {status === "loading" ? <CircularProgress size={24} /> : "Run Test"}
      </Button>
      
      {message && (
        <Alert severity={status === "error" ? "error" : "info"} sx={{ mt: 2 }}>
          {message}
        </Alert>
      )}
      
      {details && (
        <Box sx={{ mt: 2, p: 2, bgcolor: '#f0f0f0', borderRadius: 1, fontFamily: 'monospace' }}>
          <Typography variant="caption" color="error">{details}</Typography>
        </Box>
      )}
    </Box>
  );
}
