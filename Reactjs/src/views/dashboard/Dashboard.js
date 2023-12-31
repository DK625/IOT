/* eslint-disable */
// note_by_dk625 eslint-disable để không hiện cảnh báo eslint

import React, { useRef, useEffect, useState } from 'react'
import { cilPowerStandby, cilBolt, cilSun, cilSpeedometer, cilStar } from '@coreui/icons'

import {
  CAvatar,
  CButton,
  CButtonGroup,
  CCard,
  CCardBody,
  CCardFooter,
  CCardHeader,
  CCol,
  CProgress,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import { CChartLine } from '@coreui/react-chartjs'
import { getStyle, hexToRgba } from '@coreui/utils'
import CIcon from '@coreui/icons-react'
import {
  cibCcAmex,
  cibCcApplePay,
  cibCcMastercard,
  cibCcPaypal,
  cibCcStripe,
  cibCcVisa,
  cibGoogle,
  cibFacebook,
  cibLinkedin,
  cifBr,
  cifEs,
  cifFr,
  cifIn,
  cifPl,
  cifUs,
  cibTwitter,
  cilCloudDownload,
  cilPeople,
  cilUser,
  cilUserFemale,
} from '@coreui/icons'

import den_off from 'src/assets/symbol/den-off.png'
import den_on from 'src/assets/symbol/den-on.png'
import fan_off from 'src/assets/symbol/fan-off.png'
import fan_on from 'src/assets/symbol/fan-on.gif'
import den_do_bui from 'src/assets/symbol/anh_do_bui.gif'



import WidgetsBrand from '../widgets/WidgetsBrand'
import WidgetsDropdown from '../widgets/WidgetsDropdown'
import axios from '../../axios'


const mqtt = window.mqtt
const options = {
  clean: true,
  connectTimeout: 4000,
  clientId: 'ESP8266Client-' + Math.floor(Math.random() * 0xFFFF).toString(16),
  username: 'esp8266',
  password: 'G26m64EyzhyC!Kg',
}
const connectUrl = 'wss://0fe9830add1440c494c4c2fa2d0758af.s1.eu.hivemq.cloud:8884/mqtt';
let client = null
const Dashboard = () => {
  const [isLightOn, setIsLightOn] = useState(false);
  const [isFanOn, setIsFanOn] = useState(false);
  const [isDustBlinking, setIsDustBlinking] = useState(false);


  const [dustLevel, setDustLevel] = useState(0);

  // const [index, setIndex] = useState('client - server')  //fake data
  const [index, setIndex] = useState('esp8266_data')
  const [valueTo, setValueTo] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [mqttMessage, setMqttMessage] = useState(null);
  const [temperatureData, setTemperatureData] = useState([]);
  const [humidityData, setHumidityData] = useState([]);
  const [dustData, setDustData] = useState([]); // add A+
  const [lightData, setLightData] = useState([]);

  const chartRef = useRef(null);
  const dustChartRef = useRef(null); // add A+
  const connectToMQTT = () => {
    client = mqtt.connect(connectUrl, options)
    client.on('connect', () => {
      const topic = index
      client.subscribe(topic, (error) => {
        if (!error) {
          console.log(`Subscribed to topic: ${topic}`)
        } else {
          console.error('Error subscribing:', error)
        }
      })
    })
    client.on('message', (topic, message) => {
      try {
        console.log('reviced message: ', message.toString())

        const messageData = JSON.parse(message.toString()); // Assuming the message is JSON
        if (messageData) {
          const latestTemperature = parseFloat(messageData['Nhiệt độ'] || 0);
          const humidityData = parseFloat(messageData['Độ ẩm'] || 0);
          const lightData = parseFloat(messageData['Ánh sáng'] || 0);
          const dustData = parseFloat(messageData['Độ bụi'] || 0);
          axios.post('/api/data_sensor', messageData)
            .then(response => {
              console.log('Dữ liệu đã được gửi thành công:', response);
            })
            .catch(error => {
              console.error('Lỗi khi gửi dữ liệu qua API:', error);
            });

          // Update temperatureData, humidityData, lightData with the latest value, keeping only the last 10 values
          setTemperatureData(prevData => [...prevData.slice(-9), latestTemperature]);
          setHumidityData(prevData => [...prevData.slice(-9), humidityData]);
          setLightData(prevData => [...prevData.slice(-9), lightData]);
          // console.log("value of latestTemperature:", latestTemperature);

          if (chartRef.current) {
            const latestTemperature = parseFloat(messageData['Nhiệt độ'] || 0);
            const humidityData = parseFloat(messageData['Độ ẩm'] || 0);
            const lightData = parseFloat(messageData['Ánh sáng'] || 0);
            chartRef.current.data.datasets[0].data.push(latestTemperature);
            chartRef.current.data.datasets[1].data.push(humidityData);
            chartRef.current.data.datasets[2].data.push(lightData);

            // Giữ chỉ 10 giá trị mới nhất
            if (chartRef.current.data.datasets[0].data.length > 10) {
              chartRef.current.data.datasets[0].data.shift();
              chartRef.current.data.datasets[1].data.shift();
              chartRef.current.data.datasets[2].data.shift();
            }

            // Cập nhật biểu đồ
            chartRef.current.update();
          }

          // add A+
          setDustData(prevData => [...prevData.slice(-9), dustData]);

          if (dustChartRef.current) {
            dustChartRef.current.data.datasets[0].data.push(dustData);

            // Giữ chỉ 10 giá trị mới nhất
            if (dustChartRef.current.data.datasets[0].data.length > 10) {
              dustChartRef.current.data.datasets[0].data.shift();
            }

            // Cập nhật biểu đồ độ bụi
            dustChartRef.current.update();
          }

          if (dustData >= 50) {
            // If dust level is greater than 50, publish a message to control LED
            const ledMessage = 'on_led_dust';
            client.publish('led_state', ledMessage, (error) => {
              if (!error) {
                console.log('Published LED control message:', ledMessage);
                setIsDustBlinking(true); // Set the state to indicate the dust LED is blinking

              } else {
                console.error('Error publishing LED control message:', error);
              }
            });
          } else {
            // If dust level is not greater than 50, turn off the LED
            const ledMessage = 'off_led_dust';
            client.publish('led_state', ledMessage, (error) => {
              if (!error) {
                console.log('Published LED control message:', ledMessage);
                setIsDustBlinking(false); // Set the state to indicate the dust LED is not blinking
              } else {
                console.error('Error publishing LED control message:', error);
              }
            });
          }
        }
      } catch (error) {
        console.log('reviced message: ', message.toString())
      }
    })
  }

  useEffect(() => {
    // Khi component mount, kết nối MQTT
    // note_by_dk625
    connectToMQTT();

    return () => {
      client.end();
    };
  }, [index]);

  const toggleLight = () => {
    setIsLightOn(!isLightOn);
    // isLightOn vẫn là false chưa được cập nhật ngay
    if (isSubscribed) {
      client.unsubscribe("esp8266_data", (error) => {
        if (!error) {
          console.log(`Unsubscribed from topic: esp8266_data`);
          const message = "OFF_GREEN";

          client.publish("led_state", message, (error) => {
            if (!error) {
              console.log('Message sent successfully topic led_state: ', message)
            } else {
              console.error('Error sending message:', error)
            }
          })
        } else {
          console.error('Error unsubscribing:', error);
        }
      });
      setIsSubscribed(false); // Đặt trạng thái unsubscribed
    } else {
      const topic = index
      client.subscribe("esp8266_data", (error) => {
        if (!error) {
          console.log(`Subscribed to topic: esp8266_data`);
          const message = "ON_GREEN";

          client.publish("led_state", message, (error) => {
            if (!error) {
              console.log('Message sent successfully topic led_state: ', message)
            } else {
              console.error('Error sending message:', error)
            }
          })
        } else {
          console.error('Error subscribing:', error);
        }
      });
      setIsSubscribed(true); // Đặt trạng thái subscribed
    }
    let stt;
    if (isLightOn) {
      stt = 'off';
    } else {
      stt = 'on';
    }
    const Payload = { action_name: 'change status', "status": stt, "device_name": "led xanh - đèn" }
    axios.post('/api/action_history', Payload)
      .then(response => {
        console.log('Dữ liệu đã được gửi thành công:', response.data);
      })
      .catch(error => {
        console.error('Lỗi khi gửi dữ liệu qua API:', error);
      });
  };
  const toggleFan = () => {
    setIsFanOn(!isFanOn);
    // tương tự isFanOn vẫn là false do chưa cập nhật
    if (isFanOn) {
      const message = "OFF_RED";

      client.publish("led_state", message, (error) => {
        if (!error) {
          console.log('Message sent successfully topic: led_state')
        } else {
          console.error('Error sending message:', error)
        }
      })
    } else {
      const message = "ON_RED";

      client.publish("led_state", message, (error) => {
        if (!error) {
          console.log('Message sent successfully topic: led_state')
        } else {
          console.error('Error sending message:', error)
        }
      })
    }
    let stt;
    if (isFanOn) {
      stt = 'off';
    } else {
      stt = 'on';
    }
    const Payload = { action_name: 'change status', "status": stt, "device_name": "led đỏ - quạt" }
    axios.post('/api/action_history', Payload)
      .then(response => {
        console.log('Dữ liệu đã được gửi thành công:', response.data);
      })
      .catch(error => {
        console.error('Lỗi khi gửi dữ liệu qua API:', error);
      });
  }

  const progressExample = [
    { title: 'Nhiệt độ', value: '°C', percent: 80, color: 'danger' },
    { title: 'Độ ẩm', value: '%', percent: 80, color: 'info' },
    { title: 'Ánh sáng', value: 'Lux', percent: 80, color: 'warning' },
    { title: 'Độ bụi', value: 'µg/m³', percent: 80, color: 'success' }, // add A+
  ]
  return (
    <>
      {/* <WidgetsDropdown /> */}
      <WidgetsDropdown
        temperature={temperatureData[temperatureData.length - 1]}
        humidity={humidityData[humidityData.length - 1]}
        light={lightData[lightData.length - 1]}
        dust={dustData[dustData.length - 1]} // add A+
      />
      <CCard className="mb-4">
        <CCardBody>
          <CRow>
            <CCol sm={7}>
              <h4 id="temperature-chart-title" className="card-title mb-0">
                Biểu đồ nhiệt độ - độ ẩm - ánh sáng
              </h4>
            </CCol>
            {/* <CCol sm={5}>
              <h4 id="dust-chart-title" className="card-title mb-0">
                Biểu đồ độ bụi
              </h4>
            </CCol> */}
          </CRow>
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            {/* <div style={{display: 'flex', flexDirection: 'row' }}> */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'row' }}>
              {/* add A+ */}
              <CChartLine
                ref={chartRef}
                style={{ height: '300px', marginTop: '40px', width: '66.67%' }}
                data={{
                  labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
                  datasets: [
                    {
                      label: 'Nhiệt độ',
                      backgroundColor: hexToRgba(getStyle('--cui-info'), 10),
                      borderColor: getStyle('--cui-danger'),
                      pointHoverBackgroundColor: getStyle('--cui-danger'),
                      borderWidth: 2,
                      data: [],
                      fill: true,
                    },
                    {
                      label: 'Độ ẩm',
                      backgroundColor: 'transparent',
                      borderColor: getStyle('--cui-info'),
                      pointHoverBackgroundColor: getStyle('--cui-info'),
                      borderWidth: 2,
                      data: [],
                    },
                    {
                      label: 'Ánh sáng',
                      backgroundColor: 'transparent',
                      borderColor: getStyle('--cui-warning'),
                      pointHoverBackgroundColor: getStyle('--cui-warning'),
                      borderWidth: 1,
                      borderDash: [8, 5],
                      data: [],
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
                        drawOnChartArea: false,
                      },
                    },
                    y: {
                      ticks: {
                        beginAtZero: true,
                        maxTicksLimit: 5,
                        stepSize: Math.ceil(250 / 5),
                        max: 250,
                      },
                    },
                  },
                  elements: {
                    line: {
                      tension: 0.4,
                    },
                    point: {
                      radius: 0,
                      hitRadius: 10,
                      hoverRadius: 4,
                      hoverBorderWidth: 3,
                    },
                  },
                }}
              />
              <div style={{ width: '23.33%', display: 'flex', flexDirection: 'column' }}>
                <CRow className="mb-2">
                  <CCol style={{ height: '150px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <img
                      src={isLightOn ? den_on : den_off} // Sử dụng ảnh den_on khi bật và den_off khi tắt
                      alt="Light Icon"
                      style={{
                        width: '48px', // Điều chỉnh kích thước ảnh
                        height: '48px',
                        cursor: 'pointer',
                        transition: 'transform 0.3s',
                        transform: isLightOn ? 'scale(1.1)' : 'scale(1)', // Thay đổi kích thước ảnh khi bật/tắt
                      }}
                      onClick={toggleLight}
                    />
                    <CButton
                      color={isLightOn ? 'warning' : 'grey'} // Thay đổi màu sắc của button
                      style={{
                        fontSize: '18px', // Điều chỉnh kích thước font của button
                        marginTop: '10px', // Điều chỉnh khoảng cách giữa biểu tượng và button
                        display: 'flex',
                        alignItems: 'center', // Căn giữa biểu tượng và văn bản trong button
                      }}
                      onClick={toggleLight}
                    >
                      {isLightOn ? (
                        <CIcon icon={cilSun} style={{ fontSize: '24px', marginRight: '5px' }} /> // Thêm biểu tượng mặt trời
                      ) : (
                        <CIcon icon={cilBolt} style={{ fontSize: '24px', marginRight: '5px' }} /> // Thêm biểu tượng tia chớp
                      )}
                      Ánh sáng
                    </CButton>
                  </CCol>
                </CRow>
                <CRow style={{ flex: 1 }}>
                  <CCol style={{ height: '150px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <img
                      src={isFanOn ? fan_on : fan_off} // Sử dụng ảnh fan_on khi bật và fan_off khi tắt
                      alt="Fan Icon"
                      style={{
                        width: '48px', // Điều chỉnh kích thước ảnh
                        height: '48px',
                        cursor: 'pointer',
                        transition: 'transform 0.3s',
                        transform: isFanOn ? 'scale(1.1)' : 'scale(1)', // Thay đổi kích thước ảnh khi bật/tắt
                      }}
                      onClick={toggleFan}
                    />
                    <CButton
                      color={isFanOn ? 'success' : 'grey'} // Thay đổi màu sắc của button
                      style={{
                        fontSize: '18px',
                        marginTop: '10px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      onClick={toggleFan}
                    >
                      {isFanOn ? (
                        <CIcon icon={cilStar} style={{ fontSize: '24px', marginRight: '5px' }} /> // Thêm biểu tượng quạt
                      ) : (
                        <CIcon icon={cilSpeedometer} style={{ fontSize: '24px', marginRight: '5px' }} /> // Thêm biểu tượng đồng hồ
                      )}
                      Quạt
                    </CButton>
                  </CCol>
                </CRow>
                <CRow className="mb-2">
                  <CCol style={{ height: '150px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <img
                      src={isDustBlinking ? den_do_bui : den_off} // Sử dụng den_on khi đèn nhấp nháy và den_off khi không nhấp nháy hoặc chưa vượt qua ngưỡng 50
                      alt="Dust Icon"
                      style={{
                        width: '48px', // Điều chỉnh kích thước ảnh
                        height: '48px',
                        cursor: 'pointer',
                        transition: 'transform 0.3s',
                        transform: isDustBlinking ? 'scale(1.1)' : 'scale(1)', // Thay đổi kích thước ảnh khi nhấp nháy/không nhấp nháy
                      }}
                    />
                    <CButton
                      color={isDustBlinking ? 'warning' : 'grey'} // Thay đổi màu sắc của button dựa trên việc đèn có nhấp nháy hay không
                      style={{
                        fontSize: '18px', // Điều chỉnh kích thước font của button
                        marginTop: '10px', // Điều chỉnh khoảng cách giữa biểu tượng và button
                        display: 'flex',
                        alignItems: 'center', // Căn giữa biểu tượng và văn bản trong button
                      }}
                    >
                      Đèn Độ Bụi
                    </CButton>
                  </CCol>
                </CRow>

              </div>

            </div>

            <div style={{ width: '0%', display: 'flex', flexDirection: 'column' }}>
              {/* add A+ */}
              <CChartLine
                ref={dustChartRef}
                style={{ height: '300px', marginTop: '40px', width: '96.67%' }}
                data={{
                  labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
                  datasets: [
                    {
                      label: 'Độ bụi',
                      backgroundColor: hexToRgba(getStyle('--cui-success'), 10),
                      borderColor: getStyle('--cui-success'),
                      pointHoverBackgroundColor: getStyle('--cui-success'),
                      borderWidth: 2,
                      data: [],
                      fill: true,
                    }
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
                        drawOnChartArea: false,
                      },
                    },
                    y: {
                      ticks: {
                        beginAtZero: true,
                        maxTicksLimit: 5,
                        stepSize: Math.ceil(250 / 5),
                        max: 250,
                      },
                    },
                  },
                  elements: {
                    line: {
                      tension: 0.4,
                    },
                    point: {
                      radius: 0,
                      hitRadius: 10,
                      hoverRadius: 4,
                      hoverBorderWidth: 3,
                    },
                  },
                }}
              />
            </div>
          </div>

        </CCardBody>
        <CCardFooter>
          {/* <CRow xs={{ cols: 1 }} md={{ cols: 3 }} className="text-center"> */}
          <CRow xs={{ cols: 1 }} md={{ cols: 4 }} className="text-center">
            {/* add A+ */}
            {progressExample.map((item, index) => (
              <CCol className="mb-sm-2 mb-0" key={index}>
                <div className="text-medium-emphasis">{item.title}</div>
                <strong>
                  {/* {item.value} ({item.percent}%) */}
                  Đơn vị: {item.value}
                </strong>
                <CProgress thin className="mt-2" color={item.color} value={item.percent} />
              </CCol>
            ))}
          </CRow>
        </CCardFooter>
      </CCard >

      <WidgetsBrand withCharts />

    </>
  )
}

export default Dashboard

// [{ "name": "Độ ẩm", "value":88.30},{ "name": "Nhiệt độ", "value": 28.90},{"name":"Ánh sáng","value":44}]

// [{ "name": "Độ ẩm", "value":88.30, "unit": "%" , "gpio": 4 },{ "name": "Nhiệt độ", "value": 28.90, "unit": "°C" , "gpio": 4 },{"name":"led xanh","value":0,"unit":null,"gpio":19}]
// [{ "name": "Độ ẩm", "value":98.30, "unit": "%" , "gpio": 4 },{ "name": "Nhiệt độ", "value": 38.90, "unit": "°C" , "gpio": 4 },{"name":"led xanh","value":0,"unit":null,"gpio":19}]
// [{ "name": "Độ ẩm", "value":78.30, "unit": "%" , "gpio": 4 },{ "name": "Nhiệt độ", "value": 25.90, "unit": "°C" , "gpio": 4 },{"name":"led xanh","value":0,"unit":null,"gpio":19}]
// [{ "name": "Độ ẩm", "value":99.30, "unit": "%" , "gpio": 4 },{ "name": "Nhiệt độ", "value": 28.90, "unit": "°C" , "gpio": 4 },{"name":"led xanh","value":0,"unit":null,"gpio":19}]
// [{ "name": "Độ ẩm", "value":100, "unit": "%" , "gpio": 4 },{ "name": "Nhiệt độ", "value": 26.90, "unit": "°C" , "gpio": 4 },{"name":"led xanh","value":0,"unit":null,"gpio":19}]
// [{ "name": "Độ ẩm", "value":88.30, "unit": "%" , "gpio": 4 },{ "name": "Nhiệt độ", "value": 28.90, "unit": "°C" , "gpio": 4 },{"name":"led xanh","value":0,"unit":null,"gpio":19}]
// [{ "name": "Độ ẩm", "value":89.30, "unit": "%" , "gpio": 4 },{ "name": "Nhiệt độ", "value": 29.90, "unit": "°C" , "gpio": 4 },{"name":"led xanh","value":0,"unit":null,"gpio":19}]
// [{ "name": "Độ ẩm", "value":99.30, "unit": "%" , "gpio": 4 },{ "name": "Nhiệt độ", "value": 25.90, "unit": "°C" , "gpio": 4 },{"name":"led xanh","value":0,"unit":null,"gpio":19}]
// [{ "name": "Độ ẩm", "value":88.30, "unit": "%" , "gpio": 4 },{ "name": "Nhiệt độ", "value": 30.90, "unit": "°C" , "gpio": 4 },{"name":"led xanh","value":0,"unit":null,"gpio":19}]
// [{ "name": "Độ ẩm", "value":91.30, "unit": "%" , "gpio": 4 },{ "name": "Nhiệt độ", "value": 28.90, "unit": "°C" , "gpio": 4 },{"name":"led xanh","value":0,"unit":null,"gpio":19}]

// [{ "action_name": "change port", "value": 25, "status": null, "device_name": "ánh sáng" }]
// [{ "action_name": "change port", "value": 25, "status": null, "device_name": "độ ẩm" }]
// [{ "action_name": "change port", "value": 25, "status": null, "device_name": "nhiệt độ" }]

// [{ "action_name": "change status", "value": null, "status": Off, "device_name": "led xanh" }]
// [{ "action_name": "change status", "value": null, "status": On, "device_name": "led xanh" }]

// [{ "action_name": "change limit", "value": null, "statu/s": "60 - 95", "device_name": "Độ ẩm" }]


// reviced message:  [{"name":"Độ ẩm","value":78.3,"unit":"%","gpio":4},{"name":"Nhiệt độ","value":25.9,"unit":"°C","gpio":4},{"name":"led xanh","value":0,"unit":null,"gpio":19}]

// reviced message:  [{"name":"Độ ẩm","value":3,"unit":"%","gpio":4},{"name":"Nhiệt độ","value":60.09999847,"unit":"°C","gpio":4},{"name":


// sm = { 5} cho biết rằng cột đóng vai trò là một cột trên các thiết bị có màn hình nhỏ hơn hoặc bằng "sm" và chiếm 5 / 12 của chiều rộng tổng của hàng(row).Bootstrap sử dụng hệ thống cột 12 cột để quản lý việc sắp xếp các cột trong một hàng.Điều này có nghĩa là cột này sẽ chiếm khoảng 5 / 12(tương đương 41.67 %) của chiều rộng tổng của hàng.

// note_by_dk625