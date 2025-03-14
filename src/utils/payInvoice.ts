import axios from "axios";
import { Invoice, SuccessResponse } from "../interface/v1";
import * as TE from "fp-ts/TaskEither";
import API_BASE_URL from "./apiBaseUrl";

const payInvoice = (invoice: Invoice): TE.TaskEither<Error, SuccessResponse> =>
    TE.tryCatch(
        async () => {
            const amount =
                invoice.currency === "USD"
                    ? invoice.amountUSD
                    : invoice.amountCLP;
            const response = await axios.post(
                `${API_BASE_URL}/invoices/${invoice.id}/pay`,
                { amount },
            );

            return response.data as SuccessResponse;
        },
        (error) => new Error(`No se pudo pagar la factura: ${String(error)}`),
    );

export default payInvoice;
