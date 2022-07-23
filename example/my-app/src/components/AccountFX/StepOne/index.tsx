/** @format */

import React, { Component } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { Field, getFormValues, reduxForm, change } from 'redux-form'
import { connect } from 'react-redux'
import { RootState } from 'types/global.d'
import * as modalActions from 'actions/modal'
import * as securityActions from 'actions/security'
import * as withdrawActions from 'actions/withdraw'
import * as metaActions from 'actions/meta'
import Icon from 'react-native-vector-icons/AntDesign'
import { bindActionCreators, Dispatch } from 'redux'
import { oc } from 'ts-optchain'
import { RadioComponent, BaseInput1, PickerComponent, LabelText, LabelSize, SubmitButton } from 'components/Forms'
import { EMFormNames } from 'types/form.d'
import { EMPayeeAccountHolderType, EMFXAccountFields } from 'types/account.d'
import { EMMetaUsages } from 'types/meta.d'
import { ESteps, EStepUsages } from 'types/step.d'
import { setStep } from 'actions/step'
import {
	FX_ACCOUNT_AGREEMENT_SOURCE,
	FX_ACCOUNT_AGREEMENT_VERSION,
	FX_ACCOUNT_PRIVATE_AGREEMENT_NAME,
	PayeeAccountHolderTypeOptions,
	FX_BANK_LOC_UID,
	HKPayeeAccountHolderTypeOptions,
} from 'constants/account'
import { normalizeText } from 'utils/normalize'
import Loading from 'components/Loading'
import { CusButton } from 'components/Buttons'
import Idx from 'idx'
import { EMFlowIdRequestedUsages, EMCaptchaUsages, EMVCodeUsages } from 'types/security.d'
import { CountDownUsages } from 'types/countdown.d'
import { validPhone } from 'utils/validate'
import { genToastNeedOffConfig } from 'constants/modal'
import { BIND_MOBILE_TIP } from 'constants/basic'
import Modal from 'react-native-modal'
import { extractFormValues } from '../utils'
import { findGeoName } from 'utils/account'
import SelectAddressField from '../../../../components/SelectAddressField'
import styles from './style'
import { EMFirmRegions } from 'types/basic.d'
import { TableItemType } from 'types/grantWithdraw.d'
import { value } from 'numeral'

export interface IFXAccountValidateFields {
	[EMFXAccountFields.HolderType]: string
	[EMFXAccountFields.BankName]: string
	[EMFXAccountFields.BankProvince]: string
	[EMFXAccountFields.BankCity]: string
	[EMFXAccountFields.BankBranchName]: string
	[EMFXAccountFields.BankAccountNo]: string
	[EMFXAccountFields.ConfirmAccountNo]: string
	[EMFXAccountFields.PhoneNo]: string
	[EMFXAccountFields.Vcode]: string
}

