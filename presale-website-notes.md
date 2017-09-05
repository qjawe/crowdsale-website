Parity Certifier requests:

POST /fee

  - Create a new account, push address and private key to DB.
    Note: the response from this should be saved in cookie/local storage and re-used on refresh
    Response: { "feeAddress": "0x..." }

GET /fee/:feeAddress

  - Get status of the payment by address of the receiving account.
    Response: { "paid": false }
                    or
              { "paid": true, "paidAddress": "0x..." }

POST /onfido/:paidAddress/applicant

  - Same as sale backend but check that paidAddress actually paid

POST /onfido/:paidAddress/check

  - Same as sale backend

Gett /onfido/:paidAddress

  - Same as sale backend

BACKGROUND FEE QUEUE

  - On each block run through the list of fee-addresses awaiting payments.
  - If payment arrived, query for the address from which the last TX arrived.
  - Move all funds to the trusted account used to call into certifier contract
  - Create a DB transaction that:
    - Deletes original record
    - Creates a new record in another table/key with: address, private key, address to certify

BACKGROUND ONFIDO WEBHOOK/QUEUE

  - Same as sale backend
