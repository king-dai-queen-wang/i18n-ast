/** @format */

import React, { Component } from 'react'
import { View, Text } from 'react-native'
import { Field, getFormValues, reduxForm, change } from 'redux-form'
import { connect } from 'react-redux'
import { RootState } from 'types/global.d'
import { bindActionCreators, Dispatch } from 'redux'
import { oc } from 'ts-optchain'
import { CheckboxComponent, SubmitButton } from 'components/Forms'
import { EMFormNames } from 'types/form.d'
import { EMPayeeAccountHolderType, EMPayeeAccountType } from 'types/account.d'
import { EMFlowIdRequestedUsages } from 'types/security.d'
import { EMMetaUsages } from 'types/meta.d'
import { ESteps, EStepUsages } from 'types/step.d'
import * as stepActions from 'actions/step'
import * as submitActions from 'actions/submit'
import { EMSubmitUsages } from 'types/submit.d'
import {
	FX_ACCOUNT_AGREEMENT_VERSION,
	FX_ACCOUNT_PUBLIC_AGREEMENT_NAME,
	FX_ACCOUNT_PRIVATE_AGREEMENT_NAME,
	FX_ACCOUNT_AGREEMENT_SOURCE,
	FX_BANK_LOC_UID,
	BIND_FIRM_FX_WITHDRAW_ACCOUNT,
	BIND_PERSONAL_FX_WITHDRAW_ACCOUNT,
} from 'constants/account'

import styles from './style'
import { extractFormValues } from '../utils'
import { findGeoName } from 'utils/account'
import { TableItemType } from 'types/grantWithdraw.d'
import { EMFirmRegions } from 'types/basic.d'

interface TValidateFields {
	agree: string
}

const validate = (values: any) => {
	const errors: Partial<TValidateFields> = {}

	if (!values.agree) {
		errors.agree = '请阅读此声明并同意授权'
	}

	return errors
}

@connect(
	(state: RootState) => ({
		fieldProvinces: state.addressLocations[FX_BANK_LOC_UID] ? state.addressLocations[FX_BANK_LOC_UID].provinceList : [],
		fieldCities: state.addressLocations[FX_BANK_LOC_UID] ? state.addressLocations[FX_BANK_LOC_UID].cityList : [],
		flowIds: state.security.flowIds,
		profile: state.me.profile,
		legal: state.meta[EMMetaUsages.LegalProfile],
		formValues: getFormValues(EMFormNames.CreateFXAccount)(state),
		banks: state.meta[EMMetaUsages.BankList],
		createAccount: state.submit[EMSubmitUsages.CreatePayeeAccount],
		updateAccount: state.submit[EMSubmitUsages.UpdatePayeeAccount],
		shareholdList: state.withdraw.shareholdList,

		// sign: state.meta[EMMetaUsages.SignProtocolVersion],
		// versions: state.meta[EMMetaUsages.LaterProtocolVersion],
		// todo: 
		signedAgreements: state.meta[EMMetaUsages.SignProtocolVersion],
		laterProtocolVersion: state.meta[EMMetaUsages.LaterProtocolVersion],

	}),
	(dispatch: Dispatch) => ({
		actions: bindActionCreators({ change, ...(stepActions as any), ...submitActions }, dispatch),
	}),
)
@(reduxForm({
	validate,
	form: EMFormNames.CreateFXAccountConfirm,
}) as any)
export default class StepOne extends Component<any, any> {
	componentDidMount() {}

	handleSign = (params: {holderType: EMPayeeAccountHolderType}) => {
		console.log('sign', this.props, params);
		let protocol = null
		if(params.holderType === EMPayeeAccountHolderType.Firm ) {
			protocol = BIND_FIRM_FX_WITHDRAW_ACCOUNT
		} else if(params.holderType === EMPayeeAccountHolderType.Personal ) {
			protocol = BIND_PERSONAL_FX_WITHDRAW_ACCOUNT
		}
		const { laterProtocolVersion, signedAgreements } = this.props
		// 判断 所有已经签署的 有没有签署过 这个协议名， 签署过则退出
		if (signedAgreements?.data?.hasOwnProperty(protocol)) {
			return
		}
		const agreementVersion = laterProtocolVersion?.data?.[protocol!] ?? null
		if (agreementVersion) {
			this.props.actions.fetchMetaRequested({
				usage: EMMetaUsages.SignProtocol,
				params: {
					agreementName: protocol,
					agreementVersion: agreementVersion,
				},
			})
		}
	}
	
