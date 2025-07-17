ALTER TABLE public.integrations
ADD CONSTRAINT integrations_user_id_provider_unique UNIQUE (user_id, provider); 