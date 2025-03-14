import {
    Invoice as InvoiceV1,
    InvoiceData as InvoiceDataV1,
} from "../interface/v1";
import {
    Invoice as InvoiceV2,
    InvoiceData as InvoiceDataV2,
    Payment,
} from "../interface/v2";

export const processInvoicesV1 = (data: InvoiceDataV1[]): InvoiceV1[] => {
    const rawInvoices = data.filter((item) => item.type === "received");
    const creditNotes = data.filter((item) => item.type === "credit_note");

    return rawInvoices.map((invoice) => {
        const notes = creditNotes.filter(
            (note) => note.reference === invoice.id,
        );
        const invoiceAmountUSD =
            invoice.currency === "USD" ? invoice.amount : invoice.amount / 800;
        const invoiceAmountCLP =
            invoice.currency === "CLP" ? invoice.amount : invoice.amount * 800;

        return {
            id: invoice.id,
            amountUSD: invoiceAmountUSD,
            amountCLP: invoiceAmountCLP,
            currency: invoice.currency,
            organizationId: invoice.organization_id,
            creditNotes: notes.map((note) => ({
                id: note.id,
                amountUSD:
                    note.currency === "USD" ? note.amount : note.amount / 800,
                amountCLP:
                    note.currency === "CLP" ? note.amount : note.amount * 800,
                currency: note.currency,
                reference: note.reference as string,
            })),
        };
    });
};

export const processInvoicesV2 = (data: InvoiceDataV2[]): InvoiceV2[] => {
    const rawInvoices = data.filter((item) => item.type === "received");
    const creditNotes = data.filter((item) => item.type === "credit_note");

    return rawInvoices.map((invoice) => {
        const notes = creditNotes.filter(
            (note) => note.reference === invoice.id,
        );
        const payments = invoice.payments?.filter(
            (payment) => payment.status === "pending",
        );
        const invoiceAmountUSD =
            invoice.currency === "USD" ? invoice.amount : invoice.amount / 800;
        const invoiceAmountCLP =
            invoice.currency === "CLP" ? invoice.amount : invoice.amount * 800;

        return {
            id: invoice.id,
            amountUSD: invoiceAmountUSD,
            amountCLP: invoiceAmountCLP,
            currency: invoice.currency,
            organizationId: invoice.organization_id,
            payments:
                payments
                    ?.map((payment) => ({
                        id: payment.id,
                        amountUSD:
                            invoice.currency === "USD"
                                ? payment.amount
                                : payment.amount / 800,
                        amountCLP:
                            invoice.currency === "CLP"
                                ? payment.amount
                                : payment.amount * 800,
                        amount: payment.amount,
                        status: payment.status,
                    }))
                    .sort((a, b) => b.amountCLP - a.amountCLP) || [],
            creditNotes: notes.map((note) => ({
                id: note.id,
                amountUSD:
                    note.currency === "USD" ? note.amount : note.amount / 800,
                amountCLP:
                    note.currency === "CLP" ? note.amount : note.amount * 800,
                currency: note.currency,
                reference: note.reference as string,
            })),
        };
    });
};