const validate = (values: any, props: any) => {
	const fieldProvinces = props.fieldProvinces
	const fieldCities = props.fieldCities
	const errors: any | Partial<IFXAccountValidateFields> = {}

	if (!values[EMFXAccountFields.HolderType]) {
		errors[EMFXAccountFields.HolderType] = '请选择账户类型'
	}
	if (!values[EMFXAccountFields.BankName]) {
		errors[EMFXAccountFields.BankName] = '请选择收款银行'
	}
	if (!values[EMFXAccountFields.BankName]) {
		errors[EMFXAccountFields.BankName] = '请选择收款银行'
	}
	if (
		values[EMFXAccountFields.HolderType] === EMPayeeAccountHolderType.Personal &&
		!values[EMFXAccountFields.BankAccountName]
	) {
		errors[EMFXAccountFields.BankAccountName] = '请选择银行账户名称'
	}

	if (values[EMFXAccountFields.HolderType] === EMPayeeAccountHolderType.Firm) {
		const province = values[EMFXAccountFields.BankProvince]
		const provinceName = findGeoName(fieldProvinces, province)
		const city = values[EMFXAccountFields.BankCity]
		const cityName = findGeoName(fieldCities, city)
		const branchName = values[EMFXAccountFields.BankBranchName]

		if (!province) {
			errors[EMFXAccountFields.BankProvince] = '分行地区省份不能为空'
		} else if (!/^[\u4e00-\u9fa5\u4dae\uE863\u1201]{1,70}$/.test(provinceName)) {
			errors[EMFXAccountFields.BankProvince] = '仅支持简体中文且不超过70个字符'
		}

		if (!city) {
			errors[EMFXAccountFields.BankCity] = '分行地区城市不能为空'
		} else if (!/^[\u4e00-\u9fa5\u4dae\uE863\u1201]{1,70}$/.test(cityName)) {
			errors[EMFXAccountFields.BankCity] = '仅支持简体中文且不超过70个字符'
		}

		if (!branchName) {
			errors[EMFXAccountFields.BankBranchName] = '支行名称不能为空'
		} else if (!/^[\u4e00-\u9fa5\u4dae\uE863\u1201]{1,70}$/.test(branchName)) {
			errors[EMFXAccountFields.BankBranchName] = '仅支持简体中文且不超过70个字符'
		}
	}

	const accountNo = values[EMFXAccountFields.BankAccountNo]
	const comfirmAccountNo = values[EMFXAccountFields.ConfirmAccountNo]

	if (!accountNo) {
		errors[EMFXAccountFields.BankAccountNo] = '银行账号不能为空'
	} else if (!/^\d+$/.test(accountNo)) {
		errors[EMFXAccountFields.BankAccountNo] = '含有非法字符，仅支持输入数字'
	} else if (accountNo.length < 4) {
		errors[EMFXAccountFields.BankAccountNo] = '请输入正确的银行账号'
	} else if (accountNo.length > 60) {
		errors[EMFXAccountFields.BankAccountNo] = '输入内容已超过60个字符'
	}

	if (!comfirmAccountNo) {
		errors[EMFXAccountFields.ConfirmAccountNo] = '请确认收款账号'
	} else if (!/^\d+$/.test(comfirmAccountNo)) {
		errors[EMFXAccountFields.ConfirmAccountNo] = '含有非法字符，仅支持输入数字'
	} else if (comfirmAccountNo.length < 4) {
		errors[EMFXAccountFields.ConfirmAccountNo] = '请输入正确的银行账号'
	} else if (comfirmAccountNo.length > 60) {
		errors[EMFXAccountFields.ConfirmAccountNo] = '输入内容已超过60个字符'
	} else if (comfirmAccountNo !== accountNo) {
		errors[EMFXAccountFields.ConfirmAccountNo] = '收款账号不一致，请确认'
	}

	if (values[EMFXAccountFields.HolderType] === EMPayeeAccountHolderType.Personal) {
		const phoneNo = values[EMFXAccountFields.PhoneNo]
		const vCode = values[EMFXAccountFields.Vcode]
		if (!phoneNo) {
			errors[EMFXAccountFields.PhoneNo] = '请输入银行预留手机号'
		}
		if (!vCode) {
			errors[EMFXAccountFields.Vcode] = '验证码不能为空'
		} else if (vCode.trim().length !== 4) {
			errors[EMFXAccountFields.Vcode] = '请输入4位短信验证码'
		}
	}

	return errors
}

@connect(
	(state: RootState) => {
		return {
			security: state.security,
			verify: state.withdraw.verify,
			shareholdList: state.withdraw.shareholdList,
			countdown: state.countdown[CountDownUsages.AddAccountBindMobile],
			updateCountDown: state.countdown[CountDownUsages.UpdateAcountBindMobile],
			profile: state.me.profile,
			formValues: getFormValues(EMFormNames.CreateFXAccount)(state),
			banks: state.meta[EMMetaUsages.BankList],
			fieldProvinces: state.addressLocations[FX_BANK_LOC_UID]
				? state.addressLocations[FX_BANK_LOC_UID].provinceList
				: [],
			fieldCities: state.addressLocations[FX_BANK_LOC_UID] ? state.addressLocations[FX_BANK_LOC_UID].cityList : [],
			flowIds: state.security.flowIds,
			legal: state.meta[EMMetaUsages.LegalProfile],
		}
	},
	(dispatch: Dispatch) => ({
		actions: bindActionCreators(
			{ change, setStep, ...withdrawActions, ...modalActions, ...securityActions, ...metaActions },
			dispatch,
		),
	}),
)
@(reduxForm({
	validate,
	destroyOnUnmount: false,
	forceUnregisterOnUnmount: true,
	form: EMFormNames.CreateFXAccount,
}) as any)
export default class StepOne extends Component<any, any> {
	vcodeRef = React.createRef<HTMLInputElement>()

	state = {
		initialProvinceCode: undefined,
		showModal: false,
		customedHolderTypeOptions: null,
	}

