/** @format */

/* eslint-disable react/no-multi-comp */
/* eslint-disable no-confusing-arrow */
import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { Checkbox, message, Drawer, Icon, Popover } from 'antd'
import { Modal } from 'components/uw3.0/Modal'
import OrderAddMaterial from 'components/OrderAddMaterial'
import numeral from 'numeral'
import { createdTimeOutRange, currencyFormat, formatTimeStamp } from 'utils'
import { CustomButton } from 'components/Button'
import WithdrawOrderSearchForm from 'components/Form/WithdrawOrderSearchForm'
import DimensionTable from 'components/uw3.0/DimensionTable'
import * as xptransferActions from 'actions/xpTransfer'
import { DeclareOrderUsage } from 'types/withdraw.d'
import * as modalActions from 'actions/modal'
import * as metaActions from 'actions/meta'
import * as searchActions from 'actions/search'
import * as errorActions from 'actions/error'
import { ORDER_SHIPPED, ORDER_NOT_SHIPPED, ORDER_MODAL_TYPE } from 'constants/index'
import { FUND_ORDER_UPDATE_PREFIX, FUND_ORDER_DETAIL_PREFIX } from 'constants/router'
import { ESearchOptionUsages } from 'types/search.d'
import Classnames from 'classnames'
import Limit from 'middlewares/Limit'

import style from './style.css'
import QuestionIcon from 'resources/icons/question'
import { EMModalUsages } from 'types/modal.d'
import { EMMetaUsages, EMShippedStatus } from 'types/meta.d'
import { EMLimitUsages } from 'types/limit.d'
import { Action, ActionFunction1 } from 'redux-actions'
import { oc } from 'ts-optchain'
import { curShipStatusIsSupport } from 'helpers/order'
import { validateWebsite } from 'utils/validate'
import { EMEntityStatusUsages, EMWithdrawalTabKeys } from 'types/status.d'
import { toggleDeclareOrderTimeOutRangeTip } from 'actions/tip'
import { SIGN_DATE_ALLOW_DAYS } from 'components/Form/CreateOrderForm'
import { withRouter } from 'react-router'
import { FastOrderTag } from 'components/FastOrderTag'
export const CREATED_TIME_ALLOW_DAYS = 365
const mapUsage = {
	[DeclareOrderUsage.Normal]: '提现',
	[DeclareOrderUsage.Transfer]: '转账',
	[DeclareOrderUsage.XTTransfer]: '转账',
	[DeclareOrderUsage.FXWithdraw]: '结汇提现',
}

const mapQueryType = {
	[DeclareOrderUsage.Normal]: 'InnerTransferClaim',
	[DeclareOrderUsage.Transfer]: 'InnerTransferClaim',
	[DeclareOrderUsage.XTTransfer]: 'InnerTransferClaim',
	[DeclareOrderUsage.FXWithdraw]: 'WithdrawDeclaim',
}

const fields = [
	{ title: '选择', fieldName: 'checkbox', percent: '10%', align: 'center', maxWidth: '55px' },
	{ title: '订单信息', fieldName: 'orderDetail', percent: '30%', align: 'center', dataAlign: 'left' },
	{ title: '上传时间', fieldName: 'createTime', percent: '15%', align: 'center' },
	{ title: '订单总额', fieldName: 'totalAmount', percent: '15%', align: 'center' },
	{ title: `订单申报金额`, fieldName: 'declareAmount', percent: '35%', align: 'center', dataAlign: 'left' },
]

const DeclareOrderHeader = ({ actualAmount, currency, isEnableSearch, showSearch, isExtend }) => {
	return (
		<div className={style.summarize}>
			<div className={style.row}>
				<div className={style.label}>订单申报金额（=实际提现金额）</div>
				<div className={style.value}>{`${actualAmount} ${currency}`}</div>
			</div>
			<div className={style.header}>
				<div className={style.title}>请选择申报订单</div>
				{isEnableSearch && (
					<div className={style.searchChooser} onClick={showSearch}>
						<div>查询订单</div>
						<div
							className={Classnames({
								[style.triangle]: true,
								[style.triangleExtend]: isExtend,
							})}
						/>
					</div>
				)}
			</div>
		</div>
	)
}

