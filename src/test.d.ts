// import { DangerDSLType } from 'danger';

declare namespace NodeJS {
	interface Global {
		danger: any;
		fail(): void;
		markdown(): void;
		message(): void;
		warn(): void;
	}
}
