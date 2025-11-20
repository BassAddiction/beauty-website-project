#!/bin/bash

# Тестируем webhook вручную с последним payment_id
curl -X POST https://functions.poehali.dev/1cd4e8c8-3e41-470f-a824-9c8dd42b6c9c \
  -H "Content-Type: application/json" \
  -d '{
    "type": "notification",
    "event": "payment.succeeded",
    "object": {
      "id": "30b163e9-000f-5000-b000-1b74b533deae",
      "status": "succeeded",
      "paid": true,
      "amount": {
        "value": "2.00",
        "currency": "RUB"
      },
      "metadata": {
        "username": "pomytkinserdj_1763659818645",
        "email": "test@example.com",
        "plan_name": "Test Plan",
        "plan_days": "7"
      }
    }
  }'
