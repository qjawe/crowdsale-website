Parity Certifier requests:

GET /accounts/:address/fee
  - Returns: `{"incomingTxAddr": ["0x...", ...], "balance": "0x...", "paid": bool}`

POST /fee-tx
  - Same as POST /fee, but without constraints or queue (rejects if funds are lacking)

POST /onfido/:address/applicant

  - Same as sale backend but check that address paid on fee certifier

POST /onfido/:address/check

  - Same as sale backend

GET /onfido/:address

  - Same as sale backend
