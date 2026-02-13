"use client";

import { useQuery } from "@tanstack/react-query";

import { getSession } from "@/modules/auth/api";

export function useSessionQuery() {
  return useQuery({
    queryKey: ["session"],
    queryFn: getSession,
    staleTime: 60_000
  });
}
