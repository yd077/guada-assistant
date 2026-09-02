create or replace function public.verify_project_email(_token text)
returns table (project_id uuid, contact_email text, ok boolean)
language plpgsql security definer set search_path = public
as $$
declare v_project public.projects%rowtype;
begin
  select * into v_project from public.projects where email_verification_token = _token limit 1;
  if not found then return query select null::uuid, null::text, false; return; end if;
  update public.projects set email_verified = true, email_verified_at = now(), email_verification_token = null where id = v_project.id;
  return query select v_project.id, v_project.contact_email, true;
end;
$$;

create or replace function public.verify_project_otp(_token text, _code text)
returns table (project_id uuid, ok boolean, reason text)
language plpgsql security definer set search_path = public
as $$
declare v_project public.projects%rowtype;
begin
  select * into v_project from public.projects where email_verification_token = _token limit 1;
  if not found then return query select null::uuid, false, 'invalid_token'; return; end if;
  if v_project.email_verified then return query select v_project.id, true, 'already_verified'; return; end if;
  if v_project.email_otp_expires_at is null or v_project.email_otp_expires_at < now() then return query select v_project.id, false, 'expired'; return; end if;
  if v_project.email_otp_attempts >= 5 then return query select v_project.id, false, 'too_many_attempts'; return; end if;
  if v_project.email_otp_code is null or v_project.email_otp_code <> _code then
    update public.projects set email_otp_attempts = email_otp_attempts + 1 where id = v_project.id;
    return query select v_project.id, false, 'wrong_code'; return;
  end if;
  update public.projects set email_verified = true, email_verified_at = now(), email_otp_code = null, email_verification_token = null where id = v_project.id;
  return query select v_project.id, true, 'ok';
end;
$$;

create or replace function public.unlock_lead(p_project_id uuid)
returns json
language plpgsql security definer set search_path = public
as $$
declare
  v_artisan_id uuid; v_price int; v_balance int; v_existing uuid; v_project public.projects%rowtype;
begin
  select id into v_artisan_id from public.artisans where user_id = auth.uid() limit 1;
  if v_artisan_id is null then return json_build_object('ok', false, 'error', 'no_artisan_profile'); end if;
  select id into v_existing from public.lead_unlocks where artisan_id = v_artisan_id and project_id = p_project_id;
  if v_existing is not null then return json_build_object('ok', true, 'already_unlocked', true); end if;
  select * into v_project from public.projects where id = p_project_id and status = 'open';
  if not found then return json_build_object('ok', false, 'error', 'project_not_available'); end if;
  v_price := coalesce(v_project.lead_price_credits, 8);
  select credits_balance into v_balance from public.artisan_wallets where artisan_id = v_artisan_id for update;
  if v_balance is null or v_balance < v_price then return json_build_object('ok', false, 'error', 'insufficient_credits', 'required', v_price, 'balance', coalesce(v_balance, 0)); end if;
  update public.artisan_wallets set credits_balance = credits_balance - v_price, updated_at = now() where artisan_id = v_artisan_id;
  insert into public.credit_transactions (artisan_id, type, amount, reference_id, note) values (v_artisan_id, 'lead_unlock', -v_price, p_project_id, 'Déblocage lead');
  insert into public.lead_unlocks (artisan_id, project_id, credits_spent, deadline_at) values (v_artisan_id, p_project_id, v_price, now() + interval '24 hours');
  return json_build_object('ok', true, 'spent', v_price, 'balance', v_balance - v_price);
end;
$$;

create or replace function public.submit_review(p_artisan_id uuid, p_rating int, p_comment text default null)
returns json
language plpgsql security definer set search_path = public
as $$
declare v_review_id uuid; v_existing uuid;
begin
  if auth.uid() is null then return json_build_object('ok', false, 'error', 'auth_required'); end if;
  if p_rating < 1 or p_rating > 5 then return json_build_object('ok', false, 'error', 'invalid_rating'); end if;
  if not exists (select 1 from public.lead_unlocks u join public.projects p on p.id = u.project_id where u.artisan_id = p_artisan_id and p.client_id = auth.uid()) then return json_build_object('ok', false, 'error', 'no_relationship'); end if;
  select id into v_existing from public.reviews where artisan_id = p_artisan_id and author_id = auth.uid();
  if v_existing is null then
    insert into public.reviews (artisan_id, author_id, rating, comment) values (p_artisan_id, auth.uid(), p_rating, p_comment) returning id into v_review_id;
  else
    update public.reviews set rating = p_rating, comment = p_comment, created_at = now() where id = v_existing returning id into v_review_id;
  end if;
  update public.artisans a set rating = stats.avg_rating, reviews_count = stats.review_count from (select avg(rating)::numeric(3,2) avg_rating, count(*)::int review_count from public.reviews where artisan_id = p_artisan_id) stats where a.id = p_artisan_id;
  return json_build_object('ok', true, 'review_id', v_review_id);
