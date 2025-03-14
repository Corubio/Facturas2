import * as TE from "fp-ts/TaskEither";
import { flow, pipe } from "fp-ts/function";
import * as A from "fp-ts/Array";
import { fetchInvoicesV1 } from "./utils/fetchInvoices";
import fetchPaymentSettings from "./utils/fetchPaymentSettings";
import { processInvoicesV1 } from "./utils/processInvoices";
import { adjustInvoiceAmountV1 } from "./utils/adjustInvoiceAmount";
import payInvoice from "./utils/payInvoice";

const fetchAndProcessInvoices = pipe(
    fetchInvoicesV1(),
    TE.map(processInvoicesV1),
    TE.flatMap(
        flow(
            A.traverse(TE.ApplicativePar)((invoice) =>
                pipe(
                    fetchPaymentSettings(invoice.organizationId),
                    TE.map((paymentSettings) =>
                        adjustInvoiceAmountV1(invoice, paymentSettings),
                    ),
                ),
            ),
        ),
    ),
    TE.flatMap(
        flow(
            A.traverse(TE.ApplicativePar)((invoice) =>
                pipe(
                    invoice,
                    payInvoice,
                    TE.map((succes) =>
                        console.log(
                            `Invoice: ${invoice.id}, status:${succes.status}`,
                        ),
                    ),
                ),
            ),
        ),
    ),
);

const main = async () => {
    await fetchAndProcessInvoices();
};
main();
