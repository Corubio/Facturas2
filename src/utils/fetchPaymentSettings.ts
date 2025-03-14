import axios from "axios";
import { PaymentSettings } from "../interface/v1";
import * as TE from "fp-ts/TaskEither";
import API_BASE_URL from "./apiBaseUrl";

const fetchPaymentSettings = (
    organizationId: string,
): TE.TaskEither<Error, PaymentSettings> =>
    TE.tryCatch(
        async () => {
            const response = await axios.get(
                `${API_BASE_URL}/organization/${organizationId}/settings`,
            );
            return response.data as PaymentSettings;
        },
        (error) =>
            new Error(
                `No se pudo obtener los datos de la organización: ${String(error)}`,
            ),
    );

export default fetchPaymentSettings;
