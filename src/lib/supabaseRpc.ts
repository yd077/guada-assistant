import { supabase } from "@/integrations/supabase/client";

type RpcError = { message: string } | null;

type RpcClient = {
  rpc: (
    name: string,
    args: Record<string, unknown>,
  ) => Promise<{ data: unknown; error: RpcError }>;
};

const typedRpc = supabase as unknown as RpcClient;

export async function callRpc(name: string, args: Record<string, unknown> = {}) {
  return typedRpc.rpc(name, args);
}
