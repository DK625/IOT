/* eslint-disable */
import React, { useState, useEffect } from 'react';
const mqtt = window.mqtt
const MQTTComponent = () => {
    const [client, setClient] = useState(null);

    const mqttServer = 'wss://0fe9830add1440c494c4c2fa2d0758af.s1.eu.hivemq.cloud:8884/mqtt';
    const username = 'esp8266';
    const password = 'G26m64EyzhyC!Kg';
    const topic = 'esp8266_data';

    useEffect(() => {
        // Create a new MQTT client
        const mqttClient = mqtt.connect(mqttServer, {
            username,
            password,
            clientId: `react-client-${Math.random().toString(16).substr(2, 8)}`,
        });

        // Set up event handlers
        mqttClient.on('connect', () => {
            console.log('Connected to HiveMQ');
        });

        mqttClient.on('error', (err) => {
            console.error('MQTT Error:', err);
        });

        // Subscribe to a topic if needed
        // mqttClient.subscribe(topic);

        // Save the MQTT client instance in state
        setClient(mqttClient);

        // Cleanup on unmount
        return () => {
            if (mqttClient) {
                mqttClient.end();
                console.log('Disconnected from HiveMQ');
            }
        };
    }, []);

    const publishMessage = () => {
        if (client) {
            const data = {
                humidity: 50, // Replace with your sensor data
                temperature: 25, // Replace with your sensor data
            };

            client.publish(topic, JSON.stringify(data), (err) => {
                if (!err) {
                    console.log('Message published successfully');
                } else {
                    console.error('Error publishing message:', err);
                }
            });
        }
    };

    return (
        <div>
            <h1>MQTT Connection Status: {client ? 'Connected' : 'Disconnected'}</h1>
            <button onClick={publishMessage}>Publish Data</button>
        </div>
    );
};

export default MQTTComponent;
