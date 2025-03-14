import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import * as A from "fp-ts/Array";
import { fetchInvoicesV2 } from "./utils/fetchInvoices";
import fetchPaymentSettings from "./utils/fetchPaymentSettings";
import { processInvoicesV2 } from "./utils/processInvoices";
import { adjustInvoiceAmountV2 } from "./utils/adjustInvoiceAmount";
import payPayment from "./utils/payPayment";
import { Invoice } from "./interface/v2";

const processInvoices = (invoices: Invoice[]) =>
    pipe(
        invoices,
        A.map((invoice) =>
            pipe(
                invoice.organizationId,
                fetchPaymentSettings,
                TE.map(adjustInvoiceAmountV2(invoice)),
            ),
        ),
        A.sequence(TE.ApplicativePar),
    );

const payPayments = (invoices: Invoice[]) =>
    pipe(
        invoices,
        A.map((invoice) =>
            pipe(
                invoice.payments,
                A.map((payment) => payPayment(invoice.currency)(payment)),
                A.sequence(TE.ApplicativePar),
            ),
        ),
        A.sequence(TE.ApplicativePar),
    );

const fetchAndProcessInvoices = pipe(
    fetchInvoicesV2(),
    TE.map(processInvoicesV2),
    TE.flatMap(processInvoices),
    TE.flatMap(payPayments),
    TE.tapIO((status) => () => console.log(status)),
);

const main = async () => {
    await fetchAndProcessInvoices();
};
main();
