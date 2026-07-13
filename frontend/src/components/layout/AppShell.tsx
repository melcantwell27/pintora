"use client";

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Toolbar from "@mui/material/Toolbar";

import { AddCreamiFab } from "./AddCreamiFab";
import { BottomNav } from "./BottomNav";
import { Wordmark } from "./Wordmark";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ minHeight: "100dvh", bgcolor: "background.default" }}>
      <AppBar
        position="sticky"
        color="default"
        elevation={0}
        sx={{ borderBottom: "1px solid", borderColor: "divider" }}
      >
        <Toolbar sx={{ justifyContent: "center" }}>
          <Wordmark />
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" component="main" sx={{ py: 2, pb: 12 }}>
        {children}
      </Container>

      <AddCreamiFab />
      <BottomNav />
    </Box>
  );
}
