"use client";

import { useQuery } from "@tanstack/react-query";

import { tagListQuery } from "@/lib/queries";

export function useTags() {
  return useQuery(tagListQuery());
}