const DeclareOrderFooter = ({
	isShowSelectedOrder,
	toggleDrawerStatus,
	actualAmount,
	checkedList,
	usage,
	currency,
	type,
	handleNext,
	boostChecked,
	ignoreAction,
	handleLast,
	sideBarCollapsed,
	footerStyle = {},
}) => {
	const checkedListKeys = Object.keys(checkedList)
	const selectedOrder = checkedListKeys && checkedListKeys.filter(x => checkedList[x])
	const declareTotalAmount =
		selectedOrder &&
		selectedOrder.reduce((p, x) => {
			const value = checkedList[x].value || ''
			return numeral(p).add(value).value()
		}, 0)
	const declareTotalAmountOver = Number(actualAmount) < declareTotalAmount
	const leftDeclareAmount =
		Number(actualAmount) >= declareTotalAmount ? numeral(actualAmount).difference(declareTotalAmount) : 0
	const amountOver = selectedOrder && selectedOrder.find(x => checkedList[x] && checkedList[x].error)
	const amountUnEqual = declareTotalAmount !== Number(actualAmount)
	const hasSelectedOrder = selectedOrder && selectedOrder.length

	return (
		<div
			className={Classnames({ [style.footer]: true, [style.footerHideBar]: sideBarCollapsed })}
			style={{ ...footerStyle }}>
			<section className={style.footerContent}>
				<section className={style.footerLeft}>
					<div className={Classnames({ [style.checked]: hasSelectedOrder, [style.normal]: !hasSelectedOrder })}></div>
					<div className={style.tip}>
						已选择 <span className={style.highlight}>{(selectedOrder && selectedOrder.length) || 0}</span> 笔申报订单
					</div>
					{!!selectedOrder.length && (
						<div className={style.detail} onClick={toggleDrawerStatus}>
							<span>查看详情</span>
							<Icon type={isShowSelectedOrder ? 'up' : 'down'} />
						</div>
					)}
				</section>
				<section className={style.footerRight}>
					{(type === DeclareOrderUsage.Normal || type === DeclareOrderUsage.Transfer) && ignoreAction && (
						<a className={style.ignoreAction} onClick={ignoreAction}>
							跳过并进入下一步
						</a>
					)}
					<div className={style.tip}>
						{declareTotalAmountOver ? (
							<span className={style.errorInput}>订单申报总额超过{usage}金额</span>
						) : (
							<div className={style.info}>
								<Popover
									placement='topLeft'
									content={
										<div className={style.popover}>
											<div className={style.content}>剩余申报金额 = 结汇申报金额（实际提现金额）- 已选订单申报金额</div>
										</div>
									}>
									<span className={style.qusetionIcon}>
										<QuestionIcon />
									</span>
								</Popover>
								<span>
									剩余申报金额：
									<span className={style.highlight}>
										{currencyFormat(leftDeclareAmount)} {currency}
									</span>
								</span>
							</div>
						)}
					</div>
					<div className={style.buttonBar}>
						<div className={style.btn}>
							<CustomButton type='button' symbol='negative' id='declare-order-last' onClick={handleLast}>
								上一步
							</CustomButton>
						</div>
						<div className={style.btn}>
							<CustomButton
								type='button'
								symbol='positive'
								id='declare-order-next'
								onClick={() => handleNext({ amountOver, amountUnEqual })}>
								确认申报
							</CustomButton>
						</div>
					</div>
				</section>
			</section>
		</div>
	)
}

const LinkToOrderUpdate = ({ contractId, children, linkStyle, clickHandler, type }) => {
	// 加入type
	return (
		<Link
			onClick={clickHandler}
			style={{ ...(linkStyle || {}) }}
			to={{
				pathname: `${FUND_ORDER_UPDATE_PREFIX}/${contractId}`,
				state: {
					modal: true,
					belong: 'update-order',
					id: contractId,
					orderModalType: ORDER_MODAL_TYPE.WITHDRAW_RELATED_ORDER,
					type: type,
				},
			}}>
			{children}
		</Link>
	)
}
interface TProps {
	actions?: {
		fetchMetaRequested: ActionFunction1<TFetchMetaRequested<any>, Action<TFetchMetaRequested<any>>>
		[propName: string]: any
	}
	[propName: string]: any
}

