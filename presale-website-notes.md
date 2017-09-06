Parity Certifier requests:

GET /accounts/:address/fee
  - Returns:
    - incoming transactions
    - balance
    - is market as paid on fee contract

POST /fee-tx
  - Same as POST /fee, but without constraints or queue (rejects if funds are lacking)

POST /onfido/:address/applicant

  - Same as sale backend but check that address paid on fee certifier

POST /onfido/:address/check

  - Same as sale backend

GET /onfido/:address

  - Same as sale backend
