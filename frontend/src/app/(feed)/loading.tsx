import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";

/** Streaming shell shown while a page's server prefetch is in flight. */
export default function Loading() {
  return (
    <Stack spacing={2}>
      <Skeleton variant="text" width="50%" height={40} />
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} variant="rounded" height={120} />
      ))}
    </Stack>
  );
}