@Limit({ type: EMLimitUsages.WhiteList, params: { whiteListType: 'TRADE_CONTRACT_ES' } })
@connect(
	state => ({
		relatedOrders: state.withdraw.get('relatedOrders'),
		applyCheckedList: state.xpTransfer.get('applycheckedList'),
		searchWithdrawOrderModal: state.modal.get(EMModalUsages.SearchWithdrawOrderModal),
		withdrawOrderLogisticsModal: state.modal.get(EMModalUsages.WithdrawOrderLogisticsModal),
		supportShipStatusMeta: state.meta.get(EMMetaUsages.SupportShipStatus).toJS(),
		sideBarCollapsed: state?.status?.get(EMEntityStatusUsages.SlideBarCollapsed),
		location: state.location,
	}),
	dispatch => ({
		actions: bindActionCreators(
			{
				...xptransferActions,
				...modalActions,
				...metaActions,
				...searchActions,
				...errorActions,
				toggleDeclareOrderTimeOutRangeTip,
			},
			dispatch,
		),
	}),
)
@withRouter
export default class DeclareOrder extends Component<TProps, any> {
	constructor(props, context) {
		super(props, context)
		this.usage = mapUsage[props.usage]
		this.handleNext = this.handleNext.bind(this)
		this.handleLast = this.handleLast.bind(this)
	}

	state = {
		isShowSelectedOrder: false,
		searchOrderModalStatus: false,
		selectedOrderConf: {
			isSelected: false,
			order: null,
		},
		showSearchFrom: false,
	}

	componentDidMount() {
		this._fetchSupportShipedConfig()
	}

	get supportShipedConfig() {
		const { supportShipStatusMeta } = this.props
		return oc(supportShipStatusMeta).data({})
	}

	_fetchSupportShipedConfig = () => {
		const { supportShipStatusMeta } = this.props
		if (oc(supportShipStatusMeta).loaded()) return
		this.props.actions!.fetchMetaRequested({
			usage: EMMetaUsages.SupportShipStatus,
		})
	}

	componentWillUnmount() {
		this.props.actions.resetSearchParams({
			usage: ESearchOptionUsages.WithdrawOrder,
		})
		this.props.actions.toggleModalStatus({
			usage: EMModalUsages.OrderAddMaterialModal,
			status: false,
		})
	}

	_handleOrderSelectAction = (order, isSelected, checkLogistics) => {
		const { applyCheckedList } = this.props
		const checkedList = applyCheckedList && applyCheckedList.toJS()
		if (checkLogistics && !isSelected) {
			this.props.actions.toggleModalStatus({
				usage: EMModalUsages.WithdrawOrderLogisticsModal,
				status: true,
			})
			this.setState({
				selectedOrderConf: {
					isSelected,
					order,
				},
			})
		} else {
			if (!isSelected && Object.values(checkedList).filter(item => item).length >= 15) {
				return message.error('最多关联15个订单')
			}
			this.props.actions.updateApplyCheckList({
				key: order.contractId,
				value: isSelected ? null : { value: '', error: '', order },
			})
		}
	}

	handleChangeInput(order, e) {
		if (!/^\d*(\.\d{0,2})?$/.test(e.target.value)) {
			return
		}
		const { contractId, withdrawAvailableAmount } = order
		const data = {
			value: e.target.value,
			error:
				Number(e.target.value) > Number(withdrawAvailableAmount)
					? `订单申报金额已超过该订单剩余可使用金额`
					: '' || !e.target.value
					? '请填写申报金额'
					: '',
			order,
		}
		this.props.actions.updateApplyCheckList({ key: contractId, value: data })
	}

	handleBlurInput = (order, e) => {
		if (!/^\d*(\.\d{0,2})?$/.test(e.target.value)) {
			return
		}
		const { contractId } = order
		console.log(e.target.value)
		if (!e.target.value) {
			const data = {
				value: e.target.value,
				error: '请填写申报金额',
				order,
			}
			this.props.actions.updateApplyCheckList({ key: contractId, value: data })
		}
	}

