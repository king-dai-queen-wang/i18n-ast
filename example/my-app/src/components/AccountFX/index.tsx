/** @format */

import React, { Component } from 'react'
import { View, ScrollView } from 'react-native'
import AccountType from 'middlewares/AccountType'
import Qualification from 'middlewares/Qualification'
import { NavigationScreenProp } from 'react-navigation'
import { getFormValues, reduxForm, change, initialize } from 'redux-form'
import { SCREEN_HEADER_TITLES } from 'constants/router'
import { genHeaderStyle, genHeaderBackWithStep } from 'constants/nav'
import { connect } from 'react-redux'
import { RootState } from 'types/global.d'
import { bindActionCreators, Dispatch } from 'redux'
import { oc } from 'ts-optchain'
import { EMFormNames } from 'types/form.d'
import { EMPayeeAccountType, EMFXAccountFields, EMPayeeAccountHolderType } from 'types/account.d'
import Divider from 'components/Divider'
import Steps from 'components/Steps'
import { ESteps, EStepUsages } from 'types/step.d'
import * as meActions from 'actions/me'
import * as metaActions from 'actions/meta'
import { EMMetaUsages } from 'types/meta.d'
import { setStep } from 'actions/step'
import Meta from 'middlewares/Meta'
import { PinkTip } from 'components/Tips'
import Limit from 'middlewares/Limit'
import { EMLimitUsages } from 'types/util.d'
import { EWithdrawType } from 'types/withdraw.d'

import StepOne from './StepOne'
import StepTwo from './StepTwo'
import StepThree from './StepThree'
import styles from './style'
import { mapTypeToTip } from '../utils'
import { EMFirmRegions } from 'types/basic.d'
import { TableItemType } from 'types/grantWithdraw.d'

interface TProps {
	actions: {
		[propName: string]: any
	}
	[propName: string]: any
}
const stepOptions = [
	{
		text: '填写信息',
	},
	{
		text: '授权确认',
	},
	{
		text: '绑卡成功',
	},
]
@connect(
	(state: RootState) => ({
		profile: state.me.profile,
		formValues: getFormValues(EMFormNames.CreateFXAccount)(state),
		step: state.step[EStepUsages.CreateFXAccount].step,
		banks: state.meta[EMMetaUsages.BankList],
		legal: state.meta[EMMetaUsages.LegalProfile],
		chooseFormValues: getFormValues(EMFormNames.CreateFXAccount)(state),
		shareholdList: state.withdraw.shareholdList,
	}),
	(dispatch: Dispatch) => ({
		actions: bindActionCreators({ ...meActions, ...metaActions, change, setStep, initialize }, dispatch),
	}),
)
@(reduxForm({
	form: EMFormNames.CreateFXAccount,
}) as any)
class AccountFX extends Component<TProps, any> {
	constructor(props: any) {
		super(props)
		this.state = {
			historyAccountNo: null,
		}
	}
	componentDidMount() {
		const { profile, banks, navigation, shareholdList } = this.props
		const profileData = oc(profile).data(null)
		const bankList = oc(banks).data.bankList(null)
		const beneficiaryAccountId = oc(navigation).state.params.beneficiaryAccountId(null)
		if (!profileData) this.props.actions.getProfileRequested()
		if (!bankList) this.props.actions!.fetchMetaRequested({ usage: EMMetaUsages.BankList })
		this.props.actions.setStep({ usage: EStepUsages.CreateFXAccount, step: ESteps.ONE })
		if (beneficiaryAccountId) {
			this.props.actions.fetchMetaRequested({
				usage: EMMetaUsages.PayeeAccountDetail,
				params: { beneficiaryAccountId },
				successAction: this.detailSuccessAction,
			})
		} else {
			// this.props.actions!.change(
			//   EMFormNames.CreateFXAccount,
			//   EMFXAccountFields.HolderType,
			//   PayeeAccountHolderTypeOptions[0].value
			// )
		}
	}
	componentWillUnmount() {
		this.props.actions.initialize(EMFormNames.CreateFXAccount, {})
	}

	detailSuccessAction = (data: any = {}) => {
		const { banks } = this.props
		const bankList = oc(banks).data.bankList(null)
		const selectedBank = bankList && bankList.find((x: any) => x.name === data.beneficiaryBankName)
		const initData: any = {
			[EMFXAccountFields.HolderType]: data.holderType,
			[EMFXAccountFields.BankName]: selectedBank && selectedBank.code,
			[EMFXAccountFields.BankAccountName]: data.beneficiaryAccountName,
		}
		if (data.holderType === EMPayeeAccountHolderType.Firm) {
			initData[EMFXAccountFields.BankProvince] = data.province
			initData[EMFXAccountFields.BankCity] = data.city
			initData[EMFXAccountFields.BankBranchName] = data.beneficiaryBankSubbranchName
		}
		this.props.actions.initialize(EMFormNames.CreateFXAccount, initData)
		this.setState({ historyAccountNo: data.maskAccountNo })
	}
	render() {
		const { step, navigation, meta, profile, legal } = this.props
		const limit = oc(meta)[EMMetaUsages.PayeeAccountLimit].data({})
		const tip = mapTypeToTip(EMPayeeAccountType.FX, limit)
		const beneficiaryAccountId = oc(navigation).state.params.beneficiaryAccountId(null)
		const firmRegion = oc(profile).data.firmRegion(null)
		const legalRepresentativeName = oc(profile).data.legalRepresentativeName(null)
		const crossBorderDirectorName = oc(legal).data.userName(null)
		const hkUserId = legal.data?.userId
		const legalName = firmRegion === EMFirmRegions.HK ? crossBorderDirectorName : legalRepresentativeName

		return (
			<ScrollView
				style={styles.wrap}
				scrollEventThrottle={16}
				showsVerticalScrollIndicator={false}
				keyboardShouldPersistTaps='handled' // tap through it's very important work in IOS
			>
				<Steps options={stepOptions} step={step} />
				<Divider style={{ backgroundColor: '#e7e7e7' }} />
				<View style={styles.content}>
					{step === ESteps.ONE && <PinkTip text={tip && tip.text} />}
					<Divider />
					{step === ESteps.ONE && (
						<StepOne
							navigation={navigation}
							beneficiaryAccountId={beneficiaryAccountId}
							historyAccountNo={this.state.historyAccountNo}
							isUpdate={!!beneficiaryAccountId}
							legalName={legalName}
						/>
					)}
					{step === ESteps.TWO && (
						<StepTwo
							navigation={navigation}
							beneficiaryAccountId={beneficiaryAccountId}
							isUpdate={!!beneficiaryAccountId}
							legalName={legalName}
							hkUserId={hkUserId}
						/>
					)}
					{step === ESteps.THREE && <StepThree navigation={navigation} />}
				</View>
			</ScrollView>
		)
	}
}
const EnhancedComponent: any = Qualification({ va: false, bankCard: false, tradePwd: true })(
	Limit({
		type: EMLimitUsages.WithdrawRestrict,
		cache: false,
		params: { title: '添加结汇提现账户', reqParams: { type: EWithdrawType.CROSS_BORDER } },
	})(AccountType()(Meta({ usage: EMMetaUsages.PayeeAccountLimit })(AccountFX))),
)
EnhancedComponent.navigationOptions = ({
	navigation,
}: {
	navigation: NavigationScreenProp<any, { setHeaderBtmBorder: any; to: any }>
}) => ({
	title: SCREEN_HEADER_TITLES.AccountFX,
	headerStyle: genHeaderStyle(navigation),
	headerLeft: genHeaderBackWithStep(navigation),
	headerRight: null,
})
export default EnhancedComponent
