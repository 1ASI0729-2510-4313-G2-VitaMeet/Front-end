.register-container {
    max-width: 400px;
    margin: 40px auto;
    padding: 30px;
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 0 15px rgba(0,0,0,0.1);
    text-align: center;
}

input {
    display: block;
    width: 100%;
    margin: 12px 0;
    padding: 12px;
    font-size: 16px;
    border-radius: 6px;
    border: 1px solid #ccc;
}

button[type="submit"] {
    width: 100%;
    padding: 12px;
    background-color: #0077cc;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    margin-top: 12px;
    font-size: 16px;
}

.role-buttons {
    display: flex;
    justify-content: space-between;
    margin: 12px 0;
}

.role-buttons button {
    flex: 1;
    margin: 0 5px;
    padding: 10px;
    border: none;
    border-radius: 6px;
    background-color: #e0f0ef;
    color: #333;
    font-weight: bold;
    cursor: pointer;
}

.role-buttons .active {
    background-color: #0077cc;
    color: white;
}
