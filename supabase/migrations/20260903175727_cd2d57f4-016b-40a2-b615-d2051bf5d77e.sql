-- 1. Profils : fin de la lecture publique
DROP POLICY IF EXISTS "profiles_public_read" ON public.profiles;
DROP POLICY IF EXISTS "Profils visibles par tous (lecture)" ON public.profiles;

CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));

REVOKE SELECT ON public.profiles FROM anon;

-- 2. Fonctions SECURITY DEFINER : restreindre l'exécution
REVOKE EXECUTE ON FUNCTION public.admin_adjust_wallet(uuid, integer, public.credit_tx_type, text, uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_approve_dispute(uuid, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.admin_reject_dispute(uuid, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.admin_refund_unlock(uuid, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.client_mark_contacted(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.submit_review(uuid, integer, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.unlock_lead(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
