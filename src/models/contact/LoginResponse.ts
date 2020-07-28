export interface LoginResponse {
    Data: {
        StatusCode: number,
        Token: string,
        Segment: string,
        RedirectTo: string
    },
    IsSuccessful: boolean,
    Headers: {
		Key: string,
		Value: string
	}[],
    StatusCode: number,
    Errors: any[]
}
