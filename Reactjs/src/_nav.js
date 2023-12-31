/* eslint-disable */
import React, { useState, useContext } from 'react'
import CIcon from '@coreui/icons-react'
import { cilPowerStandby } from '@coreui/icons'
import {
  cilBell,
  cilCalculator,
  cilChartPie,
  cilCursor,
  cilDescription,
  cilDrop,
  cilNotes,
  cilPencil,
  cilPuzzle,
  cilSpeedometer,
  cilStar,
  cilWifiSignal2,
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'
import '../src/_nav.scss'
export const SystemStatusContext = React.createContext() // Xuất SystemStatusContext

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
    badge: {
      color: 'info',
      text: 'HOME',
    },
  },
  {
    component: CNavTitle,
    name: 'Config',
  },
  {
    component: CNavGroup,
    name: 'Alter the boundary',
    to: '/base',
    icon: <CIcon icon={cilPuzzle} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Nhiệt độ',
        to: '/base/temperature_limit',
      },
      {
        component: CNavItem,
        name: 'Độ ẩm',
        to: '/base/humidity_limit',
      },
      {
        component: CNavItem,
        name: 'Ánh sáng',
        to: '/base/light_limit',
      },
      {
        component: CNavItem,
        name: 'Độ bụi',
        to: '/base/dust_limit',
      },
    ],
  },
  {
    component: CNavTitle,
    name: 'System Control',
  },
  {
    component: CNavItem,
    name: 'Sensor Data Table',
    to: '/sensor_table',
    icon: <CIcon icon={cilCalculator} customClassName="nav-icon" />,
    className: 'centered-nav-item', // Thêm lớp CSS để căn giữa
  },
  {
    component: CNavItem,
    name: 'Action History Table',
    to: '/action_history',
    icon: <CIcon icon={cilPowerStandby} customClassName="nav-icon" />,
    className: 'centered-nav-item', // Thêm lớp CSS để căn giữa
  },
  {
    component: CNavTitle,
    name: 'MQTT',
  },
  {
    component: CNavItem,
    name: 'Connect',
    to: '/base/connect_mqtt',
    icon: <CIcon icon={cilWifiSignal2} customClassName="nav-icon" />,
    className: 'centered-nav-item', // Thêm lớp CSS để căn giữa
  },
  {
    component: CNavTitle,
    name: 'Extras',
  },
  {
    component: CNavGroup,
    name: 'Pages',
    icon: <CIcon icon={cilStar} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Login',
        to: '/login',
      },
      {
        component: CNavItem,
        name: 'Register',
        to: '/register',
      },
      {
        component: CNavItem,
        name: 'My Doc',
        href: 'https://docs.google.com/document/d/1OV-G7z82UAtjskJUIryoJtnLwOgClI5h8IUOWH4JhoE/edit',
      },
    ],
  },
  {
    component: CNavItem,
    name: 'Docs',
    href: 'https://iot399.mooo.com/#/profile',
    icon: <CIcon icon={cilDescription} customClassName="nav-icon" />,
  },
]

function ToggleNavItem() {
  const [systemStatus, setSystemStatus] = useState('OFF')

  const toggleSystemStatus = () => {
    setSystemStatus(systemStatus === 'OFF' ? 'ON' : 'OFF')
  }

  return (
    <SystemStatusContext.Provider value={systemStatus}>
      <CNavItem onClick={toggleSystemStatus}>
        {systemStatus}
        <CIcon icon={cilPowerStandby} customClassName="nav-icon" />
      </CNavItem>
    </SystemStatusContext.Provider>
  )
}
export default _nav