	handleNext(disabled) {
		const { applyCheckedList } = this.props
		const { amountOver, amountUnEqual } = disabled
		if (amountOver) {
			return message.error(`订单申报金额已超过订单剩余可使用金额`)
		}
		if (amountUnEqual) {
			return message.error(`订单申报总额须与${this.usage}金额一致`)
		}

		const checkedList = applyCheckedList && applyCheckedList.toJS()
		const listKeys = Object.keys(checkedList)
		const claimOrders = listKeys
			.filter(x => checkedList[x] && checkedList[x].value && checkedList[x].value.trim())
			.filter(x => !!Number(checkedList[x].value))
			.map(x => {
				const data = checkedList[x]
				if (!data.order.signedTime && this.props.usage === DeclareOrderUsage.FXWithdraw) {
					this.props.actions.specificSpotError({ error: `fx order has no signedTime` })
				}
				return {
					claimAmount: data.value,
					claimCurrency: data.order.withdrawCurrency,
					contractId: x,
					status: data.order.status,
				}
			})
		this.props.next(claimOrders)
	}

	handleLast() {
		this.props.last()
	}

	_toggleSearchOrderModal = isShow => {
		this.props.actions.toggleModalStatus({
			usage: EMModalUsages.SearchWithdrawOrderModal,
			status: isShow,
		})
	}

	_toggleOrderAddMaterial = (orderAddMaterialModal, tradeContractId) => {
		const { actions } = this.props
		actions.toggleModalStatus({
			usage: EMModalUsages.OrderAddMaterialModal,
			status: orderAddMaterialModal,
		})
		actions.fetchMetaRequested({
			usage: EMMetaUsages.OrderSupplementaryMaterials,
			params: {
				tradeContractId,
			},
		})
	}

	_toggleWithdrawOrderModalHandler = (status, order, isSelected) => {
		this.props.actions.toggleModalStatus({
			status,
			usage: EMModalUsages.WithdrawOrderLogisticsModal,
		})
		if (order && typeof isSelected === 'boolean') {
			this._handleOrderSelectAction(order, isSelected)
		}
	}

