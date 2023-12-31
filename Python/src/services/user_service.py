from unicodedata import name
from flask import jsonify
from numpy import tile
from werkzeug.security import check_password_hash, generate_password_hash
from datetime import datetime
from sqlalchemy import func, select, distinct, desc
from sqlalchemy.orm import aliased



from ..config.connect_db import db
from ..config.marsh_mallow import user_schema, sensor_schema, action_schema
from ..models.model import ToDo, ToDoList, User, Sensor, Action

users_schema = user_schema(many=True)
sensor_schema = sensor_schema(many=True)
action_schema = action_schema(many=True)


def handle_user_login(email, password):
    try:
        user = User.query.filter_by(email=email).first()
        if user:
            if check_password_hash(user.password, password):
                return {"id": user.id, "role_id": user.role_id, "err_code": 0, "err_message": "Login success"}
            return {"err_code": 3, "err_message": "Wrong password"}
        return {"err_code": 2, "err_message": "User not found"}
    except IndentationError:
        return {"err_message": "Can not handle login!"}


def handle_user_sign_up(name, email, password, confirm_password):
    user = User.query.filter_by(email=email).first()
    if user:
        return {"err_code": 1, "err_message": "Your email is already in used, plz try another email!"}
    elif password != confirm_password:
        return {"err_code": 2, "err_message": "Password doesn not match! Try again!"}
    else:
        password = generate_password_hash(password, method="sha256")
        new_user = User(name, email, password)
        db.session.add(new_user)
        db.session.commit()
        return {"err_code": 0, "err_message": "Sign Up Success"}


def create_new_list(data, email):
    if data and ("name" in data):
        name = data["name"]
        if "description" in data:
            description = data["description"]
        else: description = None
        todo_list = ToDoList.query.filter_by(name=name).first()
        if todo_list:
            return {"err_code": 1, "err_message": "Your list's name is already in used, plz try another name!"}
        new_list = ToDoList(name, description, email)
        db.session.add(new_list)
        db.session.commit()
        return {
            "name": name,
            "email": email,
            "err_code": 0, 
            "err_message": "OK"
            }
    else:
        return {"err_code": 2, "err_message": "Missing required parameters!"}


def create_new_todo(data, email):
    if data and ("title" in data) and ("list_name" in data):
        list_name = data["list_name"]
        todo_list = ToDoList.query.filter_by(name=list_name).first()
        if not todo_list:
            return {"err_code": 3, "err_message": "todo list not found!"}
        title = data["title"]
        description = data["description"] if ("description" in data) else None
        due_date = data["due_date"] if ("due_date" in data) else None
        status = data["status"] if ("status" in data) else None
        todo = ToDo.query.filter_by(title=title).first()
        if todo:
            return {"err_code": 1, "err_message": "Your todo's title is already in used, plz try another title!"}
        new_todo = ToDo(title, description, due_date, status, email, list_name)
        db.session.add(new_todo)
        db.session.commit()
        return {
            "title": title,
            "list_name": list_name,
            "email": email,
            "err_code": 0, 
            "err_message": "OK"
        }
    else:
        return {"err_code": 2, "err_message": "Missing required parameters!"}

def create_sensor_data(data):
        time = datetime.now()
        temperature = data['Nhiệt độ']
        humidity = data['Độ ẩm']
        light = data['Ánh sáng']
        dust = data['Độ bụi'] if 'Độ bụi' in data else 0
        sensor_data = Sensor(time, temperature, humidity, light, dust)
        db.session.add(sensor_data)
        db.session.commit()
        return {
            "time": time,
            "data": data,
            "err_code": 0, 
            "err_message": "OK"
        }

def handle_create_action(data):
        time = datetime.now()
        action_name = data['action_name']
        status = data.get('status', None)
        device_name = data['device_name']
        action_history = Action(time, action_name, status, device_name)
        db.session.add(action_history)
        db.session.commit()
        return {
            "time": time,
            "data": data,
            "err_code": 0, 
            "err_message": "OK"
        }
    
def get_all_users(data):
    if data["role_id"] == "admin":
        users = User.query.all()
        return users_schema.dump(users)
    user = User.query.filter_by(id=data["id"]).all()
    return users_schema.dump(user)


def update_user_data(data, currentUser):
    try:
        if currentUser["role_id"] != "admin" and currentUser["id"] != data["id"]:
            return {
                "role_id": currentUser["role_id"],
                "current_id": currentUser["id"],
                "id": data["id"],
                "err_code": 2,
                "err_message": "not allowed to edit other user",
            }
        user = User.query.filter_by(id=data["id"]).first()
        if user:
            user.first_name = data["first_name"]
            user.last_name = data["last_name"]
            user.address = data["address"]
            db.session.commit()
            return {"err_code": 0, "err_message": "Update succeeds"}
        return {"err_code": 1, "err_message": "User is not found!"}
    except IndentationError:
        db.session.rollback()
        return {"err_message": "Can not edit user!"}


def delete_user(id, currentUser):
    try:
        if currentUser["role_id"] != "admin" and currentUser["id"] != id:
            return {
                "role_id": currentUser["role_id"],
                "currentId": currentUser["id"],
                "id": id,
                "err_code": 2,
                "err_message": "not allowed to delete other user",
            }
        user = User.query.filter_by(id=id).first()
        if user:
            db.session.delete(user)
            db.session.commit()
            return {"err_code": 0, "err_message": "The user is deleted"}
        return {"err_code": 2, "err_message": "The user is not exist"}
    except IndentationError:
        db.session.rollback()
        return {"err_message": "Can not delete user!"}


def get_all_sensor():
    sensor = Sensor.query.all()
    return sensor_schema.dump(sensor)

def get_all_action():
    action = Action.query.all()
    return action_schema.dump(action)

def get_earliest_limit():
    # Tạo một alias cho bảng Action để sử dụng trong truy vấn con
    action_alias = aliased(Action)
    
    # Truy vấn con: Lấy ra các thiết bị ('Ánh sáng', 'Nhiệt độ', 'Độ ẩm') và ID lớn nhất tương ứng
    subquery = (
        select(Action.device, func.max(Action.id).label('max_id'))
        .where(Action.action == 'change limit')
        .where(Action.device.in_(['Ánh sáng', 'Nhiệt độ', 'Độ ẩm', 'Độ bụi']))
        .group_by(Action.device)
        .subquery()
    )
    
    # Truy vấn chính: Kết hợp bảng Action với kết quả của truy vấn con bằng cách sử dụng JOIN
    query = (
        select(Action.device,
               subquery.c.max_id,
               Action.status)
        .join(subquery, Action.id == subquery.c.max_id)
    )
    
    # Thực hiện truy vấn và trả về kết quả dưới dạng danh sách các tuple
    result = db.session.execute(query).fetchall()
    
    # Trích xuất kết quả và định dạng thành dict
    # Khởi tạo một từ điển rỗng để lưu trữ kết quả định dạng
    formatted_result = {}

    # Duyệt qua các dòng kết quả và xây dựng từ điển cuối cùng
    for row in result:
        formatted_result[row[0]] = row.status  # Sử dụng index để truy cập cột

    # Trả về kết quả định dạng
    return formatted_result

    # SELECT a.device, a.id AS max_id, a.status
    # FROM action a
    # INNER JOIN (
    #     SELECT device, MAX(id) AS max_id
    #     FROM action
    #     WHERE action = 'change limit'
    #     AND device IN ('Ánh sáng', 'Nhiệt độ', 'Độ ẩm', 'Độ bụi')
    #     GROUP BY device
    # ) b ON a.id = b.max_id;
