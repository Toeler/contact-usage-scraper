# Contact Usage Scraper

Persists contact.co.nz power usage

## Description

A simple app that will query contact.co.nz for a profile and puts usage data into an InfluxDB instance

## Getting Started

### Dependencies

* [Yarn](https://yarnpkg.com/)

### Installing

* Clone the repository
* Run `yarn install` in the root folder
* Create a .env file in the root folder with the following settings required to run:
	* CONTACT_API_KEY=
	* CONTACT_USERNAME=
	* CONTACT_PASSWORD=
	* INFLUX_TOKEN=
	* INFLUX_ORG=
	* INFLUX_BUCKET_POWER_ID=
	* INFLUX_BUCKET_POWER_NAME=

### Executing program

* Run `yarn start` in the root folder
* Step-by-step bullets