	_judgeFXWithdrawOrderIsAvailable = (item = {}) => {
		const { usage } = this.props
		const {
			productName,
			productWebSite,
			shipStatus,
			attachments,
			dealStatus,
			exportProductEnName,
			productQuantity,
			complaints,
			contractPurpose,
		} = item as any
		let LogisticsBillBool = false
		let checkboxDisabled = false
		let checkLogistics = false
		let reportValue = null
		const LogisticsBill =
			shipStatus === ORDER_SHIPPED &&
			attachments &&
			attachments.LogisticsBill &&
			Array.isArray(attachments.LogisticsBill) &&
			attachments.LogisticsBill.length > 0
				? attachments.LogisticsBill
				: null
		if (LogisticsBill) {
			LogisticsBillBool = true
			for (let i = 0; i < LogisticsBill.length; i++) {
				const attachmentInfo =
					LogisticsBill[i] && LogisticsBill[i].attachmentInfo && JSON.parse(LogisticsBill[i].attachmentInfo)
				const attachmentName = LogisticsBill[i] && LogisticsBill[i].attachmentName
				const LogisticsBillNo = attachmentInfo && attachmentInfo.LogisticsBillNo
				const LogisticCompanyName = attachmentInfo && attachmentInfo.LogisticCompanyName
				if (!attachmentName || !LogisticsBillNo || !LogisticCompanyName) {
					LogisticsBillBool = false
					break
				}
			}
		}
		const LogisticsBillNotShipped = shipStatus === ORDER_NOT_SHIPPED && dealStatus
		const crossborderTip =
			complaints &&
			complaints.find(x => x.type === 'Crossborder' && ~['AddMaterial', 'MaterialAdded'].indexOf(x.operation))
		const delayTip = complaints && complaints.find(x => x.operation === 'ContractLate')

		if (
			!(
				productName &&
				productWebSite &&
				(LogisticsBillBool || LogisticsBillNotShipped) &&
				productQuantity &&
				exportProductEnName
			) ||
			(usage === DeclareOrderUsage.FXWithdraw && !contractPurpose) ||
			(productWebSite && !validateWebsite(productWebSite))
		) {
			checkboxDisabled = true

			const need =
				(usage === DeclareOrderUsage.FXWithdraw && !contractPurpose) ||
				!productWebSite ||
				!productName ||
				!exportProductEnName ||
				!productQuantity ||
				(!LogisticsBillBool && !LogisticsBillNotShipped)
			let str = need ? '此订单须完善' : ''
			if (usage === DeclareOrderUsage.FXWithdraw && !contractPurpose) str += '是否用于结汇提现、'
			if (!productWebSite) str += '商品/店铺网址、'
			if (!productName) str += '商品中文名称、'
			if (!exportProductEnName) str += '商品英文名称、'
			if (!productQuantity) str += '商品数量、'
			if (!LogisticsBillBool && !LogisticsBillNotShipped) str += '物流信息、'
			if (productWebSite && !validateWebsite(productWebSite)) {
				if (!need) {
					checkboxDisabled = false
				}
				str += '请输入正确的商品/店铺网址、'
			}

			reportValue = (
				<div className={style.completeWrap}>
					{str.replace(/、$/, '。')}
					<LinkToOrderUpdate contractId={item.contractId} type={usage}>
						立即更新
					</LinkToOrderUpdate>
				</div>
			)
		} else if (crossborderTip) {
			checkboxDisabled = true
			reportValue = (
				<>
					<div className={style.reportError} onClick={() => this._toggleOrderAddMaterial(true, item.contractId)}>
						该订单用于结汇提现需要补充资料
					</div>
				</>
			)
		} else if (this.props.boostChecked && item && shipStatus === EMShippedStatus.NotShipped) {
			// 目前，极速结汇提现仅支持已发货的订单，导致未发货的情况下无法使用极速到账功能。
			// 易宝已支持未发货的订单进行极速结汇提现
			let showAddTip = true
			if (usage === DeclareOrderUsage.FXWithdraw) {
				showAddTip = !curShipStatusIsSupport(shipStatus, this.supportShipedConfig)
			}
			if (showAddTip) {
				checkboxDisabled = true
				reportValue = (
					<LinkToOrderUpdate contractId={item.contractId}>
						<div className={style.reportError}>该订单用于极速到账服务，需补充物流发货信息</div>
					</LinkToOrderUpdate>
				)
			}
		} else {
			checkLogistics = delayTip && !this.props.boostChecked
			reportValue = (
				<div className={style.reportArea}>
					{delayTip && (
						<LinkToOrderUpdate contractId={item.contractId}>
							<div className={style.reportError}>超过预计发货日期，请及时更新物流信息</div>
						</LinkToOrderUpdate>
					)}
				</div>
			)
		}

		return {
			reportValue,
			checkboxDisabled,
			checkLogistics,
		}
	}

