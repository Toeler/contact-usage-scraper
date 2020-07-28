import dotenv from 'dotenv';
import convict from 'convict';
import path from 'path';

dotenv.config();

convict.addFormat(require('convict-format-with-validator').url);

const config = convict({
	contact: {
		sign_in_url: {
			doc: 'The URL used to log into a Contact account to get a token',
			format: 'url',
			default: 'https://contact.co.nz/contact/account/signin',
			env: 'CONTACT_SIGN_IN_URL'
		},
		api_url: {
			doc: 'The URL for all API requests to Contact',
			format: 'url',
			default: 'https://api.contact-digital-prod.net',
			env: 'CONTACT_API_URL'
		},
		api_key: {
			doc: 'API Key used for requests to Contact',
			format: String,
			sensitive: true,
			default: null,
			env: 'CONTACT_API_KEY'
		},
		username: {
			doc: 'The username of the Contact account',
			format: String,
			default: null,
			env: 'CONTACT_USERNAME'
		},
		password: {
			doc: 'The password of the Contact account',
			format: String,
			sensitive: true,
			default: null,
			env: 'CONTACT_PASSWORD'
		},
		dailyChargeNzd: {
			doc: 'A flat NZD amount added to each day of power use',
			format: Number,
			env: 'CONTACT_DAILY_CHARGE',
			default: 62.7
		},
		discountPercentage: {
			doc: 'A discount to apply to all charges',
			format: Number,
			env: 'CONTACT_DISCOUNT',
			default: 3
		},
		kwhRate: {
			doc: 'The price per Kilowatt-Hour',
			format: Number,
			env: 'CONTACT_KWH_RATE',
			default: 19.93
		}
	},
	influx: {
		url: {
			doc: 'The URL used for requests to Influx',
			format: 'url',
			default: 'https://eu-central-1-1.aws.cloud2.influxdata.com',
			env: 'INFLUX_URL'
		},
		token: {
			doc: 'The token used for Influx requests',
			format: String,
			sensitive: true,
			default: null,
			env: 'INFLUX_TOKEN'
		},
		org: {
			doc: 'The ID used to identify the organization in Influx',
			format: String,
			default: null,
			env: 'INFLUX_ORG'
		},
		buckets: {
			power: {
				id: {
					doc: 'The ID of the bucket used to store Power Usage information',
					format: String,
					default: null,
					env: 'INFLUX_BUCKET_POWER_ID'
				},
				name: {
					doc: 'The Name of the bucket used to store Power Usage information',
					format: String,
					default: null,
					env: 'INFLUX_BUCKET_POWER_NAME'
				}
			}
		},
		host: {
			doc: 'A string used to identify the service inserting data into Influx',
			format: String,
			default: 'contact-usage-scraper'
		}
	},
	power: {
		hoursBack: {
			doc: 'The number of days back to go for hourly data',
			format: Number,
			env: 'POWER_HOURS_BACK',
			default: 7*24
		},
		daysBack: {
			doc: 'The number of months back to go for daily data',
			format: Number,
			env: 'POWER_DAYS_BACK',
			default: 90
		},
		monthsBack: {
			doc: 'The number of years back to go for monthly data',
			format: Number,
			env: 'POWER_MONTHS_BACK',
			default: 12
		}
	}
});

config.validate({allowed: 'strict'});

export default config;