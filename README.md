# ee

# Integração Webhook UTMFY/Vega Checkout

Este projeto já está pronto para disparar webhooks reais para a UTMFY/Vega Checkout tanto em vendas geradas (pendente) quanto aprovadas.

## Endpoints principais

### 1. Venda Gerada (pendente)
- Endpoint: `/api/webhook`
- Método: `POST`
- Headers:
  - `Content-Type: application/json`
  - `x-admin-secret: SUA_ADMIN_SECRET`
- Body exemplo:
```json
{
  "transaction_id": "ID_UNICO_DA_VENDA",
  "status": "pending"
}
```

### 2. Venda Aprovada
- Endpoint: `/api/approve-payment`
- Método: `POST`
- Headers:
  - `Content-Type: application/json`
  - `x-admin-secret: SUA_ADMIN_SECRET`
- Body exemplo:
```json
{
  "logId": "ID_DO_LOG_DA_VENDA"
}
```

## Como testar localmente

1. Configure a variável `ADMIN_SECRET` no seu arquivo `.env`.
2. Certifique-se de que a tabela `integrations` tem o campo `utmfy_webhook_url` preenchido para o usuário.
3. Instale a dependência para o script de teste:
   ```bash
   npm install node-fetch
   ```
4. Edite o arquivo `test-webhooks.js` e ajuste:
   - `ADMIN_SECRET` para o valor do seu `.env`
   - `BASE_URL` para a URL do seu backend
   - O `transaction_id`/`logId` para IDs válidos do seu banco
5. Execute o script:
   ```bash
   node test-webhooks.js
   ```

## Fluxo
- Quando uma venda é criada (pendente), chame `/api/webhook`.
- Quando uma venda é aprovada, chame `/api/approve-payment`.
- O backend dispara automaticamente o webhook real para a UTMFY/Vega Checkout.

## Observações
- O campo `x-admin-secret` deve ser igual ao valor definido no seu `.env`.
- O payload enviado para a UTMFY pode ser customizado nos arquivos `src/pages/api/webhook.ts` e `src/pages/api/approve-payment.ts`.

Se precisar de mais exemplos ou integração com outros gateways, só pedir!
# 01
# 01
# 01
# N
# N
# notifica-ao
# notifica-ao
