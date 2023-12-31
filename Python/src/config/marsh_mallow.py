from .connect_db import ma


class user_schema(ma.Schema):
    class Meta:
        fields = ("id", "email", "first_name", "last_name", "address", "role_id")

class sensor_schema(ma.Schema):
    class Meta:
        fields = ("id", "time", "temperature", "humidity", "light", "dust")

class action_schema(ma.Schema):
    class Meta:
        fields = ("id", "time", "action", "port", "status", "device")
