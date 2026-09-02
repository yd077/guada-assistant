alter view public.available_leads set (security_invoker = true);

alter function public.extract_budget_eur(text) set search_path = public;
alter function public.compute_lead_price(text, integer, public.client_type, public.urgency_level) set search_path = public;
alter function public.set_project_lead_price() set search_path = public;

revoke all on function public.has_role(uuid, public.app_role) from public, anon;
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.create_wallet_for_new_artisan() from public, anon, authenticated;
revoke all on function public.create_subscription_for_new_artisan() from public, anon, authenticated;
revoke all on function public.admin_adjust_wallet(uuid, integer, public.credit_tx_type, text, uuid) from public, anon;
revoke all on function public.client_mark_contacted(uuid) from public, anon;

grant execute on function public.has_role(uuid, public.app_role) to authenticated;
grant execute on function public.admin_adjust_wallet(uuid, integer, public.credit_tx_type, text, uuid) to authenticated, service_role;
grant execute on function public.client_mark_contacted(uuid) to authenticated, service_role;