	componentDidMount() {
		const { formValues, isUpdate, profile, legalName } = this.props
		const firmRegion = oc(profile).data.firmRegion(null)

		if (firmRegion === EMFirmRegions.HK) {
			this.props.actions.change(
				EMFormNames.CreateFXAccount,
				EMFXAccountFields.HolderType,
				EMPayeeAccountHolderType.Personal,
			)
			this.props.actions.change(EMFormNames.CreateFXAccount, EMFXAccountFields.BankAccountName, legalName)
			this.setState({ customedHolderTypeOptions: HKPayeeAccountHolderTypeOptions })
		}
		this.props.actions.exchangeStaffListRequest() // 股东列表
		this.setState({
			initialProvinceCode: formValues?.[EMFXAccountFields.BankProvince],
		})
		this.props.actions.flowIdRequested({
			usage: isUpdate ? EMFlowIdRequestedUsages.UpdateAcountBindMobile : EMFlowIdRequestedUsages.AddAccountBindMobile,
		})
	}

	componentWillUnmount() {
		console.log('UnmountUnmount')
	}

	handleNext = () => {
		const { formValues, isUpdate, beneficiaryAccountId } = this.props
		const holderType = oc(formValues)[EMFXAccountFields.HolderType](null)
		if (holderType === EMPayeeAccountHolderType.Personal) {
			const { banks, flowIds } = this.props
			const flowIdUsage = isUpdate
				? EMFlowIdRequestedUsages.UpdateAcountBindMobile
				: EMFlowIdRequestedUsages.AddAccountBindMobile
			const flowIdString = oc(flowIds)[flowIdUsage].data('')
			const { bankName: bankBic, bankAccountNo } = extractFormValues(formValues)
			const reservedMobile = oc(formValues)[EMFXAccountFields.PhoneNo](null)
			const msgVCode = oc(formValues)[EMFXAccountFields.Vcode](null)
			const bankList = oc(banks).data.bankList(null)
			const selectedBank = bankList && bankList.find((x: any) => x.code === bankBic)
			const bankName = selectedBank && selectedBank.name
			const contract: any = {
				agreementVersion: FX_ACCOUNT_AGREEMENT_VERSION,
				source: FX_ACCOUNT_AGREEMENT_SOURCE,
			}
			contract.agreementName = FX_ACCOUNT_PRIVATE_AGREEMENT_NAME
			const params: any = {
				flowId: flowIdString,
				beneficiaryAccountNo: bankAccountNo,
				beneficiaryBankName: bankName,
				beneficiaryBankBic: bankBic,
				contractList: [contract],
				reservedMobile,
				msgVCode,
				isUpdate,
			}
			if (beneficiaryAccountId) {
				params.beneficiaryAccountId = beneficiaryAccountId
			}
			this.props.actions.withdrawFXAddVerifyRequested(params)
		} else {
			this.props.actions.setStep({ usage: EStepUsages.CreateFXAccount, step: ESteps.TWO })
		}
	}
	handleChange = () => {
		this.props.actions.change(EMFormNames.CreateFXAccount, EMFXAccountFields.BankCity, null)
	}
	_showToastError = (str: string) => {
		this.props.actions!.toggleToast(genToastNeedOffConfig(str))
	}
	_showHideModal = () => {
		this.setState({ showModal: !this.state.showModal })
	}
	preSendMessage = () => {
		const { formValues, security, isUpdate } = this.props
		const flowIdUsage = isUpdate
			? EMFlowIdRequestedUsages.UpdateAcountBindMobile
			: EMFlowIdRequestedUsages.AddAccountBindMobile
		const phoneNo = oc(formValues)[EMFXAccountFields.PhoneNo](null)
		const flowIdStr = Idx(security, _ => _.flowIds[flowIdUsage].data)
		if (!flowIdStr) {
			// 千年难遇
			this._showToastError('页面错误,请下拉刷新重试')
			return
		}
		if (!phoneNo || !validPhone(phoneNo)) {
			this._showToastError('请填写正确的账号')
			return
		}

		this.props.actions!.checkABVType({
			usage: isUpdate ? EMCaptchaUsages.UpdateAcountBindMobile : EMCaptchaUsages.AddAccountBindMobile,
			callback: this.sendMessage,
		})
	}
	sendMessage = (captchaVCode: any) => {
		const { formValues, security, isUpdate } = this.props
		const flowIdUsage = isUpdate
			? EMFlowIdRequestedUsages.UpdateAcountBindMobile
			: EMFlowIdRequestedUsages.AddAccountBindMobile
		const phoneNo = oc(formValues)[EMFXAccountFields.PhoneNo](null)
		// 检测Captcha是否填写
		const flowIdStr = Idx(security, _ => _.flowIds[flowIdUsage].data)

		// send message
		this.props.actions!.vCodeRequested({
			captchaVCode,
			usage: isUpdate ? EMVCodeUsages.UpdateAcountBindMobile : EMVCodeUsages.AddAccountBindMobile,
			flowId: flowIdStr,
			receiver: phoneNo,
		})
	}
	_renderVCodeRightCom = (vcodeLoading: boolean, left: number, vcodeDisabled: boolean) => {
		if (vcodeLoading) return <Loading style={{ width: 80, height: 40 }} />
		if (left > 0) return <CusButton text={`${left}s     `} handlePress={() => {}} disabled />
		return (
			<CusButton text='发送验证码' accLabel='sendVCode' handlePress={this.preSendMessage} disabled={vcodeDisabled} />
		)
	}

