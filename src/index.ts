import moment from 'moment-timezone';

import config from './config';

import { PowerUsagePoint } from './models/influx/PowerUsagePoint';
import { Consumption } from './models/contact/Consumption';
import { RequestMetadata } from './models/contact/RequestMetadata';
import { getUsageFromInflux, sendUsageToInflux } from './influx';
import { getPowerUsage, parseContactDate, getContactRequestData } from './contact';

enum Measurement {
	Hourly = 'hourly_usage',
	Daily = 'daily_usage',
	Monthly = 'monthly_usage'
};
enum MomentChunk {
	Hours = 'hours',
	Days = 'days',
	Months = 'months',
	Yearly = 'years'
};

function getMissingChunks(points: PowerUsagePoint[], chunkPeriod: MomentChunk, chunksBack: number): moment.Moment[] {
	const now = moment.tz('Pacific/Auckland').startOf(chunkPeriod);
	let time = moment(now).subtract(chunksBack, chunkPeriod);
	const chunks = new Set<string>();
	while (time.isSameOrBefore(now)) {
		chunks.add(moment(time).utc().format());
		time.add(1, chunkPeriod);
	}

	for (const point of points) {
		chunks.delete(point._time);
	}
	
	return Array.from(chunks.values()).map((chunk) => moment(chunk));
}

function getChunksToRequestInNzt(chunkPeriod: MomentChunk, chunks: moment.Moment[]): string[] {
	return Array.from(chunks.reduce((chunksToRequest, chunk) => {
		chunksToRequest.add(chunk.tz('Pacific/Auckland').startOf(chunkPeriod).format('YYYY-MM-DD'));
		return chunksToRequest;
	}, new Set<string>()).values());
}

async function updateData(measurement: Measurement, chunkPeriod: MomentChunk, chunksBack: number, requestChunkPeriod: MomentChunk, contactRequestMetadataGetter: () => Promise<RequestMetadata>) {
	const daysBack = Math.abs(moment.utc().subtract(chunksBack, chunkPeriod).diff(moment.utc(), 'days'));
	const points = await getUsageFromInflux(measurement, daysBack + 1);
	console.log(`Fetched ${points.length} points from Influx`);
	const missingChunks = getMissingChunks(points, chunkPeriod, chunksBack);
	const chunksToRequest = getChunksToRequestInNzt(requestChunkPeriod, missingChunks);
	console.log(`Missing ${missingChunks.length} ${chunkPeriod} Chunks. Requesting ${chunksToRequest.length} ${requestChunkPeriod} Chunks.`);

	let consumption: Consumption[] = [];
	for (const chunk of chunksToRequest) {
		const fromTime = moment.tz(chunk, 'Pacific/Auckland');
		const interval = requestChunkPeriod === MomentChunk.Days ? 'hourly' : (requestChunkPeriod === MomentChunk.Months ? 'daily' : 'monthly');
		const { contractId, token, csrfToken } = await contactRequestMetadataGetter();
		const usage = await getPowerUsage(contractId, fromTime, moment(fromTime).add(1, requestChunkPeriod), token, csrfToken, interval);
		const lastPoint = usage.consumption && usage.consumption[usage.consumption.length - 1];
		if (lastPoint) {
			const timestamp = parseContactDate(lastPoint.date, lastPoint.timeZone);
			if (timestamp.isBefore(fromTime)) {
				break; // They're not giving us any more data
			}
			consumption = consumption.concat(usage.consumption);
		}
	}

	await sendUsageToInflux(measurement, consumption);
}

function updateHourlyData(contactRequestMetadataGetter: () => Promise<RequestMetadata>) {
	return updateData(Measurement.Hourly, MomentChunk.Hours, config.get('power.hoursBack'), MomentChunk.Days, contactRequestMetadataGetter);
}

function updateDailyData(contactRequestMetadataGetter: () => Promise<RequestMetadata>) {
	return updateData(Measurement.Daily, MomentChunk.Days, config.get('power.daysBack'), MomentChunk.Months, contactRequestMetadataGetter);
}

function updateMonthlyData(contactRequestMetadataGetter: () => Promise<RequestMetadata>) {
	return updateData(Measurement.Monthly, MomentChunk.Months, config.get('power.monthsBack'), MomentChunk.Yearly, contactRequestMetadataGetter);
}

function getContactRequestMetadataGetter() {
	let contractId: string;
	let token: string;
	let csrfToken: string;
	return async function contactRequestMetadataGetter() : Promise<RequestMetadata> {
		if (!contractId || !token ! || !csrfToken) {
			const contactData = await getContactRequestData();
			contractId = contactData.contractId;
			token = contactData.token;
			csrfToken = contactData.csrfToken;
		}
		return { contractId, token, csrfToken };
	}
}

async function start() {
	console.log('Starting Contact Usage Scraper');
	try {
		const contactRequestMetadataGetter = getContactRequestMetadataGetter();
		await updateHourlyData(contactRequestMetadataGetter);
		await updateDailyData(contactRequestMetadataGetter);
		await updateMonthlyData(contactRequestMetadataGetter);
		
		console.log('Finished Contact Usage Scraper');
	} catch (ex) {
		console.error('Error', ex);
	}
}

start();