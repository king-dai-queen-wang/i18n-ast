/** @format */

import React, { useState } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Link } from 'react-router-dom'
import XtLogo from 'resources/icons/Logo/XtLogo'
import PlatformExchange from 'resources/icons/PlatformIcon/PlatformExchange'
import styles from './style.css'
import {} from 'types/xpTransfer.d'
import { EMPlatform } from 'types/platform.d'
import * as XTROUTES from 'constants/router'
import { TRADE_PLATFORM_READ } from 'constants/permisson'
import { Icon, message, Popover, Tooltip } from 'antd'
import { push } from 'react-router-redux'
import { oc } from 'ts-optchain'
import * as modalActions from 'actions/modal'
import CustomerManageIcon from 'resources/images/platformLogo/CustomerManage.png'
import FinanceIcon from 'resources/images/platformLogo/FinanceManage.png'
import XTLogoImg from 'resources/images/xtransfer_brand_logo.png'
import { EMAccountType } from 'types/user.d'
import { OAUTH_BOSS } from 'constants/basic'

const NO_FIRM_AUTH_STATUS = 'NULL'
import { TRADE_HOME } from 'constants/trade'
import { useQuery } from 'react-query'
import { fetchUserPlatform } from 'utils/api'

interface TProps {
	platformType?: string
	isMobile?: boolean
	actions?: {}
	pathname?: string
}

const PLATFORM_MAP = {
	[EMPlatform.XTRANSFER]: '外贸收款',
	[EMPlatform.FOREIGNTRADEMANAGEMENT]: '客户管理',
}

type TPlatform = '外贸收款' | '客户管理'

export const MENU_LIST = [
	{
		name: '外贸收款',
		platform: EMPlatform.XTRANSFER,
		path: XTROUTES.DASHBOARD_HOME,
		CustomizeIcon: <img src={FinanceIcon} style={{ width: '44px', height: '44px' }} />,
	},
	{
		name: '客户管理',
		platform: EMPlatform.FOREIGNTRADEMANAGEMENT,
		path: TRADE_HOME,
		permissionCode: TRADE_PLATFORM_READ,
		CustomizeIcon: <img src={CustomerManageIcon} style={{ width: '44px', height: '44px' }} />,
	},
]

const useTradePlatformPermission = (powerList: any[], profile: any, permissionCode: string) => {
	return (powerList || []).includes(permissionCode)
}

const PlatformItem = ({
	path,
	CustomizeIcon,
	permissionCode,
	name,
	actions,
	platform,
	currentPlatform,
	powerList,
	profile,
}: {
	CustomizeIcon: React.ReactElement
	path: string
	permissionCode: string
	name: string
	platform: EMPlatform
	actions?: {
		nav: OverrideFunctionType<any, void>
		toggleModalStatus: OverrideFunctionType<any, void>
	}
	powerList?: any[]
	profile?: any
	currentPlatform: TPlatform
}) => {
	const { data } = useQuery('/user/platforms', fetchUserPlatform)
	const isHasTradePlatformPermission = useTradePlatformPermission(powerList || [], profile || {}, permissionCode)
	const isHasFundPlatformPermission = data?.platforms?.includes?.(EMPlatform.XTRANSFER)
	return (
		<>
		<div className={styles.record}>{'©XTransfer. All rights reserved.\n沪ICP备17023308号'}</div>
		<p>
			该使用条款（和由此引起或与之相关的任何非合同义务）应受英格兰法律的约束并根据其进行解释；英格兰法院应拥有专属管辖权，以解决与该使用条款和/或本协议项下所提供服务（包括与任何非合同义务相关的服务）相关的任何争端或索赔。但是，如果业务介绍人已经将您介绍给我们且您是消费者，则
			(a) 如果您居住在苏格兰，您可在苏格兰法院或英国法院提起与该服务有关的法律诉讼；并且 (b)
			如果您居住在北爱尔兰，您可以在北爱尔兰法院或英国法院就该服务提起法律诉讼。此外，如果您是消费者，可向欧盟委员会在线争议解决平台提交争议，以在线进行解决；网址为
			https://ec.europa.eu/consumers/odr。
		</p>
			<section
				className={styles.platformItem}
				onClick={() => {
					if (platform === EMPlatform.FOREIGNTRADEMANAGEMENT && !isHasTradePlatformPermission) {
						message.error('抱歉，您没权限~')
						return
					}
					if (platform === EMPlatform.XTRANSFER && !isHasFundPlatformPermission) {
						message.error('抱歉，您没权限~')
						return
					}
					actions?.nav?.(path)
				}}>
				{CustomizeIcon}
				<span>{name}</span>
				{currentPlatform === name && (
					<Icon
						type='check'
						style={{
							marginLeft: '80px',
							color: '#ff934a',
						}}
					/>
				)}
			</section>
		</>
	)
}

