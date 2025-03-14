export type ErrorFetchingInvoices = {
    _type: "ErrorFetchingInvoices";
    message: string;
};

export type ErrorFetchingPaymentSettings = {
    _type: "ErrorFetchingPaymentSettings";
    message: string;
};

export type ErrorPayingInvoice = {
    _type: "ErrorPayingInvoice";
    message: string;
};

export type ErrorPayingPayment = {
    _type: "ErrorPayingPayment";
    message: string;
};
