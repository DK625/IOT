/* eslint-disable */
/* eslint-disable */
import React, { useState, useEffect } from 'react';
import Table from 'react-bootstrap/Table';
import axios from './axios';
import ReactPaginate from 'react-paginate';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { endOfDay } from 'date-fns';
import './SensorDataTable.scss';

const SensorDataTable = () => {
    const [sensorData, setSensorData] = useState([]);
    const [pageNumber, setPageNumber] = useState(0);
    const perPage = 15;
    const [sortOrder, setSortOrder] = useState({
        time: 'desc',
        humidity: 'asc',
        temperature: 'asc',
        light: 'asc',
        dust: 'asc'
    });
    const pageCount = Math.ceil(sensorData.length / perPage);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [originalSensorData, setOriginalSensorData] = useState([]);
    const [minHumidity, setMinHumidity] = useState("");
    const [minTemperature, setMinTemperature] = useState("");
    const [minLight, setMinLight] = useState("");
    const [minDust, setMinDust] = useState("");

    useEffect(() => {
        axios.get('/api/data_sensor')
            .then(response => {
                setSensorData(response.sensor_data);
                setOriginalSensorData(response.sensor_data);
                console.log('response: ', response.sensor_data);
            })
            .catch(error => {
                console.error('Lỗi khi lấy dữ liệu từ API:', error);
            });
    }, []);

    const handlePageClick = ({ selected }) => {
        setPageNumber(selected);
    };

    const offset = pageNumber * perPage;

    const sortDataByField = (data, field, order) => {
        const sortedData = [...data];
        return order === 'asc'
            ? sortedData.sort((a, b) => parseFloat(a[field]) - parseFloat(b[field]))
            : sortedData.sort((a, b) => parseFloat(b[field]) - parseFloat(a[field]));
    };

    const handleSortClick = (field) => {
        const newSortOrder = { ...sortOrder };
        newSortOrder[field] = sortOrder[field] === 'asc' ? 'desc' : 'asc';
        setSortOrder(newSortOrder);

        const sortedData = sortDataByField(originalSensorData, field, newSortOrder[field]);
        setSensorData(sortedData);
    };

    const handleStartDateChange = (date) => {
        setStartDate(date);
        console.log('start_date: ', date);
    };

    const handleEndDateChange = (date) => {
        const endOfDayDate = endOfDay(date);
        setEndDate(endOfDayDate);
        console.log('end_date: ', endOfDayDate);
    };

    const filterDataByDateAndValues = () => {
        const filteredData = originalSensorData.filter((data) => {
            const dataDate = new Date(data.time);

            const temperature = parseFloat(data.temperature);
            const humidity = parseFloat(data.humidity);
            const light = parseFloat(data.light);
            const dust = parseFloat(data.dust);

            const isDateInRange =
                (!startDate || !endDate) ||
                (dataDate >= startDate && dataDate <= endDate);

            const isHumidityInRange =
                (!minHumidity || humidity == parseFloat(minHumidity));

            const isTemperatureInRange =
                (!minTemperature || temperature == parseFloat(minTemperature));

            const isLightInRange =
                (!minLight || light == parseFloat(minLight));

            const isDustInRange =
                (!minDust || dust == parseFloat(minDust));

            return isDateInRange && isHumidityInRange && isTemperatureInRange && isLightInRange && isDustInRange;
        });

        setSensorData(filteredData);
    };

    const clearFilters = () => {
        setStartDate(null);
        setEndDate(null);
        setMinHumidity("");
        setMinTemperature("");
        setMinLight("");
        setMinDust("");
        setSensorData([...originalSensorData]);
    };

    return (
        <div>
            <h2>Dữ liệu cảm biến</h2>
            <div className="filter-container">
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
                    <input
                        type="number"
                        placeholder="Độ ẩm chính xác"
                        value={minHumidity}
                        onChange={(e) => setMinHumidity(e.target.value)}
                    />
                    <input
                        type="number"
                        placeholder="Nhiệt độ chính xác"
                        value={minTemperature}
                        onChange={(e) => setMinTemperature(e.target.value)}
                    />
                    <input
                        type="number"
                        placeholder="Ánh sáng chính xác"
                        value={minLight}
                        onChange={(e) => setMinLight(e.target.value)}
                    />
                    <input
                        type="number"
                        placeholder="Độ bụi tối thiểu"
                        value={minDust}
                        onChange={(e) => setMinDust(e.target.value)}
                    />
                </div>
                <div className="filter-buttons">
                    <button className="filter-button" onClick={filterDataByDateAndValues}>
                        <span>Filter</span>
                    </button>
                    <button className="clear-button" onClick={clearFilters}>
                        <span>Clear filter data</span>
                    </button>
                </div>
            </div>

            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>STT</th>
                        <th onClick={() => handleSortClick('time')} style={{ cursor: 'pointer' }}>
                            Time
                            {sortOrder.time === 'asc' ? ' ▲' : ' ▼'}
                        </th>
                        <th onClick={() => handleSortClick('humidity')} style={{ cursor: 'pointer' }}>
                            Độ ẩm (%)
                            {sortOrder.humidity === 'asc' ? ' ▲' : ' ▼'}
                        </th>
                        <th onClick={() => handleSortClick('temperature')} style={{ cursor: 'pointer' }}>
                            Nhiệt độ (°C)
                            {sortOrder.temperature === 'asc' ? ' ▲' : ' ▼'}
                        </th>
                        <th onClick={() => handleSortClick('light')} style={{ cursor: 'pointer' }}>
                            Ánh sáng (Lux)
                            {sortOrder.light === 'asc' ? ' ▲' : ' ▼'}
                        </th>
                        <th onClick={() => handleSortClick('dust')} style={{ cursor: 'pointer' }}>
                            Độ bụi (µg/m³)
                            {sortOrder.dust === 'asc' ? ' ▲' : ' ▼'}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {sensorData.slice(offset, offset + perPage).map((data, index) => (
                        <tr key={index}>
                            <td>{data.id}</td>
                            <td>{data.time}</td>
                            <td>{data.humidity}</td>
                            <td>{data.temperature}</td>
                            <td>{data.light}</td>
                            <td>{data.dust}</td>
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
                    marginPagesDisplayed={1}
                    breakLabel={<span className="page-link">...</span>}
                    forcePage={pageNumber}
                />
            </div>
        </div>
    );
};

export default SensorDataTable;
