import json

def test_register_user_placeholder(client):
    response = client.post('/users/register', json={})
    assert response.status_code == 201
    assert response.json['message'] == "User registration placeholder"

def test_login_user_placeholder(client):
    response = client.post('/users/login', json={})
    assert response.status_code == 200
    assert response.json['message'] == "User login placeholder"
