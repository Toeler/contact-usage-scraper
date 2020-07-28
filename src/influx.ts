import { InfluxDB, Point } from '@influxdata/influxdb-client';
import config from './config';
import { Measurement } from './models/influx/Measurement';
import { PowerUsagePoint } from './models/influx/PowerUsagePoint';
import { UsageResponse } from './models/contact/UsageResponse';
import { parseContactDate } from './contact';

const HOURS_IN_DAY = 24;

export async function sendUsageToInflux(measurement: Measurement, usage: UsageResponse['consumption']): Promise<void> {
	const client = new InfluxDB({ url: config.get('influx.url'), token: config.get('influx.token') });
	const writeApi = client.getWriteApi(config.get('influx.org'), config.get('influx.buckets.power.id'));
	writeApi.useDefaultTags({ host: config.get('influx.host') });

	let timezone = '';
	for (const hour of usage) {
		timezone = hour.timeZone || timezone;
		const timestamp = parseContactDate(hour.date, timezone);

		if (hour.unit !== 'kWh') {
			console.warn(`Value at ${timestamp.format()} reported ${hour.value} ${hour.unit} but submitted value as kWh`);
		}

		const kwh = parseFloat(hour.value);
		const dailyChargeNzd = config.get('contact.dailyChargeNzd');
		const discountPercent = config.get('contact.discountPercentage');
		const kwhRate = config.get('contact.kwhRate');
		const priceNzd = ((kwh*kwhRate)+(dailyChargeNzd/HOURS_IN_DAY))*((100-discountPercent)/100); // TODO: This is likely to be inacurate over DST
		const point = new Point(measurement)
			.floatField('kwh', kwh)
			.floatField('priceCentsNzd', priceNzd)
			.timestamp(timestamp.utc().toDate());
		// console.debug('Write point', point.toString());
		writeApi.writePoint(point);
	}

	return writeApi
		.close()
		.then(() => {
			console.log(`Wrote ${usage.length} points`)
		})
		.catch(e => {
			console.error(e)
			console.log('\nFinished ERROR')
		});
}

export async function getUsageFromInflux(measurement: Measurement, daysBack: number): Promise<PowerUsagePoint[]> {
	const client = new InfluxDB({ url: config.get('influx.url'), token: config.get('influx.token') });
	const queryApi = client.getQueryApi(config.get('influx.org'));

	const query = `from(bucket: "${config.get('influx.buckets.power.name')}") |> range(start: -${daysBack}d)`;
	return new Promise((resolve, reject) => {
		const points: PowerUsagePoint[] = [];
		queryApi.queryRows(query, {
			next(row, tableMeta) {
				const point = tableMeta.toObject(row) as PowerUsagePoint;
				if (point._measurement === measurement) {
					points.push(point);
				}
			},
			error(error) {
				return reject(error);
			},
			complete() {
				return resolve(points);
			},
		});
	});
}
