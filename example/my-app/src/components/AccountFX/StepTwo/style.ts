/** @format */

import EStyleSheet from 'react-native-extended-stylesheet'

export default EStyleSheet.create({
	wrap: {
		display: 'flex',
		flexDirection: 'column',
	},
	statement: {
		fontSize: '$14',
		padding: 12,
		backgroundColor: 'rgba(255, 250, 225, 0.8)',
		marginBottom: 20,
	},
	title: {
		fontWeight: 'bold',
		marginVertical: 10,
		textAlign: 'center',
	},
	section: {
		marginVertical: 10,
		color: '#666',
	},
	label: {
		color: '#999',
	},
	value: {
		color: '#333',
		textDecorationLine: 'underline',
	},
	field: {
		marginBottom: 30,
	},
	btn: {
		marginBottom: 20,
	},
})
