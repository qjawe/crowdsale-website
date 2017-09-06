Parity Certifier requests:

GET /accounts/:address/fee
  - Returns: `{"incomingTxAddr": ["0x...", ...], "balance": "0x...", "paid": bool}`

POST /fee-tx
  - Same as POST /tx, but without constraints or queue (rejects if funds are lacking), but verifying `to` field to be the fee contract.

POST /onfido/:address/applicant

  - Same as sale backend but check that address paid on fee contract

POST /onfido/:address/check

  - Same as sale backend

GET /onfido/:address

  - Same as sale backend
