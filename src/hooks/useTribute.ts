// src/hooks/useTribute.ts
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";

export interface Tribute {
  id: string;
  owner_id: string | null;
  is_published: boolean;
  // add other columns you care about (recipient, message, etc.)
}

/**
 * Reads a single tribute row by id and exposes a refresh() helper.
 */
export function useTribute(id?: string) {
  const [tribute, setTribute] = useState<Tribute | null>(null);
  const [loading, setLoading] = useState<boolean>(!!id);
  const [error, setError] = useState<string | null>(null);

  const fetchOnce = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("tributes")
      .select("*")
      .eq("id", id)
      .single();
    setLoading(false);
    if (error) setError(error.message);
    else setTribute(data as Tribute);
  }, [id]);

  // fetch on mount / id change
  useEffect(() => {
    fetchOnce();
  }, [fetchOnce]);

  return {
    tribute,
    loading,
    error,
    refreshTribute: fetchOnce,
  };
}
