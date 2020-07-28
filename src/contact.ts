import moment from 'moment-timezone';

import config from './config';
import request from './request';
import { RequestMetadata } from './models/contact/RequestMetadata';
import { LoginResponse } from './models/contact/LoginResponse';
import { ProfileResponse } from './models/contact/ProfileResponse';
import { UsageResponse } from './models/contact/UsageResponse';
import { tryGetZoneFromCode } from './util';

export async function loginToContact(): Promise<LoginResponse> {
	const response = await request.post(config.get('contact.sign_in_url'), {
		AllowNewOlsSiteAccess: 'true',
		NewOlsSiteAccessValue: 'true',
		UserName: config.get('contact.username'),
		Password: config.get('contact.password')
	});
	return response.data;
}

export async function getContactProfile(token: string): Promise<ProfileResponse> {
	const response = await request.post(`${config.get('contact.api_url')}/mcfu/profile`, null, {
		headers: {
			Authorization: token,
			'x-api-key': config.get('contact.api_key')
		}
	});
	return response.data;
}

export async function getPowerUsage(contractId: string, from: moment.Moment, to: moment.Moment, token: string, csrfToken: string, interval: string): Promise<UsageResponse> {
	const response = await request.post(`${config.get('contact.api_url')}/consumption/${contractId}?interval=${interval}&from=${from.format('YYYY-MM-DD')}&to=${to.format('YYYY-MM-DD')}`, null, {
		headers: {
			Authorization: token,
			'x-api-key': config.get('contact.api_key'),
			'x-csrf-token': csrfToken
		}
	});
	return response.data;
}

export function parseContactDate(date: string, timezone: string): moment.Moment {
	return moment.tz(date.replace(/Z$/, ''), tryGetZoneFromCode(timezone));
}

export async function getContactRequestData(): Promise<RequestMetadata> {
	const login = await loginToContact();
	const token = login.Data.Token;
	const profile = await getContactProfile(token);
	const csrfToken = profile.customer.xcsrfToken;
	const contractId = profile.customer.account.contracts[0].id;

	return { contractId, token, csrfToken };
}
