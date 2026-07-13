"use client";

import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import { useState } from "react";

import { RecipeFeedList } from "@/components/recipe/RecipeFeedList";
import { useRecipes } from "@/hooks/useRecipes";

export function SearchView() {
  const [term, setTerm] = useState("");
  const trimmed = term.trim();
  const { data, isLoading, isError } = useRecipes(trimmed || undefined);

  return (
    <>
      <TextField
        fullWidth
        placeholder="Search recipes or ingredients…"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        sx={{ mb: 2 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          },
        }}
      />
      <RecipeFeedList
        recipes={data?.results}
        isLoading={isLoading}
        isError={isError}
        emptyMessage={
          trimmed ? `No recipes match “${trimmed}”.` : "Start typing to search."
        }
      />
    </>
  );
}
