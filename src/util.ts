
import { zones } from 'moment-timezone/data/packed/latest.json';

export function tryGetZoneFromCode(code: string): string {
	const possibleZones = [];
	for (const key in zones) {
		const zone = zones[key];
		if (zone) {
			const parts = zone.split('|');
			const name = parts[0];
			const abbreviations = parts[1].split(' ');
			if (abbreviations.indexOf(code) !== -1) {
				possibleZones.push(name);
			}
		}
	}
	if (possibleZones.length === 0) {
		console.warn(`Found no zones for ${code}`);
	} else if (possibleZones.length > 1) {
		console.warn(`Found ${possibleZones.length} zones for ${code}. Returning first (${possibleZones[0]})`);
	}
	return possibleZones[0];
}