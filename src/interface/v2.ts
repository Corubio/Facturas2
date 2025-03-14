export interface InvoiceData {
    id: string;
    amount: number;
    currency: "USD" | "CLP";
    organization_id: string;
    type: "received" | "credit_note";
    payments?: Payment[];
    reference?: string;
}

export interface Payment {
    id: string;
    amountUSD: number;
    amountCLP: number;
    amount: number;
    status: "paid" | "pending";
}

export interface PaymentSettings {
    organization_id: string;
    currency: string;
}

export interface CreditNote {
    id: string;
    amountUSD: number;
    amountCLP: number;
    currency: "USD" | "CLP";
    reference: string;
}

export interface Invoice {
    id: string;
    amountUSD: number;
    amountCLP: number;
    currency: string;
    organizationId: string;
    payments: Payment[];
    creditNotes: CreditNote[];
}

export interface SuccessResponse {
    status: string;
}