	holderTypeChange = (value: string) => {
		const { shareholdList } = this.props
		if (value === 'TO_PRIVATE') {
			const grantedList = Array.isArray(shareholdList.data)
				? shareholdList.data?.filter((item: TableItemType) => item.status === 'Granted')
				: []
			this.props.actions.change(
				EMFormNames.CreateFXAccount,
				EMFXAccountFields.BankAccountName,
				grantedList.length > 0 && grantedList[0]?.userName,
			)
		}
	}

	renderMobileTip = () => {
		return (
			<View style={styles.tipWrapper}>
				<Text style={styles.tipLabel}>预留手机号</Text>
				<View style={styles.tipGap} />
				<Icon name='questioncircle' size={15} color={'#aeb2c5'} onPress={this._showHideModal} />
			</View>
		)
	}
	render() {
		const { initialProvinceCode, showModal, customedHolderTypeOptions } = this.state
		const {
			profile,
			formValues,
			banks,
			invalid,
			historyAccountNo,
			security,
			countdown,
			verify,
			isUpdate,
			updateCountDown,
			legalName,
			shareholdList,
		} = this.props

		const holderType = oc(formValues)[EMFXAccountFields.HolderType](null)
		const firmName = oc(profile).data.firmName(null)
		const bankList = oc(banks).data.bankList(null)
		const bankOptions = bankList && bankList.map((x: any) => ({ label: x.name, value: x.code }))
		const vcodeLoading = Idx(
			security,
			_ => _.vcode[isUpdate ? EMVCodeUsages.UpdateAcountBindMobile : EMVCodeUsages.AddAccountBindMobile].loading,
		)
		const left = Idx(isUpdate ? updateCountDown : countdown, _ => _.left)
		const vcodeDisabled =
			!oc(formValues)[EMFXAccountFields.PhoneNo]() || !validPhone(oc(formValues)[EMFXAccountFields.PhoneNo]())
		const { loading: verifyLoading } = oc(verify)({})

		const tempList = Array.isArray(shareholdList.data)
			? shareholdList.data?.filter((item: TableItemType) => item.status === 'Granted')
			: []
		const grantShareholdList =
			tempList && tempList.map((x: TableItemType) => ({ label: x.userName, value: x.userName }))

		return (
			<View style={styles.wrap}>
				<View style={styles.field}>
					<Field
						label='账户类型'
						name={EMFXAccountFields.HolderType}
						component={RadioComponent}
						options={customedHolderTypeOptions || PayeeAccountHolderTypeOptions}
						onChange={this.holderTypeChange}
					/>
				</View>
				<View style={styles.field}>
					<Field
						label='开户地区'
						name='AccountArea'
						component={BaseInput1}
						noInput={true}
						noInputComponent={<Text>中国大陆</Text>}
					/>
				</View>
				<View style={styles.field}>
					{holderType === EMPayeeAccountHolderType.Personal && grantShareholdList.length > 1 ? (
						<Field
							label='银行账户名称'
							name={EMFXAccountFields.BankAccountName}
							component={PickerComponent}
							options={grantShareholdList}
							placeholder='请选择银行账户名称'
						/>
					) : (
						<Field
							label='银行账户名称'
							name={EMFXAccountFields.BankAccountName}
							component={BaseInput1}
							noInput={true}
							noInputComponent={
								<Text>
									{(holderType === EMPayeeAccountHolderType.Firm && firmName) ||
										(holderType === EMPayeeAccountHolderType.Personal && legalName) || (
											<Text style={styles.placeholder}>请先选择账户类型</Text>
										)}
								</Text>
							}
						/>
					)}
				</View>
				<View style={styles.content}>
					{holderType && (
						<View>
							<View style={styles.input}>
								<Field
									label='银行名称'
									name={EMFXAccountFields.BankName}
									component={PickerComponent}
									options={bankOptions}
									placeholder='请选择收款银行'
								/>
							</View>
							{holderType === EMPayeeAccountHolderType.Firm && (
								<View>
									<View style={styles.input}>
										<LabelText label='分行地区' type={LabelSize.normal} style={styles.btmLabel} />
										<View style={[styles.value, styles.adrWrap]}>
											<SelectAddressField
												startingPoint='province'
												endingPoint='area'
												provinceProps={{
													name: EMFXAccountFields.BankProvince,
													placeholder: '请选择省份/州/地区',
													wrapperStyle: { flex: 1, marginRight: 16 },
													multipleItems: true,
												}}
												cityProps={{
													name: EMFXAccountFields.BankCity,
													placeholder: '请选择城市/地区',
													wrapperStyle: { flex: 1 },
													multipleItems: true,
												}}
												presetLocs={{ country: 'CN', province: initialProvinceCode }}
												uid={FX_BANK_LOC_UID}
												formName={EMFormNames.CreateFXAccount}
												persist
												queryType='BANK_REGION'
											/>
										</View>
									</View>
									<View style={styles.input}>
										<Field
											label='支行名称'
											name={EMFXAccountFields.BankBranchName}
											component={BaseInput1}
											placeholder='如: 招商银行南京分行城东支行'
										/>
									</View>
								</View>
							)}
							<View style={styles.input}>
								<Field
									label='银行账号'
									name={EMFXAccountFields.BankAccountNo}
									component={BaseInput1}
									placeholder={historyAccountNo ? `上次提交银行账号：${historyAccountNo}` : '请输入收款银行账号'}
								/>
								{holderType === EMPayeeAccountHolderType.Personal && (
									<Text style={styles.tip}>
										仅支持 <Text style={styles.highTip}>Ⅰ类银行账户</Text>，请和开户行确认账户类型
									</Text>
								)}
							</View>
							<View style={styles.input}>
								<Field
									label='确认银行账号'
									name={EMFXAccountFields.ConfirmAccountNo}
									component={BaseInput1}
									placeholder='请再次输入收款银行账号'
									contextMenuHidden={true}
									selectTextOnFocus={false}
								/>
							</View>
							{holderType === EMPayeeAccountHolderType.Personal && (
								<View style={styles.input}>
									<View style={styles.input}>
										{this.renderMobileTip.call(this)}
										<Field
											// label={this.renderMobileTip.call(this)}
											name={EMFXAccountFields.PhoneNo}
											component={BaseInput1}
											placeholder='请输入银行预留手机号'
											onSubmitEditing={() => (this.vcodeRef.current as any).focus()}
										/>
									</View>
									<Field
										refName={this.vcodeRef}
										name={EMFXAccountFields.Vcode}
										type='text'
										label='短信验证码'
										accLabel='vcodeInput'
										placeholder='请输入您收到的短信验证码'
										isRow={true}
										component={BaseInput1}
										normalize={normalizeText}
										right={true}
										textContentType='oneTimeCode'
										rightComponent={this._renderVCodeRightCom(vcodeLoading, left, vcodeDisabled)}
										maxLength={4}
									/>
								</View>
							)}
						</View>
					)}
				</View>
				<View style={styles.btn}>
					<SubmitButton text='下一步' loading={!!verifyLoading} disabled={invalid} handlePress={this.handleNext} />
				</View>
				<Modal
					isVisible={showModal}
					onBackdropPress={this._showHideModal}
					backdropOpacity={0.5}
					style={styles.modalWrap}>
					<View style={styles.modalRoot}>
						<Text style={styles.modalText}>{BIND_MOBILE_TIP}</Text>
						<View style={styles.modalFooter}>
							<TouchableOpacity onPress={this._showHideModal}>
								<Text style={styles.modalBtn}>我知道了</Text>
							</TouchableOpacity>
						</View>
					</View>
				</Modal>
			</View>
		)
	}
}
