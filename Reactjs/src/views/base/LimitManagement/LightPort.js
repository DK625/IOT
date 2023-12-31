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
import './PortInputPage.scss'
import axios from '../../../axios'

const PortInputPage = () => {
    const [portNumber, setPortNumber] = useState('')

    useEffect(() => {
        // Sử dụng useEffect để kích hoạt hiệu ứng sau khi component được tạo
        const portInputPage = document.querySelector('.port-input-page');
        if (portInputPage) {
            portInputPage.classList.add('fadeIn');
        }
    }, []);

    const handlePortNumberChange = (e) => {
        setPortNumber(e.target.value)
    }

    const handleOKClick = () => {
        // Xử lý khi người dùng nhấn nút OK
        console.log('Số cổng:', portNumber)
        const changePortPayload = { action_name: 'change port', port: portNumber, "status": null, "device_name": "Ánh sáng" };
        axios.post('/api/action_history', changePortPayload)
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
                <CCard className="mb-4 port-input-page">
                    <CCardHeader>
                        <strong>Nhập Số Cổng Ánh sáng</strong>
                    </CCardHeader>
                    <CCardBody>
                        <div>
                            <label>Số cổng:</label>
                            <CFormInput
                                type="text"
                                placeholder="Nhập số cổng"
                                value={portNumber}
                                onChange={handlePortNumberChange}
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

export default PortInputPage
