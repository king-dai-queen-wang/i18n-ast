import intl from 'react-intl-universal';
import React, { Component } from 'react';
import enUS from '../locales/en_US.js';
import zhCN from '../locales/zh_CN.js';

const SUPPOER_LOCALES = [
  {
    name: 'English',
    value: 'en-US'
  },
  {
    name: '简体中文',
    value: 'zh-CN'
  }
];
const locales = {
  'en-US': enUS,
  'zh-CN': zhCN
};
export const withMultiLanguageHOC = (WarppedComponent) => {
    return class MultiLanguage extends Component {
        constructor(props) {
          super(props);
          this.state = {
            initDone: false
          };
          this.onSelectLocale = this.onSelectLocale.bind(this);
          this.state = { lang: localStorage.getItem('lang_type') || 'en-US' };
        }
      
        renderLocaleSelector() {
          return (
            <div
              style={{ position: 'absolute', zIndex: '9999', right: 160, top: 18 }}
            >
              <select onChange={this.onSelectLocale} defaultValue={this.state.lang}>
                {SUPPOER_LOCALES.map(locale => (
                  <option key={locale.value} value={locale.value}>
                    {locale.name}
                  </option>
                ))}
              </select>
            </div>
          );
        }
      
        onSelectLocale = ev => {
          localStorage.setItem('lang_type', ev.target.value);
          window.location.reload();
        };
      
        render() {
          return (
            <div>
              {this.renderLocaleSelector()}
              <WarppedComponent />
            </div>
          );
        }
      
        componentDidMount() {
          this.loadLocales();
        }
      
        loadLocales() {
          intl
            .init({
              // init method will load CLDR locale data according to currentLocale
              // react-intl-universal is singleton, so you should init it only once in your app
              currentLocale: this.state.lang, // TODO: determine locale here
              locales
            })
            .then(() => {
              // After loading CLDR locale data, start to render
              this.setState({ initDone: true });
            });
        }
      }
}


