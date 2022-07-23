/** @format */

import EStyleSheet from 'react-native-extended-stylesheet'

export default EStyleSheet.create({
	wrap: {
		display: 'flex',
		flexDirection: 'column',
	},
	content: {
		minHeight: 300,
	},
	btmLabel: {
		marginBottom: 6,
	},
	field: {
		marginBottom: 16,
	},
	input: {
		marginBottom: 16,
	},
	value: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: -10,
	},
	cell: {
		width: '49%',
	},
	btn: {
		marginTop: 20,
		marginBottom: 40,
	},
	tip: {
		color: '#a1a1a1',
		fontSize: '$13',
		textAlign: 'left',
	},
	highTip: {
		color: '#2e2e2e',
		fontWeight: 'bold',
	},
	placeholder: {
		fontSize: '$14',
		color: '#999',
	},
	adrWrap: {
		display: 'flex',
		flexDirection: 'row',
	},
	tipWrapper: {
		flexDirection: 'row',
	},
	tipLabel: {
		color: '#333333',
		fontSize: 13,
		fontWeight: 'normal',
	},
	tipGap: {
		width: 8,
		height: 2,
	},
	modalWrap: {
		justifyContent: 'center',
		alignItems: 'center',
	},
	modalRoot: {
		height: 170,
		width: '85%',
		backgroundColor: '#fff',
		borderRadius: 5,
	},
	modalText: {
		fontSize: 16,
		padding: 20,
		lineHeight: 24,
		height: '67%',
	},
	modalFooter: {
		height: '33%',
		justifyContent: 'center',
		alignItems: 'center',
		borderTopColor: '#e6e6e6',
		borderTopWidth: 1,
	},
	modalBtn: {
		color: '#ff934a',
		fontSize: 20,
	},
})
