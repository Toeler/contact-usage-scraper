export interface ProfileResponse {
	sessionID: string,
	customer: {
		xcsrfToken: string,
		id: string,
		firstName: string,
		lastName: string,
		fullName: string,
		customerStatus: string,
		propertySwitchers: {
			contractAccountId: string,
			address: string
		}[],
		properties: {
			contractAccountId: string,
			nickName: string,
			premises: {
				contracts: string[],
				premiseId: string,
				address: string,
				broadband: unknown[]
			}[]
		}[],
		account: {
			id: string,
			nickname: string,
			currentBalance: string,
			remainingDays: number,
			payments: {
				amount: string,
				date: string
			}[],
			correspondencePreference: string,
			MonthOff: object,
			paymentMethod: string,
			isSmoothPay: boolean,
			isPrepay: boolean,
			prepayDebtBalance: string,
			isEligibleMonthOff: boolean,
			directDebit: boolean,
			directDebitAccount: string,
			discountTotal: string,
			amountDue: string,
			paymentDueDate: string,
			daysTilOverdue: number,
			amountPaid: string,
			transactions: {
				date: string,
				description: string,
				amount: number,
				formattedAmount: string,
				invoiceId: string
			}[],
			nextBillDate: string,
			nextBillAmount: number,
			nextBillPPD: number,
			lastBillDate: string,
			contracts: {
				id: string,
				consumptionData: unknown,
				icp: string,
				meterType: string,
				promptPaymentDiscount: string,
				premise: {
					id: string,
					supplyAddress: {
						houseNumber: string,
						street: string,
						city: string,
						postalCode: number,
						shortForm: string
					}
				},
				contractType: number,
				contractTypeLabel: string,
				devices: {
					id: string,
					serialNumber: string,
					deviceProductType: unknown,
					registers: {
						id: string,
						readingUnitType: string,
						registerType: string,
						PreviousMeterReading: string,
						PreviousMeterReadingDate: string
					}[],
					nonBillableRegisters: unknown[],
					nextMeterReadDate: string,
					nextReadingIsEstimate: boolean
				}[],
				formattedCurrentBalance: string
			}[],
			email: string,
			sequenceNumber: string,
			marketingPreference: string,
			postalAddress: {
				houseNumber: string,
				street: string,
				city: string,
				postalCode: number,
				shortForm: string,
				addressID: string
			},
			phones: {
				phoneNumberType: string,
				phoneNumber: string,
				sequenceNumber: string,
				preferredNumber: boolean
			}[]
		}
	}
}
