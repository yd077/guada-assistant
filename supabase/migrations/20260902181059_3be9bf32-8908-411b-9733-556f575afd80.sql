revoke all on function public.unlock_lead(uuid) from anon;
revoke all on function public.submit_review(uuid, integer, text) from anon;
revoke all on function public.admin_refund_unlock(uuid, text) from anon;
revoke all on function public.admin_approve_dispute(uuid, text) from anon;
revoke all on function public.admin_reject_dispute(uuid, text) from anon;
revoke all on function public.verify_project_otp(text, text) from anon;