const EnhancedPlatformItem = connect(
	(state: RootState) => ({
		profile: state.me.get('profile').toJS?.()?.data || {},
		powerList: oc(state.me.get('power').toJS()).data([]),
	}),
	(dispatch: any) => ({
		actions: bindActionCreators(
			{
				nav: push,
				...modalActions,
			},
			dispatch,
		),
	}),
)(PlatformItem)

const PlatformExchangeContent = ({ currentPlatform }: { currentPlatform: TPlatform }) => {
	return (
		<section className={styles.platformContent}>
			<p className={styles.platformChangeText}>平台切换</p>
			{MENU_LIST.map((item: any) => {
				return <EnhancedPlatformItem {...item} key={item.name} currentPlatform={currentPlatform} />
			})}
		</section>
	)
}

const connectStateToProps = (state: RootState) => ({
	platformType: state.platform,
	isMobile: state.util.get('isMobile'),
	pathname: state.router?.location?.pathname,
})

const connectDispatchToProps = (dispatch: any) => ({
	actions: bindActionCreators({}, dispatch),
})

const mapPlatformName = (pathname: string | undefined, platformType: string | undefined) => {
	if (pathname?.startsWith('/account')) {
		return '账号中心'
	}
	return PLATFORM_MAP[platformType as any] || ''
}

export default connect(
	connectStateToProps,
	connectDispatchToProps,
)((props: TProps) => {
	const [visible, setVisible] = useState<boolean>(false)
	const [tooltipVisible, setTooltipVisible] = useState<boolean>(false)

	const pathname = props.pathname
	const platformType = props.platformType
	const isAccountCenter = pathname?.startsWith('/account')
	const platformName = mapPlatformName(pathname, platformType)

	return (
		<section className={styles.wrap}>
			<Link to={XTROUTES.HOME}>
				<Tooltip
					title='XTransfer官网'
					placement='bottomLeft'
					trigger='hover'
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					getPopupContainer={triggerNode => triggerNode.parentNode}>
					<div className={styles.logoWrap}>
						<img src={XTLogoImg} alt='logo' style={{ width: '40px', height: '40px' }} />
					</div>
				</Tooltip>
			</Link>

			{!props.isMobile && <div className={styles.logoDividerLine} />}
			<section>
				{!props.isMobile && platformName === '账号中心' && (
					<span style={{ cursor: 'initial', color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>{platformName}</span>
				)}
				{!props.isMobile && !isAccountCenter && (
					// <Popover content={<PlatformExchangeContent />} placement='bottom'>
					// 	<span className={styles.flexBox}>
					// 		<PlatformExchange />
					// 	</span>
					// </Popover>
					<Popover
						overlayClassName={styles.antdStyle}
						content={<PlatformExchangeContent currentPlatform={platformName} />}
						placement='bottomLeft'
						trigger='click'
						onVisibleChange={(visible: boolean) => {
							if (tooltipVisible) {
								setTooltipVisible(false)
							}
							setVisible(visible)
						}}
						// eslint-disable-next-line @typescript-eslint/ban-ts-comment
						// @ts-ignore
						getPopupContainer={() => document.getElementById('header-wrap')}>
						<Tooltip
							title='平台切换入口'
							placement='bottomLeft'
							trigger='hover'
							visible={tooltipVisible}
							onVisibleChange={(tooltipVisible: boolean) => {
								if (!visible) {
									setTooltipVisible(tooltipVisible)
								}
							}}
							// eslint-disable-next-line @typescript-eslint/ban-ts-comment
							// @ts-ignore
							getPopupContainer={triggerNode => triggerNode.parentNode}>
							<section className={styles.flexBox}>
								<span>{PLATFORM_MAP[props.platformType || '']}</span>
								<span className={styles.platformExchangeIconWrap}>
									<section>
										{visible ? (
											<Icon style={{ color: '#ff934a', fontSize: '14px' }} type='caret-up' />
										) : (
											<Icon type='caret-down' style={{ fontSize: '14px' }} />
										)}
									</section>
								</span>
							</section>
						</Tooltip>
					</Popover>
				)}
			</section>
		</section>
	)
})
