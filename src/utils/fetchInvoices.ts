import axios from "axios";
import * as TE from "fp-ts/TaskEither";
import API_BASE_URL from "./apiBaseUrl";
import { InvoiceData as InvoiceDataV1 } from "../interface/v1";
import { InvoiceData as InvoiceDataV2 } from "../interface/v2";
import { ErrorFetchingInvoices } from "../errors";

export const fetchInvoicesV1 = (): TE.TaskEither<
    ErrorFetchingInvoices,
    InvoiceDataV1[]
> =>
    TE.tryCatch(
        async () => {
            const response = await axios.get(
                `${API_BASE_URL}/invoices/pending`,
            );
            return response.data as InvoiceDataV1[];
        },
        (error) => ({
            _type: "ErrorFetchingInvoices" as const,
            message: `No se pudo obtener las facturas pendientes: ${String(error)}`,
        }),
    );

export const fetchInvoicesV2 = (): TE.TaskEither<
    ErrorFetchingInvoices,
    InvoiceDataV2[]
> =>
    TE.tryCatch(
        async () => {
            const response = await axios.get(
                `${API_BASE_URL}/v2/invoices/pending`,
            );
            return response.data as InvoiceDataV2[];
        },
        (error) => ({
            _type: "ErrorFetchingInvoices" as const,
            message: `No se pudo obtener las facturas pendientes: ${String(error)}`,
        }),
    );
