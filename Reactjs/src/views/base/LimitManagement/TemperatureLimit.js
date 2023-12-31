/* eslint-disable */
import React, { useState, useEffect } from 'react'
import {
    CButton,
    CCol,
    CCard,
    CCardBody,
    CCardHeader,
    CRow,
    CFormInput,
} from '@coreui/react'
import './LimitInputPage.scss'
import axios from '../../../axios'
const TemperatureLimit = () => {
    const [upperLimit, setUpperLimit] = useState('')
    const [lowerLimit, setLowerLimit] = useState('')

    useEffect(() => {
        // Sử dụng useEffect để kích hoạt hiệu ứng sau khi component được tạo
        const limitInputPage = document.querySelector('.limit-input-page');
        if (limitInputPage) {
            limitInputPage.classList.add('fadeIn');
        }
    }, []);

    const handleUpperLimitChange = (e) => {
        setUpperLimit(e.target.value)
    }

    const handleLowerLimitChange = (e) => {
        setLowerLimit(e.target.value)
    }

    const handleOKClick = () => {
        // Xử lý khi người dùng nhấn nút OK
        console.log('Giới hạn trên:', upperLimit)
        console.log('Giới hạn dưới:', lowerLimit)

        const changeLimitPayload = { action_name: 'change limit', status: `${lowerLimit}°C - ${upperLimit}°C`, "device_name": "Nhiệt độ" };
        axios.post('/api/action_history', changeLimitPayload)
            .then(response => {
                console.log('Dữ liệu đã được gửi thành công:', response.data);
            })
            .catch(error => {
                console.error('Lỗi khi gửi dữ liệu qua API:', error);
            });
    }

    return (
        <CRow>
            <CCol xs={12}>
                <CCard className="mb-4 limit-input-page">
                    <CCardHeader>
                        <strong>Nhập Giới Hạn Nhiệt độ</strong>
                    </CCardHeader>
                    <CCardBody>
                        <div>
                            <label>Giới hạn trên:</label>
                            <CFormInput
                                type="text"
                                placeholder="Nhập giới hạn trên"
                                value={upperLimit}
                                onChange={handleUpperLimitChange}
                            />
                        </div>
                        <div>
                            <label>Giới hạn dưới:</label>
                            <CFormInput
                                type="text"
                                placeholder="Nhập giới hạn dưới"
                                value={lowerLimit}
                                onChange={handleLowerLimitChange}
                            />
                        </div>
                        <CButton color="primary" onClick={handleOKClick}>
                            OK
                        </CButton>
                    </CCardBody>
                </CCard>
            </CCol>
        </CRow>
    )
}

export default TemperatureLimit
