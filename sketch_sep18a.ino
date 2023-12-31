#ifdef ESP8266
#include <ESP8266WiFi.h>  // Pins for board ESP8266 Wemos-NodeMCU
#else
#include <WiFi.h>
#endif

#include "DHTesp.h"
#include <ArduinoJson.h>
#include <PubSubClient.h>
#include <WiFiClientSecure.h>
/**** DHT11 sensor Settings *******/
#define DHTpin 2  
DHTesp dht;

/**** LED Settings *******/
const int green_led = 5;
const int red_led = 16;
const int dust_led = 4;

/****** WiFi Connection Details *******/
const char* ssid = "admin" ;
const char* password = "88888888";

/******* MQTT Broker Connection Details *******/
const char* mqtt_server = "0fe9830add1440c494c4c2fa2d0758af.s1.eu.hivemq.cloud";
const char* mqtt_username = "esp8266";
const char* mqtt_password = "G26m64EyzhyC!Kg";
const int mqtt_port = 8883;

/**** Secure WiFi Connectivity Initialisation *******/
WiFiClientSecure espClient;

/**** MQTT Client Initialisation Using WiFi Connection *****/
PubSubClient client(espClient);

unsigned long lastMsg = 0;
#define MSG_BUFFER_SIZE (50)
char msg[MSG_BUFFER_SIZE];

unsigned long previousMillis = 0;
const long interval = 200; // 1 giây

/****** root certificate ****/

static const char* root_ca PROGMEM = R"EOF(

--BEGIN CERTIFICATE----
MIIFzCCA10gAwIBAgIRAIIQz70SQONZRGPgU20CADQYJKoZIhvcNAQELBQAw 
TzELMAkGA1UEBhMCVVMxKTAnBgNVBAoTIEludGVybmV0IFNlY3VyaXR5IFJ1c2Vh 
cmNoIEdyb3VwMRUWEwYDVQQDExJU1JHIFJvb3QgWDEwHhcNMTUwNjABMTEwNDM4 
WhcNMzUwNjAOMTEWNDM4WjBPMQswCQYDVQQGEwJVUzEpMCCGA1UEChMgSW50ZXJu 
ZXQgU2VjdXJpdHkgUmVzZWFyY2ggR3JvdXAXFTATBgNVBAMTDE1TUKcgUm9vdCBY 
MTCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBAK30JHP8FDfzm54rVygc 
h77ct984kIxuPOZXOHj3dcKi/vVqbvYATyjb3miGbESTtrFj/RQSa78f0uoxmyF+ 
eTM8ukj13Xnfs7j/EvEhmkvBioZxaUpmZmyPfjxwv60p1gbz5MDmgK71S4+3mX6U 
A5/TR5d8mUgjU+g4rk8Kb4MueulxjIBettoveDiNewNwIRt18jA8+o+u3dpjq+sw 
T8KOEUt+zwvo/7V3LvSye@rgTBI1DHCNAуmg4VMK7BPZ7hm/ELNKjD+J02FR3qyH 
B5T0Y3HS LuJvW5iB4Y1cNH1sdu87kG355tukmi8mxdAQ4Q7e2RCOFvu396j3x+UC 
B51PNgiV5+131g02dZ77DnKxHZu8A/1JBdiB3QwektZB6awBdpUKD9jf1beSHZUv 
851PNgiV5+131g02dZ77DnKxHZu8A/1JBdi83QweKtZB6awBdpUKD9jf1b0SHZUV 
KBds@pjBqAlkd25HN7rOrFleaJ1/ctaJxQZBKT5ZPtem9STJEadao0xAH@ahmbwn 
01FuhjuefXKnEgV4We0+UXgVCWOPjdAvBbI+e@ocS3MFEvzG6uBQE3xDk3SzynTn 
jh8BCNAW1FtxNrQHus EwMFXIt417mKZ9YIqioymCzLq9gwQbooMDQaHWBFEbwrbw 
qHyGOBaoSCqIзHaadr8faqU9GY/rOPNk3sgrDQoo//fb4hVC1CLQ313hef4Y53CI 
rU7m2Ys6xt@nuW7/VGT1MONPAgMBAAGjQjBAMA4GA1UdDWEB/wQEAwIBBjAPBgNV 
HRMBAF8EBTADAQH/MB0GA1UdDgQWBBR5tFnme7b15AFZgAiIyBpY9umbbjANBgkq 
hkiG9w0BAQsFAAOCAgEAVR9YqbyyqFDQDLHYGmkgJykIrGF1XIpu+ILlaS/V91ZL 
ubhzEFnTIZd+50xx+7LSYK05qAvaFyFWhfFQD1nrzuBZ6brJFe+GnY+EgPbk6ZGQ 
3BebyhtF8GaVenxvwuo77x/Py9au3/GpsMiu/X1+mvoi80v/2x/qkSsisRcOj/KK 
NFtY2PWByVS5uCbMiogziUwthDy3+6Www6LLv3xLFHT juCvjHI InzktHCgkQ5 
ORAZI4JMP3+GS1WYHb4phowim57iaztX0oJwTdwJx4nLCgdNbOhdjsnvzqvHu7Ur 
TKXWStAmzOVyyghqpZXjFaH3p03JLF+1+/+sKAIuvtd7u+Nxe5AwewdeR1N8NwdC 
jNPE1pzVmbUq4JUagEiuTDkHzsxHpFKVK7q4+63SM1N95R1NbdWhscdCb+ZAJZVc 
oyi3B43njTOQ5yOf+1CceWxG1bQVs5ZufpsM1jq4Ui0/11vh+wjChP4kqk0J2qxq 
4RgqsahDYVvTH9w7jxby LeiNdd8XM2w9U/t7y0Ff/9yi@GE44Za4rF2LN9d11TPA 
// mRGunUHBcnWEvgJBQ19nJEiUeZsnvgc/ubhPgXRR4Xq37Z0j4r7g1SgEEZwXA57d 
emyPxgcYxn/eR44/KJ4EBS+1VDR3veyJm+kXQ99b21/+jh5Xos1AnX5iItreGCc= 
----END CERTIFICATE-----
)EOF";

