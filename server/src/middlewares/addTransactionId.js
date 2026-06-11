import expressRequestId from 'express-request-id';

const addTransactionId = expressRequestId({
    headerName: 'x-transaction-id',
    attributeName: 'txId',
});

export default addTransactionId;