	handleNext = () => {
		const { profile, banks, formValues, beneficiaryAccountId, isUpdate, shareholdList, flowIds, hkUserId } = this.props
		const {
			holderType,
			bankName: bankBic,
			bankProvince,
			bankCity,
			bankBranchName,
			bankAccountNo,
			phoneNo,
			bankAccountName,
		} = extractFormValues(formValues)
		const firmRegion = profile.data?.firmRegion
		const flowIdUsage = isUpdate
			? EMFlowIdRequestedUsages.UpdateAcountBindMobile
			: EMFlowIdRequestedUsages.AddAccountBindMobile
		const flowIdString = oc(flowIds)[flowIdUsage].data('')
		const firmName = oc(profile).data.firmName(null)
		const legalName = oc(profile).data.legalRepresentativeName(null)
		const accountName =
			(holderType === EMPayeeAccountHolderType.Firm && firmName) ||
			(holderType === EMPayeeAccountHolderType.Personal && legalName) ||
			'--'

		const bankList = oc(banks).data.bankList(null)
		const selectedBank = bankList && bankList.find((x: any) => x.code === bankBic)
		const bankName = selectedBank && selectedBank.name
		const grantShareholdList = Array.isArray(shareholdList.data)
			? shareholdList.data?.filter((item: TableItemType) => item.status === 'Granted')
			: []
		let beneficiaryAccountName = accountName
		let userId
		if (grantShareholdList.length > 0) {
			grantShareholdList.forEach((item: TableItemType) => {
				if (item.userName === bankAccountName) {
					beneficiaryAccountName = item.userName
					userId = item.userId
				}
			})
		}

		if (firmRegion === EMFirmRegions.HK) {
			userId = hkUserId
		}

		const contract: any = {
			agreementVersion: FX_ACCOUNT_AGREEMENT_VERSION,
			source: FX_ACCOUNT_AGREEMENT_SOURCE,
		}
		const address: any = {}
		if (holderType === EMPayeeAccountHolderType.Firm) {
			contract.agreementName = FX_ACCOUNT_PUBLIC_AGREEMENT_NAME
			// address.province = bankProvince
			// address.city = bankCity
			address.geoCode = bankCity || bankProvince
			address.beneficiaryBankSubbranchName = bankBranchName
		}
		if (holderType === EMPayeeAccountHolderType.Personal) {
			contract.agreementName = FX_ACCOUNT_PRIVATE_AGREEMENT_NAME
		}
		const params = {
			holderType,
			bankAccountType: EMPayeeAccountType.FX,
			// region: 'China',
			geoCode: 'CN',
			beneficiaryAccountNo: bankAccountNo,
			beneficiaryAccountName,
			userId,
			beneficiaryBankName: bankName,
			beneficiaryBankBic: bankBic,
			isThirdPartyAccount: false,
			contractList: [contract],
			reservedMobile: phoneNo,
			flowId: flowIdString,
			...address,
		}

		if (beneficiaryAccountId) {
			return this.props.actions.submitRequested({
				params: { beneficiaryAccountId, body: params, flowId: flowIdString },
				usage: EMSubmitUsages.UpdatePayeeAccount,
			})
		}
		this.handleSign(params)
		this.props.actions.submitRequested({ params, usage: EMSubmitUsages.CreatePayeeAccount })
	}

	handleIdNum(userName: string) {
		const { shareholdList } = this.props
		return shareholdList?.data?.filter((item: any) => item.userName === userName)[0]?.idNum
	}

