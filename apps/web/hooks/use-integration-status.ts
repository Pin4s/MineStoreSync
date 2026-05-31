"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { ApiError, getIntegrationStatus } from "@/lib/api";
import { clearStoredAuthToken } from "@/lib/auth";
import { normalizeIntegrationStatus, type IntegrationStatus } from "@/lib/dashboard";

export function useIntegrationStatus() {
  const [integration, setIntegration] = useState<IntegrationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);
  const router = useRouter();

  useEffect(() => {
    mountedRef.current = true;

    async function load() {
      try {
        const data = await getIntegrationStatus<IntegrationStatus>();
        if (!mountedRef.current) return;
        setIntegration(normalizeIntegrationStatus(data));
      } catch (error) {
        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          clearStoredAuthToken();
          router.replace("/login?session=expired");
          return;
        }
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    }

    void load();

    return () => { mountedRef.current = false; };
  }, [router]);

  return { integration, loading };
}