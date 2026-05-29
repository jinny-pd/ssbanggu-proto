import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// 새 탭/URL 붙여넣기로 앱이 처음 로드될 때 온보딩 상태 초기화
if (!sessionStorage.getItem('ssAppSession')) {
  sessionStorage.setItem('ssAppSession', '1')
  localStorage.removeItem('ssOnboardingStep')
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
