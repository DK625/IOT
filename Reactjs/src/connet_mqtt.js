/* eslint-disable */
import React, { useEffect, useState } from 'react'
// import mqtt from 'mqtt'
const mqtt = window.mqtt
// const options = {
//     clean: true,
//     connectTimeout: 4000,
//     clientId: 'emqx_test' + Math.random().toString(),
//     // clientId: 'ESP8266Client',
//     username: 'admin',
//     password: 'DK94VZ0tKrGQwxKXY3FE',
// }
// // const connectUrl = 'wss://4038011a2fdc4d9b8c3123a10cc5f620.s2.eu.hivemq.cloud:8884/mqtt'
// const connectUrl = 'wss://mqtt-dashboard.com:8884/mqtt'
const options = {
    clean: true,
    connectTimeout: 4000,
    clientId: 'ESP8266Client-' + Math.floor(Math.random() * 0xFFFF).toString(16),
    username: 'esp8266',
    password: 'G26m64EyzhyC!Kg',
}
const connectUrl = 'wss://0fe9830add1440c494c4c2fa2d0758af.s1.eu.hivemq.cloud:8884/mqtt';
let client = null
const MqttComponent = () => {
    const [index, setIndex] = useState('esp8266_data')
    const [valueFrom, setValueFrom] = useState('')
    const [valueTo, setValueTo] = useState('')
    const [intervalId, setIntervalId] = useState(null);
    useEffect(() => {
        client = mqtt.connect(connectUrl, options)
        client.on('connect', () => {
            const topic = "esp8266_data";
            client.subscribe(topic, (error) => {
                console.log((topic))
                if (!error) {
                    console.log(`Subscribed to topic: ${topic}`)
                } else {
                    console.error('Error subscribing:', error)
                }
            })
        })
        client.on('message', (topic, message) => {
            setValueTo(message.toString())
        })
        return () => {
            client.end()
        }
    }, [index])

    const handlePush = () => {
        const topic = index
        const message = valueFrom
        client.publish(topic, message, (error) => {
            if (!error) {
                console.log('Message sent successfully')
            } else {
                console.error('Error sending message:', error)
            }
        })
    }

    const sendMessage = () => {
        const topic = index
        const messages = [
            // { "Độ ẩm": 12.5, "Nhiệt độ": 7.800000191, "Ánh sáng": 17 },
            // { "Độ ẩm": 13.5, "Nhiệt độ": 8.800000191, "Ánh sáng": 18 },
            // { "Độ ẩm": 14.5, "Nhiệt độ": 9.800000191, "Ánh sáng": 19 },
            // { "Độ ẩm": 15.5, "Nhiệt độ": 10.800000191, "Ánh sáng": 20 },
            // { "Độ ẩm": 16.5, "Nhiệt độ": 11.800000191, "Ánh sáng": 21 },
            // { "Độ ẩm": 17.5, "Nhiệt độ": 12.800000191, "Ánh sáng": 22 },
            // { "Độ ẩm": 18.5, "Nhiệt độ": 13.800000191, "Ánh sáng": 23 },
            // { "Độ ẩm": 19.5, "Nhiệt độ": 14.800000191, "Ánh sáng": 24 },
            // { "Độ ẩm": 20.5, "Nhiệt độ": 15.800000191, "Ánh sáng": 25 },
            // { "Độ ẩm": 21.5, "Nhiệt độ": 16.800000191, "Ánh sáng": 26 },
            // { "Độ ẩm": 22.5, "Nhiệt độ": 17.800000191, "Ánh sáng": 27 },

            { "Độ ẩm": 12.5, "Nhiệt độ": 7.800000191, "Ánh sáng": 17, "Độ bụi": 30 },
            { "Độ ẩm": 13.5, "Nhiệt độ": 8.800000191, "Ánh sáng": 18, "Độ bụi": 40 },
            { "Độ ẩm": 14.5, "Nhiệt độ": 9.800000191, "Ánh sáng": 19, "Độ bụi": 50 },
            { "Độ ẩm": 15.5, "Nhiệt độ": 10.800000191, "Ánh sáng": 20, "Độ bụi": 60 },
            { "Độ ẩm": 16.5, "Nhiệt độ": 11.800000191, "Ánh sáng": 21, "Độ bụi": 70 },
            { "Độ ẩm": 17.5, "Nhiệt độ": 12.800000191, "Ánh sáng": 22, "Độ bụi": 80 },
            { "Độ ẩm": 18.5, "Nhiệt độ": 13.800000191, "Ánh sáng": 23, "Độ bụi": 90 },
            { "Độ ẩm": 19.5, "Nhiệt độ": 14.800000191, "Ánh sáng": 24, "Độ bụi": 35 },
            { "Độ ẩm": 20.5, "Nhiệt độ": 15.800000191, "Ánh sáng": 25, "Độ bụi": 45 },
            { "Độ ẩm": 21.5, "Nhiệt độ": 16.800000191, "Ánh sáng": 26, "Độ bụi": 55 },
            { "Độ ẩm": 22.5, "Nhiệt độ": 17.800000191, "Ánh sáng": 27, "Độ bụi": 65 },
        ]
        let currentIndex = 0;
        const sendNextMessage = () => {
            if (currentIndex >= messages.length) {
                currentIndex = 0; // Start over when reaching the end of the messages array
            }
            const message = JSON.stringify(messages[currentIndex]);

            client.publish(topic, message, (error) => {
                if (!error) {
                    console.log('Message sent successfully')
                } else {
                    console.error('Error sending message:', error)
                }
            })
            currentIndex++;
        }
        const newIntervalId = setInterval(sendNextMessage, 1500);
        setIntervalId(newIntervalId);
    };

    const handleAutoSendMessage = () => {
        if (intervalId) {
            clearInterval(intervalId); // Stop auto-sending if it's already running
            setIntervalId(null);
        } else {
            // Start auto-sending messages
            sendMessage();
        }
    };
    return (
        <div>
            <div onClick={() => { setIndex(prop => prop === 'client - server' ? 'server - client' : 'client - server') }}>{index}</div>
            <input className='border-2' type="text" value={valueFrom} onChange={(e) => setValueFrom(e.target.value)} />
            <button onClick={() => handlePush()}>Gửi</button>
            <button onClick={handleAutoSendMessage}>
                {intervalId ? 'Stop Auto Sending' : 'Start Auto Sending'}
            </button>
            <div>{valueTo}</div>
        </div>
    )
}

export default MqttComponent

// 1. Ban đầu topic là client - server, ấn vào topic thì nó thay đổi thành server - client
// 2. Khi nhập giá trị hàm onChange sẽ bắt sự thay đổi và sử dụng setValueFrom để gán sự thay đổi (input) vào biến valueFrom
// 3. sau khi click vào button gửi gọi hàm handlePush sẽ public valueFrom này vào topic là client - server
// 4. nếu là topic là client - server thì topic của subcripbe là server - client (sử dụng 1 topic khác) sau đó gán message nhận được vào valueTo để hiển thị trong thẻ div bên dưới

// tại sao public 1 topic lại subscribe 1 topic khác?

// tại sao client - server gửi message server - client nhận được hiện ở thẻ div bên dưới input nhưng bên client - server lại k hiện ?

// à hiểu r
// prop là client - server thì sẽ public vào topic là client - server
// khi prop là server - client thì topic sẽ là client - server (ngược lại) nên nhận được message do cùng topic đồng thời valueTo sẽ có giá trị và hiện bên dưới, còn client - server thì topic là server - client nên k có message gửi đến trong topic này nên valueTo k có giá trị để hiển thị