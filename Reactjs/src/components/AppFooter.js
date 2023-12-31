import React from 'react'
import { CFooter } from '@coreui/react'

const AppFooter = () => {
  return (
    <CFooter>
      <div>
        <a
          href="https://www.facebook.com/profile.php?id=100021847659295"
          target="_blank"
          rel="noopener noreferrer"
        >
          Trịnh Đức Hoàng
        </a>
        <span className="ms-1">&copy; 2023 PTIT.</span>
      </div>
      <div className="ms-auto">
        <span className="me-1">Powered by</span>
        <a href="https://coreui.io/react" target="_blank" rel="noopener noreferrer">
          {/* CoreUI React Admin &amp; Dashboard Template */}
          Iot Platform Dashboard Reactjs
        </a>
      </div>
    </CFooter>
  )
}

export default React.memo(AppFooter)
