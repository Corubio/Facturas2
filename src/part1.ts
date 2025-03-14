import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import * as A from "fp-ts/Array";
import { fetchInvoicesV1 } from "./utils/fetchInvoices";
import fetchPaymentSettings from "./utils/fetchPaymentSettings";
import { processInvoicesV1 } from "./utils/processInvoices";
import { adjustInvoiceAmountV1 } from "./utils/adjustInvoiceAmount";
import payInvoice from "./utils/payInvoice";
import { Invoice } from "./interface/v1";

const processInvoices = (invoices: Invoice[]) =>
    pipe(
        invoices,
        A.map((invoice) =>
            pipe(
                invoice.organizationId,
                fetchPaymentSettings,
                TE.map(adjustInvoiceAmountV1(invoice)),
            ),
        ),
        A.sequence(TE.ApplicativePar),
    );

const payInvoices = (invoices: Invoice[]) =>
    pipe(
        invoices,
        A.map((invoice) => pipe(invoice, payInvoice)),
        A.sequence(TE.ApplicativePar),
    );

const fetchAndProcessInvoices = pipe(
    fetchInvoicesV1(),
    TE.map(processInvoicesV1),
    TE.flatMap(processInvoices),
    TE.flatMap(payInvoices),
    TE.tapIO((status) => () => console.log(status)),
);

const main = async () => {
    await fetchAndProcessInvoices();
};

main();
