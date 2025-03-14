import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import * as T from "fp-ts/Task";
import * as A from "fp-ts/Array";
import { fetchInvoicesV1 } from "./utils/fetchInvoices";
import fetchPaymentSettings from "./utils/fetchPaymentSettings";
import { processInvoicesV1 } from "./utils/processInvoices";
import { adjustInvoiceAmountV1 } from "./utils/adjustInvoiceAmount";
import payInvoice from "./utils/payInvoice";
import { Invoice, SuccessResponse } from "./interface/v1";
import { ErrorFetchingPaymentSettings, ErrorPayingInvoice } from "./errors";
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
                TE.map(adjustInvoiceAmountV1(invoice)),
            ),
        ),
        A.sequence(TE.ApplicativePar),
    );

const payInvoices = (
    invoices: Invoice[],
): TE.TaskEither<ErrorPayingInvoice, SuccessResponse[]> =>
    pipe(
        invoices,
        A.map((invoice) => pipe(invoice, payInvoice)),
        A.sequence(TE.ApplicativePar),
    );

const fetchAndProcessInvoices: T.Task<string> = pipe(
    fetchInvoicesV1(),
    TE.map(processInvoicesV1),
    TE.flatMap(processInvoices),
    TE.flatMap(payInvoices),
    TE.match(
        matchError({
            ErrorFetchingInvoices: () => "No se pudo obtener las facturas",
            ErrorFetchingPaymentSettings: () =>
                "No se pudo obtener la configuración de pago",
            ErrorPayingInvoice: () => "No se pudo pagar la factura",
        }),
        () => "Pagado correctamente",
    ),
);

const main = async () => {
    const result = await fetchAndProcessInvoices();
    console.log(result);
};

main();
