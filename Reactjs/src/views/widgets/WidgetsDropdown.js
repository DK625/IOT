/* eslint-disable */
// note_by_dk625 eslint-disable để không hiện cảnh báo eslint

import React from 'react'
import {
  CRow,
  CCol,
  CDropdown,
  CDropdownMenu,
  CDropdownItem,
  CDropdownToggle,
  CWidgetStatsA,
} from '@coreui/react'
import { getStyle } from '@coreui/utils'
import { CChartBar, CChartLine } from '@coreui/react-chartjs'
import CIcon from '@coreui/icons-react'
import { cilArrowBottom, cilArrowTop, cilOptions } from '@coreui/icons'
import axios from '../../axios'
import { useRef, useEffect, useState } from 'react'
import './WidgetsDropdown.scss'
import classNames from 'classnames';


const getWarningClass = (value, lowerLimit, upperLimit) => {
  const numericValue = parseFloat(value);
  if (isNaN(numericValue)) {
    return 'text-danger'; // Nếu giá trị không phải là số, hiển thị cảnh báo
  } else if (numericValue >= lowerLimit && numericValue <= upperLimit) {
    return ''; // Nếu giá trị nằm trong giới hạn, không hiển thị cảnh báo
  }
  return 'text-warning'; // Nếu giá trị nằm ngoài giới hạn, hiển thị cảnh báo
};

