import * as TE from "fp-ts/TaskEither";
import { flow, pipe } from "fp-ts/function";
import * as A from "fp-ts/Array";
import { fetchInvoicesV2 } from "./utils/fetchInvoices";
import fetchPaymentSettings from "./utils/fetchPaymentSettings";
import { processInvoicesV2 } from "./utils/processInvoices";
import { adjustInvoiceAmountV2 } from "./utils/adjustInvoiceAmount";
import payPayment from "./utils/payPayment";

const fetchAndProcessInvoices = pipe(
    fetchInvoicesV2(),
    TE.map(processInvoicesV2),
    TE.flatMap(
        flow(
            A.traverse(TE.ApplicativePar)((invoice) =>
                pipe(
                    fetchPaymentSettings(invoice.organizationId),
                    TE.map((paymentSettings) =>
                        adjustInvoiceAmountV2(invoice, paymentSettings),
                    ),
                ),
            ),
        ),
    ),
    TE.flatMap((invoices) =>
        pipe(
            invoices,
            A.flatMap((invoice) =>
                pipe(
                    invoice.payments,
                    A.map((payment) =>
                        pipe(
                            payPayment(invoice.currency)(payment),
                            TE.map((succes) =>
                                console.log(
                                    `Payment: ${payment.id}, status:${succes.status}`,
                                ),
                            ),
                        ),
                    ),
                ),
            ),
            A.sequence(TE.ApplicativePar),
        ),
    ),
);

const main = async () => {
    const result = await fetchAndProcessInvoices();
};
main();
