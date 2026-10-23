alter table native_auth_handoff add column if not exists token_ciphertext text;
alter table native_auth_handoff add column if not exists challenge text;
alter table native_auth_handoff alter column session_token drop not null;