const WidgetsDropdown = ({ temperature, humidity, light, dust }) => {
  const [messageData, setMessageData] = useState({}); // Initialize messageData as a state variable

  useEffect(() => {
    // console.log('widget: ', temperature, humidity, light, dust)
    // Fetch the data from the API when the component mounts
    axios.get('/api/get_limit')
      .then(response => {
        const newMessageData = response.limit;
        setMessageData(newMessageData);

      })
      .catch(error => {
        console.error('Lỗi khi gửi dữ liệu qua API:', error);
      });
  }, []); // Use an empty dependency array to ensure the effect runs only once

  console.log('messageData: ', messageData)
  const limitTemperature = (messageData['Nhiệt độ'] || '0');
  const limitHumidity = (messageData['Độ ẩm'] || '0');
  const limitLight = (messageData['Ánh sáng'] || '0');
  const limitDust = (messageData['Độ bụi'] || '0'); // add A+

  // Sử dụng regex để lấy số từ chuỗi limitTemperature
  const temperatureLimits = limitTemperature.match(/(\d+(\.\d+)?)/g);
  const humidityLimits = limitHumidity.match(/(\d+(\.\d+)?)/g);
  const lightLimits = limitLight.match(/(\d+(\.\d+)?)/g);
  const limitDusts = limitDust.match(/(\d+(\.\d+)?)/g); // add A+

  // Lấy giá trị lower và upper từ mảng được trả về bởi regex
  const lowerTempLimit = temperatureLimits[0];
  const upperTempLimit = temperatureLimits[1];

  const lowerHumidityLimit = humidityLimits[0];
  const upperHumidityLimit = humidityLimits[1];

  const lowerLightLimit = lightLimits[0];
  const upperLightLimit = lightLimits[1];

  const lowerDustLimit = limitDusts[0];
  const upperDustLimit = limitDusts[1]; // add A+

  console.log('Temperature lower and upper limits: ', lowerTempLimit, upperTempLimit);
  console.log('Humidity lower and upper limits: ', lowerHumidityLimit, upperHumidityLimit);
  console.log('Light lower and upper limits: ', lowerLightLimit, upperLightLimit);
  console.log('Dust lower and upper limits: ', lowerDustLimit, upperDustLimit);


  const temperatureClass = getWarningClass(temperature, lowerTempLimit, upperTempLimit);
  const humidityClass = getWarningClass(humidity, lowerHumidityLimit, upperHumidityLimit);
  const lightClass = getWarningClass(light, lowerLightLimit, upperLightLimit);
  const dustClass = getWarningClass(dust, lowerDustLimit, upperDustLimit); // add A+

  return (
    <CRow>
      <CCol sm={6} lg={3}>

        <CWidgetStatsA
          className={classNames('mb-4', humidityClass, { 'warning-border': humidityClass === 'text-warning' })}
          color="info"
          value={temperature !== undefined ? `${humidity.toFixed(2)}%` : 'N/A'}
          title="Độ ẩm"
          action={
            <CDropdown alignment="end">
              <CDropdownToggle color="transparent" caret={false} className="p-0">
                <CIcon icon={cilOptions} className="text-high-emphasis-inverse" />
              </CDropdownToggle>
              <CDropdownMenu>
                <CDropdownItem>Action</CDropdownItem>
                <CDropdownItem>Another action</CDropdownItem>
                <CDropdownItem>Something else here...</CDropdownItem>
                <CDropdownItem disabled>Disabled action</CDropdownItem>
              </CDropdownMenu>
            </CDropdown>
          }
          chart={
            <CChartLine
              className="mt-3 mx-3"
              style={{ height: '70px' }}
              data={{
                labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
                datasets: [
                  {
                    label: 'My First dataset',
                    backgroundColor: 'transparent',
                    borderColor: 'rgba(255,255,255,.55)',
                    pointBackgroundColor: getStyle('--cui-info'),
                    data: [1, 18, 9, 17, 34, 22, 11],
                  },
                ],
              }}
              options={{
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                maintainAspectRatio: false,
                scales: {
                  x: {
                    grid: {
                      display: false,
                      drawBorder: false,
                    },
                    ticks: {
                      display: false,
                    },
                  },
                  y: {
                    min: -9,
                    max: 39,
                    display: false,
                    grid: {
                      display: false,
                    },
                    ticks: {
                      display: false,
                    },
                  },
                },
                elements: {
                  line: {
                    borderWidth: 1,
                  },
                  point: {
                    radius: 4,
                    hitRadius: 10,
                    hoverRadius: 4,
                  },
                },
              }}
            />
          }
        />
      </CCol>
      <CCol sm={6} lg={3} >
        <CWidgetStatsA
          className={classNames('mb-4', lightClass, { 'warning-border': lightClass === 'text-warning' })}
          color="warning"
          value={`${light} Lux`}
          title="Ánh sáng"
          action={
            <CDropdown alignment="end">
              <CDropdownToggle color="transparent" caret={false} className="p-0">
                <CIcon icon={cilOptions} className="text-high-emphasis-inverse" />
              </CDropdownToggle>
              <CDropdownMenu>
                <CDropdownItem>Action</CDropdownItem>
                <CDropdownItem>Another action</CDropdownItem>
                <CDropdownItem>Something else here...</CDropdownItem>
                <CDropdownItem disabled>Disabled action</CDropdownItem>
              </CDropdownMenu>
            </CDropdown>
          }
          chart={
            <CChartLine
              className="mt-3"
              style={{ height: '70px' }}
              data={{
                labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
                datasets: [
                  {
                    label: 'My First dataset',
                    backgroundColor: 'rgba(255,255,255,.2)',
                    borderColor: 'rgba(255,255,255,.55)',
                    data: [78, 81, 80, 45, 34, 12, 40],
                    fill: true,
                  },
                ],
              }}
              options={{
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                maintainAspectRatio: false,
                scales: {
                  x: {
                    display: false,
                  },
                  y: {
                    display: false,
                  },
                },
                elements: {
                  line: {
                    borderWidth: 2,
                    tension: 0.4,
                  },
                  point: {
                    radius: 0,
                    hitRadius: 10,
                    hoverRadius: 4,
                  },
                },
              }}
            />
          }
        />
      </CCol>
      {/* <CCol sm={6} lg={4}> */}
      <CCol sm={6} lg={3} >
        <CWidgetStatsA
          className={classNames('mb-4', temperatureClass, { 'warning-border': temperatureClass === 'text-warning' })}
          color="danger"
          value={temperature !== undefined ? `${temperature.toFixed(2)}°C` : 'N/A'}
          // làm tròn 1 chữ số thập phân sau dấu phẩy
          title="Nhiệt độ"
          action={
            <CDropdown alignment="end">
              <CDropdownToggle color="transparent" caret={false} className="p-0">
                <CIcon icon={cilOptions} className="text-high-emphasis-inverse" />
              </CDropdownToggle>
              <CDropdownMenu>
                <CDropdownItem>Action</CDropdownItem>
                <CDropdownItem>Another action</CDropdownItem>
                <CDropdownItem>Something else here...</CDropdownItem>
                <CDropdownItem disabled>Disabled action</CDropdownItem>
              </CDropdownMenu>
            </CDropdown>
          }
          chart={
            <CChartBar
              className="mt-3 mx-3"
              style={{ height: '70px' }}
              data={{
                labels: [
                  'January',
                  'February',
                  'March',
                  'April',
                  'May',
                  'June',
                  'July',
                  'August',
                  'September',
                  'October',
                  'November',
                  'December',
                  'January',
                  'February',
                  'March',
                  'April',
                ],
                datasets: [
                  {
                    label: 'My First dataset',
                    backgroundColor: 'rgba(255,255,255,.2)',
                    borderColor: 'rgba(255,255,255,.55)',
                    data: [78, 81, 80, 45, 34, 12, 40, 85, 65, 23, 12, 98, 34, 84, 67, 82],
                    barPercentage: 0.6,
                  },
                ],
              }}
              options={{
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  x: {
                    grid: {
                      display: false,
                      drawTicks: false,
                    },
                    ticks: {
                      display: false,
                    },
                  },
                  y: {
                    grid: {
                      display: false,
                      drawBorder: false,
                      drawTicks: false,
                    },
                    ticks: {
                      display: false,
                    },
                  },
                },
              }}
            />
          }
        />
      </CCol>

      <CCol sm={6} lg={3}>

        <CWidgetStatsA
          className={classNames('mb-4', dustClass, { 'warning-border': dustClass === 'text-warning' })}
          color="success"
          value={`${dust} µg/m³`}
          title="Độ bụi"
          action={
            <CDropdown alignment="end">
              <CDropdownToggle color="transparent" caret={false} className="p-0">
                <CIcon icon={cilOptions} className="text-high-emphasis-inverse" />
              </CDropdownToggle>
              <CDropdownMenu>
                <CDropdownItem>Action</CDropdownItem>
                <CDropdownItem>Another action</CDropdownItem>
                <CDropdownItem>Something else here...</CDropdownItem>
                <CDropdownItem disabled>Disabled action</CDropdownItem>
              </CDropdownMenu>
            </CDropdown>
          }
          chart={
            <CChartLine
              className="mt-3 mx-3"
              style={{ height: '70px' }}
              data={{
                labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
                datasets: [
                  {
                    label: 'My First dataset',
                    backgroundColor: 'transparent',
                    borderColor: 'rgba(255,255,255,.55)',
                    pointBackgroundColor: getStyle('--cui-info'),
                    data: [1, 18, 9, 17, 34, 22, 11],
                  },
                ],
              }}
              options={{
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                maintainAspectRatio: false,
                scales: {
                  x: {
                    grid: {
                      display: false,
                      drawBorder: false,
                    },
                    ticks: {
                      display: false,
                    },
                  },
                  y: {
                    min: -9,
                    max: 39,
                    display: false,
                    grid: {
                      display: false,
                    },
                    ticks: {
                      display: false,
                    },
                  },
                },
                elements: {
                  line: {
                    borderWidth: 1,
                  },
                  point: {
                    radius: 4,
                    hitRadius: 10,
                    hoverRadius: 4,
                  },
                },
              }}
            />
          }
        />
      </CCol>

    </CRow>
  )
}

export default WidgetsDropdown

// Bootstrap mặc định chia một hàng thành 12 cột trên màn hình lớn(lg), sm là màn nhỏ(điện thoại)-- > nếu muốn có 3 cột bằng nhau, bạn có thể sử dụng lg = { 4} cho mỗi cột (cần enter ở cuối dòng k error)
// truyền props từ component cha sang component con