/************* Connect to WiFi ***********/
void setup_wifi() {
  delay(10);
  Serial.print("\nConnecting to ");
  Serial.println(ssid);

  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  randomSeed(micros());
  Serial.println("\nWiFi connected\nIP address: ");
  Serial.println(WiFi.localIP());
}

void reconnect() {
  // Lặp cho đến khi kết nối thành công
  while (!client.connected()) {
    Serial.print("Đang kết nối đến MQTT..."); 
    String clientId = "ESP8266Client-"; // Tạo một Client ID ngẫu nhiên 
    clientId = String(random(0xffff), HEX); // Thử kết nối
    if (client.connect(clientId.c_str(), mqtt_username, mqtt_password)) {
      Serial.println("Đã kết nối");

      // Đăng ký các chủ đề bạn muốn theo dõi ở đây
      client.subscribe("led_state");

    } else {
      Serial.print("Kết nối thất bại, rc="); 
      Serial.print(client.state()); 
      Serial.println(" Thử lại sau 5 giây"); 
      delay(5000); // Chờ 5 giây trước khi thử lại
    }
  }
}

void callback(char* topic, byte* payload, unsigned int length) {
  String incomingMessage = "";

  for (int i = 0; i < length; i++) {
    incomingMessage += (char)payload[i];
  }

  Serial.println("Message arrived [" + String(topic) + "] " + incomingMessage);

  // Kiểm tra nội dung tin nhắn đến
  if (strcmp(topic, "led_state") == 0) {
    if (incomingMessage.equals("ON_GREEN")) {
      digitalWrite(green_led, HIGH); // Bật đèn LED
    } else if (incomingMessage.equals("OFF_GREEN")) {
      digitalWrite(green_led, LOW); // Tắt đèn LED
    }
    else if (incomingMessage.equals("ON_RED")) {
      digitalWrite(red_led, HIGH); // Bật đèn LED
    } else if (incomingMessage.equals("OFF_RED")) {
      digitalWrite(red_led, LOW); // Tắt đèn LED
    }
    else if (incomingMessage.equals("on_led_dust")) {
      unsigned long currentMillis = millis();
      if (currentMillis - previousMillis >= interval) {
        previousMillis = currentMillis;
        if (digitalRead(red_led) == HIGH) {
          digitalWrite(red_led, LOW);
        } else {
          digitalWrite(red_led, HIGH);
        }
      } else if (incomingMessage.equals("off_led_dust")) {
      digitalWrite(red_led, LOW); // Tắt đèn LED
    }
  }}
}

void publishMessage(const char* topic, String payload, boolean retained) {
  if (client.publish(topic, payload.c_str(), retained)) {
    Serial.println("Message published [" + String(topic) + "]: " + payload);
  }
}

void setup() {
  dht.setup(DHTpin, DHTesp::DHT11); // Cài đặt cảm biến DHT11
  pinMode(green_led, OUTPUT); 
  pinMode(red_led, OUTPUT); 
  Serial.begin(9600);
  
  while (!Serial) {
    delay(1);
  }
  
  setup_wifi();

  #ifdef ESP8266
  espClient.setInsecure();
  #else
  espClient.setCACert(root_ca);
  #endif

  // Kích hoạt dòng này và
  // Đặt máy chủ MQTT và cổng
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
}

void loop() {
  if (!client.connected()) {
    reconnect(); // Kiểm tra xem client đã kết nối chưa
  }
  
  client.loop();

  // Đọc nhiệt độ và độ ẩm từ DHT11
  delay(dht.getMinimumSamplingPeriod());
  float humidity = dht.getHumidity();
  float temperature = dht.getTemperature();
  float light = analogRead(A0);
  // int ledValue = digitalRead(19); // Đọc trạng thái của chân GPIO 19 (led xanh)

  // Tạo một đối tượng JsonArray để lưu trữ dữ liệu
  DynamicJsonDocument doc(1024);
  // JsonArray data = doc.to<JsonArray>();
  
  // JsonObject humidityObj = data.createNestedObject();
  // humidityObj["name"] = "Độ ẩm";
  // humidityObj["value"] = humidity;

  // JsonObject temperatureObj = data.createNestedObject();
  // temperatureObj["name"] = "Nhiệt độ";
  // temperatureObj["value"] = temperature;

  // JsonObject lightObj = data.createNestedObject();
  // lightObj["name"] = "Ánh sáng";
  // lightObj["value"] = light;

  JsonObject data = doc.to<JsonObject>();
  data["Độ ẩm"] = humidity;
  data["Nhiệt độ"] = temperature;
  data["Ánh sáng"] = light;

  float dust = random(0, 100); 
  data["Độ bụi"] = dust;

  // JsonObject ledObj = data.createNestedObject();
  // ledObj["name"] = "led xanh";
  // ledObj["value"] = ledValue;
  // ledObj["unit"] = NULL;
  // ledObj["gpio"] = 19;

  // Chuyển đổi thành chuỗi JSON và gửi lên MQTT
  char mqtt_message[128];
  // serializeJson(doc, mqtt_message);
  serializeJson(data, mqtt_message);
  publishMessage("esp8266_data", mqtt_message, true);

  delay(5000); // Chờ 5 giây trước khi lặp lại
}

