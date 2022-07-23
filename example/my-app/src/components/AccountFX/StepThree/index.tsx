/** @format */

import React, { Component } from 'react'
import { Text } from 'react-native'
import { EMSubmitResultType } from 'types/submit.d'
import SubmitResult from 'components/SubmitResult'

import styles from './style'
import { ROUTES } from 'constants/router'
import { EMAdUsages } from 'types/content.d'

export default class StepThree extends Component<any, any> {
	render() {
		const { navigation } = this.props
		return (
			<SubmitResult
				type={EMSubmitResultType.Success}
				title='添加结汇提现账户申请成功'
				tip={
					<Text>
						我们会在<Text style={styles.highLight}>1-2个工作日内</Text>进行审核，
						<Text style={styles.highLight}>最快2分钟</Text>，请留意短信或邮件通知
					</Text>
				}
				links={[{ text: '查看账户', handlePress: () => navigation.navigate(ROUTES.PayeeAccountList) }]}
				adUsage={EMAdUsages.APP_FX_WITHDRAWL_ACCOUNT}
			/>
		)
	}
}
