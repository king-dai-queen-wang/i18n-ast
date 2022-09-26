import React, { Component } from 'react';
import { Alert, Button, StyleSheet, View } from 'react-native';

export default class ButtonBasics extends Component {
  constructor(props) {
    this.state={
      test1: "基础版永久免费；会员版998元/年，\n价格<相似产品5%！",
      test2: "代" + "薇" + '问问' + `的`,
      test3: '全球收款\n极速结汇\n安全风控'
    }
  }
  _onPressButton() {
    Alert.alert('你点击了按钮!');
    console.log(this.state.test1);
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.buttonContainer}>
          <Button
            onPress={this._onPressButton}
            title={"点我"}
          />
        </View>
        <View style={styles.buttonContainer}>
          <Button
            onPress={this._onPressButton}
            title={`点我 ${this.state.test2}`}
            color="#841584"
          />
        </View>
        <View style={styles.alternativeLayoutButtonContainer}>
          <Button
            onPress={this._onPressButton}
            title={"测试"}
          />
          <Button
            onPress={this._onPressButton}
            title={`确认`}
            color="#841584"
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center'
  },
  buttonContainer: {
    margin: 20
  },
  alternativeLayoutButtonContainer: {
    margin: 20,
    flexDirection: 'row',
    justifyContent: 'space-between'
  }
});