	_processTableData = (orderList = [], checkedList = [], isNeedTips = true) => {
		const { usage } = this.props
		// 是否是结汇提现
		const isFxWithdrawType = usage === DeclareOrderUsage.FXWithdraw

		return (
			orderList &&
			orderList.map(x => {
				const checkedData = checkedList[x.contractId]
				const value = (checkedData && checkedData.value) || ''
				const residualAmount =
					Number(x.withdrawAvailableAmount) > Number(value) ? numeral(x.withdrawAvailableAmount).difference(value) : 0
				const {
					reportValue = null,
					checkboxDisabled,
					checkLogistics,
				} = this.props.usage === DeclareOrderUsage.FXWithdraw ? this._judgeFXWithdrawOrderIsAvailable(x) : {}
				// 订单签约日期超过330天不可选择, 仅用于结汇提现
				const isSignDateOutRange = isFxWithdrawType ? createdTimeOutRange(x.signedTime, SIGN_DATE_ALLOW_DAYS) : false
				console.log(isSignDateOutRange, 'isSignDateOutRange')
				const hasNoSignDate = !x.signedTime
				return {
					key: x.contractId,
					rowClick: () => {
						if (checkboxDisabled || isSignDateOutRange) return
						!checkboxDisabled && this._handleOrderSelectAction(x, !!checkedData, checkLogistics)
						this.showTimeOutRangeTip(!!!checkedData, x)
					},
					checkbox: (
						<Checkbox
							checked={!!checkedData}
							onChange={e => {
								this._handleOrderSelectAction(x, !e.target.checked, checkLogistics)
								this.showTimeOutRangeTip(e.target.checked, x)
							}}
							disabled={checkboxDisabled || isSignDateOutRange}
							onClick={e => e.stopPropagation()}
						/>
					),
					orderDetail: [
						<Link
							key={x.contractId}
							to={`${FUND_ORDER_DETAIL_PREFIX}/${x.contractId}`}
							target='_blank'
							className={style.link}>
							<div className={style.label}>{`订单编号：${x.invoiceNo}`}</div>
							{x.existedquickAuditTag && <FastOrderTag />}
						</Link>,
						`买家名称：${x.importCompanyName || ''}`,
						`商品名称：${x.productName || ''}`,
					],
					createTime: formatTimeStamp(x.createdTime),
					totalAmount: `${currencyFormat(x.amount)} ${x.currency}`,
					declareAmount: (
						<div>
							{checkedData && (
								<div className={style.inputWrap} onClick={e => e.stopPropagation()}>
									<div className={style.rightText}>{` ≤ ${currencyFormat(x.withdrawAvailableAmount)} ${
										x.withdrawCurrency
									}`}</div>
									<input
										autoFocus='autofocus'
										autoComplete='off'
										className={checkedData.error ? style.checkedError : ''}
										type='text'
										name={x.contractId}
										onChange={e => this.handleChangeInput(x, e)}
										onBlur={e => this.handleBlurInput(x, e)}
										value={value}
										id={`${x.contractId}-input`}
									/>
									{checkedData.error && <span className={style.errorInput}>{checkedData.error}</span>}
								</div>
							)}
							<div className={style.info}>
								<Popover
									placement='topLeft'
									content={
										<div className={style.popover}>
											<div className={style.content}>可申报金额=已关联总额*实时汇率-已申报总额</div>
										</div>
									}>
									<span className={style.qusetionIcon}>
										<QuestionIcon />
									</span>
								</Popover>
								<div>{`可申报金额：${currencyFormat(residualAmount)} ${x.withdrawCurrency}`}</div>
							</div>
							{(isSignDateOutRange && (
								<div className={style.completeWrap}>
									<div>{hasNoSignDate ? '此订单需补充签约日期' : `此订单的签约日期超过${SIGN_DATE_ALLOW_DAYS}天`}</div>
									<LinkToOrderUpdate contractId={x.contractId} type={this.props.usage}>
										立即更新
									</LinkToOrderUpdate>
								</div>
							)) ||
								(isNeedTips && <div onClick={e => e.stopPropagation()}>{reportValue}</div>)}
						</div>
					),
				}
			})
		)
	}

