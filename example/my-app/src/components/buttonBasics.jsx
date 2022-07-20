import React, { Component } from 'react';

export default class ButtonBasics extends Component {
  constructor(props) {
    super(props);
    this.state={
      test1: "代维维",
      test2: "代" + "薇" + '问问' + `的`
    }
    this._onPressButton = this._onPressButton.bind(this);
  }
  _onPressButton() {
    alert('你点击了按钮!');
    console.log(this.state.test1);
  }

  render() {
    return (
      <div >
        <div >
          <button
            onClick={this._onPressButton}
            title={"点我"}>点我啊</button>
        </div>
        <div >
          <button
            onClick={this._onPressButton}
            title={`点我 ${this.state.test2}`}
            >点我</button>
          
        </div>
        <div>
          <button
            onClick={this._onPressButton}
            title={"测试"}>测试</button>
          
          <button
            onClick={this._onPressButton}
            title={`确认`}
          >确认</button>
        </div>
      </div>
    );
  }
}