	handleLast = () => {
		this.props.actions.setStep({ usage: EStepUsages.CreateFXAccount, step: ESteps.ONE })
	}
	render() {
		const {
			profile,
			formValues,
			legal,
			invalid,
			banks,
			fieldProvinces,
			fieldCities,
			createAccount,
			updateAccount,
			legalName,
		} = this.props
		const {
			holderType,
			bankName: bankNameCode,
			bankProvince,
			bankCity,
			bankBranchName,
			bankAccountNo,
			bankAccountName,
		} = extractFormValues(formValues)
		const bankProvinceName = findGeoName(fieldProvinces, bankProvince)
		const bankCityName = findGeoName(fieldCities, bankCity)

		const identityNum = oc(legal).data.identityNum(null)
		const firmName = oc(profile).data.firmName(null)
		const accountName =
			(holderType === EMPayeeAccountHolderType.Firm && firmName) ||
			(holderType === EMPayeeAccountHolderType.Personal && (bankAccountName || legalName)) ||
			'--'
		const bankList = oc(banks).data.bankList(null)
		const selectedBank = bankList && bankList.find((x: any) => x.code === bankNameCode)
		const bankName = selectedBank && selectedBank.name
		return (
			<View style={styles.wrap}>
				<View style={styles.statement}>
					<Text style={styles.title}>授权声明</Text>
					<View>
						<Text style={styles.section}>
							本公司<Text style={styles.value}>{firmName}</Text>同意XTransfer将本公司收取的外贸收款提现至以下银行账户：
						</Text>
					</View>
					<View>
						<Text style={styles.section}>
							<Text style={styles.label}>银行名称&nbsp;&nbsp;&nbsp;</Text>
							<Text style={styles.value}>{bankName}</Text>
						</Text>
						{holderType === EMPayeeAccountHolderType.Firm && (
							<Text style={styles.section}>
								<Text style={styles.label}>分行地区&nbsp;&nbsp;&nbsp;</Text>
								<Text style={styles.value}>
									{bankProvinceName}
									{bankCityName}
								</Text>
							</Text>
						)}
						{holderType === EMPayeeAccountHolderType.Firm && (
							<Text style={styles.section}>
								<Text style={styles.label}>支行名称&nbsp;&nbsp;&nbsp;</Text>
								<Text style={styles.value}>{bankBranchName}</Text>
							</Text>
						)}
						<Text style={styles.section}>
							<Text style={styles.label}>账户名称&nbsp;&nbsp;&nbsp;</Text>
							<Text style={styles.value}>{accountName}</Text>
						</Text>
						<Text style={styles.section}>
							<Text style={styles.label}>银行账号&nbsp;&nbsp;&nbsp;</Text>
							<Text style={styles.value}>{bankAccountNo}</Text>
						</Text>
					</View>
					<View>
						<Text style={styles.section}>
							{holderType === EMPayeeAccountHolderType.Firm && (
								<Text>
									XTransfer按上述方式完成款项的划转后，本公司视同XTransfer已完成跨境收付款的结算服务，XTransfer对本公司不再承担任何付款义务。
								</Text>
							)}
							{holderType === EMPayeeAccountHolderType.Personal && (
								<Text>
									为了确保资金准确及时到账，同意XTransfer将以上银行账户信息及账户所有人身份信息（身份证号码：
									<Text style={styles.value}>{this.handleIdNum(accountName)}</Text>
									）提交至第三方验证；XTransfer按上述方式完成款项的划转后，本公司视同XTransfer已完成跨境收付款的结算服务，XTransfer对本公司不再承担任何付款义务。
								</Text>
							)}
						</Text>
					</View>
					<View>
						<Text style={styles.section}>
							本公司将承担上述行为的全部法律责任和后果，XTransfer无须为此承担法律责任，本委托授权自本公司向XTransfer申请解除上述银行账户绑定起终止。
						</Text>
					</View>
				</View>
				<View style={styles.field}>
					<Field
						label={<Text style={styles.label}>我已阅读此声明并同意授权</Text>}
						name='agree'
						component={CheckboxComponent}
					/>
				</View>
				<View style={styles.btn}>
					<SubmitButton
						text='确认申请'
						loading={createAccount?.loading || updateAccount?.loading}
						handlePress={this.handleNext}
						disabled={invalid}
					/>
				</View>
				<View style={styles.btn}>
					<SubmitButton text='上一步' handlePress={this.handleLast} />
				</View>
			</View>
		)
	}
}
