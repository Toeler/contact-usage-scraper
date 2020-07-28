import { Consumption } from "./Consumption";

export interface UsageResponse {
    statusCode: number,
    consumption: Consumption[]
}
