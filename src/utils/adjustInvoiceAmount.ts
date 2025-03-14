import {
    Invoice as InvoiceV1,
    PaymentSettings as PaymentSettingsV1,
} from "../interface/v1";
import {
    Invoice as InvoiceV2,
    PaymentSettings as PaymentSettingsV2,
} from "../interface/v2";

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

        const newPayments = invoice.payments
            .sort(
                (a, b) => a.amountCLP - b.amountCLP || b.id.localeCompare(a.id),
            )
            .map((payment) => {
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
