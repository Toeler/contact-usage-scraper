export interface Consumption {
	currency: string,
	year: number,
	month: number,
	day: number,
	hour: number,
	date: string,
	value: string,
	unit: string,
	timeZone?: string,
	percentage: number,
	monthlyTotal?: string,
	dailyAverage?: string
}
