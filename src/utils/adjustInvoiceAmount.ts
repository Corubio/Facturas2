import {
    Invoice as InvoiceV1,
    PaymentSettings as PaymentSettingsV1,
} from "../interface/v1";
import {
    Invoice as InvoiceV2,
    PaymentSettings as PaymentSettingsV2,
} from "../interface/v2";
import * as A from "fp-ts/Array";
import { Payment } from "../interface/v2";
import * as S from "fp-ts/string";
import * as N from "fp-ts/number";
import { pipe } from "fp-ts/function";
import * as Ord from "fp-ts/Ord";

export const adjustInvoiceAmountV1 =
    (invoice: InvoiceV1) =>
    (paymentSettings: PaymentSettingsV1): InvoiceV1 => {
        const adjustedAmountUSD =
            invoice.amountUSD -
            invoice.creditNotes.reduce((sum, note) => sum + note.amountUSD, 0);
        const adjustedAmountCLP =
            invoice.amountCLP -
            invoice.creditNotes.reduce((sum, note) => sum + note.amountCLP, 0);

        return {
            ...invoice,
            amountCLP: adjustedAmountCLP,
            amountUSD: adjustedAmountUSD,
            currency: paymentSettings.currency,
        };
    };

const byAmount = pipe(
    N.Ord,
    Ord.contramap((payment: Payment) => payment.amountCLP),
);

const byName = pipe(
    S.Ord,
    Ord.contramap((payment: Payment) => payment.id),
    Ord.reverse,
);

const sortPayments = (payments: Payment[]): Payment[] =>
    pipe(payments, A.sortBy([byAmount, byName]));

export const adjustInvoiceAmountV2 =
    (invoice: InvoiceV2) =>
    (paymentSettings: PaymentSettingsV2): InvoiceV2 => {
        let creditNotesAmountUSD = invoice.creditNotes.reduce(
            (sum, note) => sum + note.amountUSD,
            0,
        );
        let creditNotesAmountCLP = invoice.creditNotes.reduce(
            (sum, note) => sum + note.amountCLP,
            0,
        );

        const newPayments = sortPayments(invoice.payments).map((payment) => {
            let adjustedAmountCLP = payment.amountCLP;
            let adjustedAmountUSD = payment.amountUSD;

            if (creditNotesAmountCLP > 0) {
                const deductionCLP = Math.min(
                    creditNotesAmountCLP,
                    payment.amountCLP,
                );
                const deductionUSD = Math.min(
                    creditNotesAmountUSD,
                    payment.amountUSD,
                );

                adjustedAmountCLP -= deductionCLP;
                adjustedAmountUSD -= deductionUSD;

                creditNotesAmountCLP -= deductionCLP;
                creditNotesAmountUSD -= deductionUSD;
            }

            const newPayment = {
                ...payment,
                amountCLP: adjustedAmountCLP,
                amountUSD: adjustedAmountUSD,
            };
            return newPayment;
        });

        return {
            ...invoice,
            currency: paymentSettings.currency,
            payments: newPayments,
        };
    };
