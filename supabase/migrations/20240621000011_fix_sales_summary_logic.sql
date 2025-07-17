create or replace function public.calculate_user_sales_summary(p_user_id uuid)
returns table(total_revenue numeric, approved_sales bigint, pending_sales bigint, total_sales bigint)
language plpgsql
as $$
begin
  return query
  select
    coalesce(sum(p.price), 0) as total_revenue, -- Soma tudo, independente do status
    coalesce(count(case when cl.status = 'aprovado' then 1 end), 0) as approved_sales,
    coalesce(count(case when cl.status = 'pendente' then 1 end), 0) as pending_sales,
    coalesce(count(cl.log_id), 0) as total_sales
  from
    public.checkout_logs as cl
  left join
    public.products as p on cl.product_id = p.id
  where
    cl.user_id = p_user_id;
end;
$$; 