	showSearch = () => {
		this.setState({
			showSearchFrom: !this.state.showSearchFrom,
		})
	}
	showTimeOutRangeTip = (checked: boolean, item: any) => {
		if (checked) {
			const isOutRange = createdTimeOutRange(item.createdTime, CREATED_TIME_ALLOW_DAYS)
			this.props.actions?.toggleDeclareOrderTimeOutRangeTip({
				isOpen: isOutRange,
				content: `应监管要求，创建时间超过${CREATED_TIME_ALLOW_DAYS}天的订单可能会影响申报结果，建议您使用${CREATED_TIME_ALLOW_DAYS}天内的订单`,
				contractId: item.contractId,
			})
			return
		}
		this.props.actions?.toggleDeclareOrderTimeOutRangeTip({
			isOpen: false,
			content: '',
			contractId: item.contractId,
		})
	}
	render() {
		const {
			information,
			relatedOrders,
			applyCheckedList,
			boostChecked,
			ignoreAction,
			searchWithdrawOrderModal,
			withdrawOrderLogisticsModal,
			sideBarCollapsed,
		} = this.props
		const { order = {}, isSelected } = this.state.selectedOrderConf
		const { currency, actualAmount = 0 } = information

		const checkedList = applyCheckedList && applyCheckedList.toJS()

		const relatedOrdersData = relatedOrders && relatedOrders.toJS()
		const relatedOrdersLoading = relatedOrdersData && relatedOrdersData.loading
		const relatedOrdersError = relatedOrdersData && relatedOrdersData.error
		const relatedOrdersList = relatedOrdersData && relatedOrdersData.data && relatedOrdersData.data.list

		const data = this._processTableData(relatedOrdersList, checkedList)
		const selectedOrderData = this._processTableData(
			Object.values(checkedList || {})
				.map(item => item && item.order)
				.filter(item => item),
			checkedList,
			false,
		)

		const usage = this.usage
		const type = this.props.usage
		const isEnableSearch = this.props.isWhiteList
		return (
			<div className={style.wrap}>
				<DeclareOrderHeader
					actualAmount={actualAmount}
					usage={usage}
					currency={currency}
					isEnableSearch={isEnableSearch}
					openModal={() => this._toggleSearchOrderModal(true)}
					type={type}
					showSearch={this.showSearch}
					isExtend={this.state.showSearchFrom}
				/>
				{this.state.showSearchFrom && (
					<div className={style.searchWrap}>
						<WithdrawOrderSearchForm withdrawCurrency={currency} queryType={mapQueryType[type]} />
					</div>
				)}
				<div className={style.table}>
					<DimensionTable fields={fields} data={data} loading={relatedOrdersLoading} error={relatedOrdersError} />
				</div>
				<DeclareOrderFooter
					actualAmount={actualAmount}
					checkedList={checkedList}
					usage={usage}
					currency={currency}
					isShowSelectedOrder={this.state.isShowSelectedOrder}
					toggleDrawerStatus={() => this.setState({ isShowSelectedOrder: !this.state.isShowSelectedOrder })}
					type={type}
					handleLast={this.handleLast}
					handleNext={this.handleNext}
					ignoreAction={ignoreAction}
					boostChecked={boostChecked}
					sideBarCollapsed={sideBarCollapsed}
					footerStyle={{ zIndex: this.state.isShowSelectedOrder ? 1200 : 900 }}
				/>
				<Drawer
					visible={this.state.isShowSelectedOrder}
					title='已选择申报订单'
					height='557px'
					className={style['custom_drawer_wrap']}
					headerStyle={{
						maxWidth: '927px',
						margin: '0 auto',
						padding: '16px 0',
					}}
					onClose={() => this.setState({ isShowSelectedOrder: false })}
					placement='bottom'>
					<div className={style.selectedOrderTable}>
						<DimensionTable fields={fields} data={selectedOrderData} contentStyle={{ maxHeight: '330px' }} />
					</div>
				</Drawer>
				{searchWithdrawOrderModal && (
					<Modal
						title='订单查询'
						close={() => this._toggleSearchOrderModal(false)}
						contentStyle={{ maxHeight: 'fit-content' }}
						containerStyle={{ width: '516px', minWidth: '516px', maxHeight: 'fit-content' }}>
						<WithdrawOrderSearchForm
							closeModal={() => this._toggleSearchOrderModal(false)}
							withdrawCurrency={currency}
							queryType={mapQueryType[type]}
						/>
					</Modal>
				)}

				<OrderAddMaterial />
				{withdrawOrderLogisticsModal && (
					<Modal
						title='已超过发货时间'
						containerStyle={{ width: '500px', minWidth: '400px', maxHeight: 'fit-content' }}
						contentStyle={{ paddingBottom: 0 }}
						close={() => this._toggleWithdrawOrderModalHandler(false)}>
						<div className={style.logistic}>
							<span className={style.notice}>
								当前时间已超过订单预计发货时间，请及时更新发货信息，以免<span className={style.keyText}>提现失败</span>
								。
							</span>
							<div className={style.content}>
								<p>1. 如订单已发货，请更改发货状态并补充国际物流单据；</p>
								<p>2. 如订单未发货，请更新发货时间并补充延迟发货的沟通记录；</p>
							</div>
							<div className={style.btnGroup}>
								<CustomButton
									type='button'
									symbol='negative'
									onClick={() => this._toggleWithdrawOrderModalHandler(false, order, isSelected)}>
									忽略，继续申报
								</CustomButton>
								<LinkToOrderUpdate
									contractId={(order || {}).contractId}
									clickHandler={() => {
										this.props.actions.toggleModalStatus({
											usage: EMModalUsages.WithdrawOrderLogisticsModal,
											status: false,
										})
									}}
									linkStyle={{
										color: '#fff',
										background: '#ff934a',
										border: '1px solid #ff934a',
										borderRadius: '2px',
										minWidth: '90px',
										padding: '0 18px',
										height: '36px',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										marginLeft: '10px',
									}}>
									立即更新
								</LinkToOrderUpdate>
							</div>
						</div>
					</Modal>
				)}
			</div>
		)
	}
}
