import axios from "axios";
import { Payment, SuccessResponse } from "../interface/v2";
import * as TE from "fp-ts/TaskEither";
import API_BASE_URL from "./apiBaseUrl";
import { ErrorPayingPayment } from "../errors";

const payPayment =
    (currency: string) =>
    (payment: Payment): TE.TaskEither<ErrorPayingPayment, SuccessResponse> =>
        TE.tryCatch(
            async () => {
                const amount =
                    currency === "USD" ? payment.amountUSD : payment.amountCLP;

                const response = await axios.post(
                    `${API_BASE_URL}/payment/${payment.id}/pay`,
                    { amount },
                );

                return response.data as SuccessResponse;
            },
            (error) =>
                new ErrorPayingPayment(
                    `No se pudo pagar el pago ${payment.id}: ${String(error)}`,
                ),
        );

export default payPayment;
