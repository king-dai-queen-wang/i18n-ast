/** @format */

import { oc } from 'ts-optchain'
import { EMFXAccountFields } from 'types/account.d'

export const extractFormValues = (data: any) => {
	return {
		holderType: oc(data)[EMFXAccountFields.HolderType](null),
		bankName: oc(data)[EMFXAccountFields.BankName](null),
		bankProvince: oc(data)[EMFXAccountFields.BankProvince](null),
		bankCity: oc(data)[EMFXAccountFields.BankCity](null),
		bankBranchName: oc(data)[EMFXAccountFields.BankBranchName](null),
		bankAccountNo: oc(data)[EMFXAccountFields.BankAccountNo](null),
		phoneNo: oc(data)[EMFXAccountFields.PhoneNo](null),
		bankAccountName: oc(data)[EMFXAccountFields.BankAccountName](null),
	}
}
