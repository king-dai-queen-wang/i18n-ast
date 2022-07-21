import logo from './logo.svg';
import './App.css';
import ButtonBasics from './components/buttonBasics';
import {withMultiLanguageHOC} from './components/MultiLanguage';
function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          你好 <code>src/App.js</code> 保存刷新
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          学习 react 好啊
        </a>
        <ButtonBasics></ButtonBasics>
      </header>
    </div>
  );
}

export default withMultiLanguageHOC(App);
