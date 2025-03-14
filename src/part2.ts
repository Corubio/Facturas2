import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import * as A from "fp-ts/Array";
import * as T from "fp-ts/Task";
import { fetchInvoicesV2 } from "./utils/fetchInvoices";
import fetchPaymentSettings from "./utils/fetchPaymentSettings";
import { processInvoicesV2 } from "./utils/processInvoices";
import { adjustInvoiceAmountV2 } from "./utils/adjustInvoiceAmount";
import payPayment from "./utils/payPayment";
import { Invoice, SuccessResponse } from "./interface/v2";
import { ErrorFetchingPaymentSettings, ErrorPayingPayment } from "./errors";
import { makeMatch } from "ts-adt/MakeADT";

const matchError = makeMatch("_type");

const processInvoices = (
    invoices: Invoice[],
): TE.TaskEither<ErrorFetchingPaymentSettings, Invoice[]> =>
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

const payPayments = (
    invoices: Invoice[],
): TE.TaskEither<ErrorPayingPayment, SuccessResponse[][]> =>
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

const fetchAndProcessInvoices: T.Task<string> = pipe(
    fetchInvoicesV2(),
    TE.map(processInvoicesV2),
    TE.flatMap(processInvoices),
    TE.flatMap(payPayments),
    TE.match(
        matchError({
            ErrorFetchingInvoices: () => "No se pudo obtener las facturas",
            ErrorFetchingPaymentSettings: () =>
                "No se pudo obtener la configuración de pago",
            ErrorPayingPayment: () => "No se pudo pagar el pago",
        }),
        () => "Pagado correctamente",
    ),
);

const main = async () => {
    const result = await fetchAndProcessInvoices();
    console.log(result);
};

main();