end;
$$;

create or replace function public.admin_refund_unlock(p_unlock_id uuid, p_note text default null)
returns json
language plpgsql security definer set search_path = public
as $$
declare v_artisan_id uuid; v_amount int; v_project_id uuid;
begin
  if not public.has_role(auth.uid(), 'admin') then return json_build_object('ok', false, 'error', 'forbidden'); end if;
  select artisan_id, credits_spent, project_id into v_artisan_id, v_amount, v_project_id from public.lead_unlocks where id = p_unlock_id;
  if v_artisan_id is null then return json_build_object('ok', false, 'error', 'not_found'); end if;
  perform public.admin_adjust_wallet(v_artisan_id, v_amount, 'refund', coalesce(p_note, 'Remboursement admin'), v_project_id);
  update public.lead_unlocks set status = 'lost' where id = p_unlock_id;
  return json_build_object('ok', true, 'refunded', v_amount);
end;
$$;

create or replace function public.admin_approve_dispute(p_dispute_id uuid, p_note text default null)
returns json
language plpgsql security definer set search_path = public
as $$
declare v_unlock_id uuid; v_amount int; v_artisan_id uuid; v_project_id uuid;
begin
  if not public.has_role(auth.uid(), 'admin') then return json_build_object('ok', false, 'error', 'forbidden'); end if;
  select unlock_id, artisan_id into v_unlock_id, v_artisan_id from public.lead_disputes where id = p_dispute_id;
  if v_unlock_id is null then return json_build_object('ok', false, 'error', 'not_found'); end if;
  select credits_spent, project_id into v_amount, v_project_id from public.lead_unlocks where id = v_unlock_id;
  perform public.admin_adjust_wallet(v_artisan_id, v_amount, 'refund', coalesce(p_note, 'Réclamation approuvée'), v_project_id);
  update public.lead_unlocks set status = 'lost' where id = v_unlock_id;
  update public.lead_disputes set status = 'approved', resolved_at = now(), resolved_note = p_note where id = p_dispute_id;
  return json_build_object('ok', true, 'refunded', v_amount);
end;
$$;

create or replace function public.admin_reject_dispute(p_dispute_id uuid, p_note text default null)
returns json
language plpgsql security definer set search_path = public
as $$
begin
  if not public.has_role(auth.uid(), 'admin') then return json_build_object('ok', false, 'error', 'forbidden'); end if;
  update public.lead_disputes set status = 'rejected', resolved_at = now(), resolved_note = p_note where id = p_dispute_id;
  return json_build_object('ok', true);
end;
$$;

revoke all on function public.verify_project_email(text) from public;
revoke all on function public.verify_project_otp(text, text) from public;
revoke all on function public.unlock_lead(uuid) from public;
revoke all on function public.submit_review(uuid, integer, text) from public;
revoke all on function public.admin_refund_unlock(uuid, text) from public;
revoke all on function public.admin_approve_dispute(uuid, text) from public;
revoke all on function public.admin_reject_dispute(uuid, text) from public;
grant execute on function public.verify_project_email(text) to anon, authenticated;
grant execute on function public.verify_project_otp(text, text) to anon, authenticated;
grant execute on function public.unlock_lead(uuid) to authenticated;
grant execute on function public.submit_review(uuid, integer, text) to authenticated;
grant execute on function public.admin_refund_unlock(uuid, text) to authenticated;
grant execute on function public.admin_approve_dispute(uuid, text) to authenticated;
grant execute on function public.admin_reject_dispute(uuid, text) to authenticated;