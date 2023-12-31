/* eslint-disable */
import React, { useState, useEffect } from 'react';
import Table from 'react-bootstrap/Table';
import axios from './axios';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ReactPaginate from 'react-paginate';
import { endOfDay } from 'date-fns';
import DatePicker from 'react-datepicker';

const ActionHistoryTable = () => {
    const [actionData, setActionData] = useState([]);
    const [pageNumber, setPageNumber] = useState(0);
    const [sortOrder, setSortOrder] = useState('desc'); // Thứ tự sắp xếp mặc định là giảm dần
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const perPage = 15; // Số dòng hiển thị trên mỗi trang
    const [originalData, setOriginalData] = useState([]); // Lưu trữ dữ liệu gốc

    useEffect(() => {
        // Thực hiện yêu cầu GET đến API khi component được mount
        axios.get('/api/action_history')
            .then(response => {
                // Cập nhật state với dữ liệu từ API
                setActionData(response.actions);
                setOriginalData(response.actions); // Cập nhật originalData ở đây
                console.log('response: ', response.actions);
            })
            .catch(error => {
                console.error('Lỗi khi lấy dữ liệu từ API:', error);
            });
    }, []); // Chạy chỉ một lần khi component được mount

    // Hàm sắp xếp dữ liệu theo thời gian
    const sortDataByTime = (data, order) => {
        if (order === 'asc') {
            return data.sort((a, b) => new Date(a.time) - new Date(b.time));
        } else {
            return data.sort((a, b) => new Date(b.time) - new Date(a.time));
        }
    };

    // Thay đổi thứ tự sắp xếp và cập nhật dữ liệu
    const handleSortClick = () => {
        const newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
        setSortOrder(newSortOrder);
        const sortedData = sortDataByTime(actionData, newSortOrder);
        setActionData(sortedData);
    };

    const pageCount = Math.ceil(actionData.length / perPage);

    const handlePageClick = ({ selected }) => {
        setPageNumber(selected);
    };

    const offset = pageNumber * perPage;

    // Hàm tìm kiếm dữ liệu theo khoảng thời gian
    const handleSearch = () => {
        if (startDate && endDate) {
            const filteredData = originalData.filter((data) => {
                const actionDate = new Date(data.time);
                return startDate <= actionDate && actionDate <= endDate;
            });
            setActionData(filteredData);
        }
    };

    const handleStartDateChange = (date) => {
        setStartDate(date);
    };

    const handleEndDateChange = (date) => {
        const endOfDayDate = endOfDay(date);
        setEndDate(endOfDayDate);
    };

    // Hàm xóa tìm kiếm và hiển thị lại tất cả dữ liệu
    const clearSearch = () => {
        setStartDate(null);
        setEndDate(null);
        setActionData(originalData);
    };

    return (
        <div>
            <div className="date-picker-container">
                <div className="filter-inputs">
                    <DatePicker
                        selected={startDate}
                        onChange={handleStartDateChange}
                        selectsStart
                        startDate={startDate}
                        endDate={endDate}
                        placeholderText="Ngày bắt đầu"
                    />
                    <DatePicker
                        selected={endDate}
                        onChange={handleEndDateChange}
                        selectsEnd
                        startDate={startDate}
                        endDate={endDate}
                        placeholderText="Ngày kết thúc"
                    />
                </div>
                <button onClick={handleSearch}>Tìm kiếm</button>
                <button onClick={clearSearch}>Xóa tìm kiếm</button>
            </div>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th onClick={handleSortClick} style={{ cursor: 'pointer' }}>
                            Time
                            {sortOrder === 'asc' ? ' ▲' : ' ▼'}
                        </th>
                        <th>Action</th>
                        <th>Status</th>
                        <th>Device Name</th>
                    </tr>
                </thead>
                <tbody>
                    {actionData.slice(offset, offset + perPage).map((data, index) => (
                        <tr key={index}>
                            <td>{data.id}</td>
                            <td>{data.time}</td>
                            <td>{data.action}</td>
                            <td>{data.status}</td>
                            <td>{data.device}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            <div className="pagination-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50px' }}>
                <ReactPaginate
                    previousLabel={"Previous"}
                    nextLabel={"Next"}
                    pageCount={pageCount}
                    onPageChange={handlePageClick}
                    containerClassName={"pagination"}
                    activeClassName={"active"}
                    pageClassName={"page-item"}
                    pageLinkClassName={"page-link"}
                    previousClassName={"page-item"}
                    previousLinkClassName={"page-link"}
                    nextClassName={"page-item"}
                    nextLinkClassName={"page-link"}
                    marginPagesDisplayed={1} // Hiển thị 1 trang trước và 1 trang sau
                    breakLabel={<span className="page-link">...</span>} // Sử dụng dấu ...
                    forcePage={pageNumber} // Hiển thị trang hiện tại
                />
            </div>
        </div>
    );
};

export default ActionHistoryTable;
