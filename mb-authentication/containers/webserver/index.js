require('module-alias/register');
require('dotenv').config();

const ErrorHandler = require('common/ErrorHandler.js');
const error_handler = new ErrorHandler();

const db = require('common/models');

const RequestValidator = require("common/RequestValidator");
const request_validator = new RequestValidator();

const express = require('express');
const bodyParser = require('body-parser');
const AuthenticationController = require('./src/controllers/AuthenticationController');

const PORT = process.env.PORT || 4771;
const SECRET = process.env.JWT_SECRET || 'supersecret';

const auth = new AuthenticationController(SECRET, {
    issuer: 'mb-authentication',
    expiresIn: '1h'
});

const app = express();
app.use(bodyParser.json());

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'mb-authentication' });
});

// Register new user
app.post('/register', 
         request_validator.validate_username_password, 
         async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ result: 'Missing username or password' });
    }

    try {
        const result = await auth.register_user(username, password);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Login -> issue JWT
app.post('/login', 
    request_validator.validate_username_password, 
    async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Missing username or password' });
    }

    try {
        const {token, error_code, error_msg} = await auth.login(username, password);
        if(token != null){
            res.json({ token });
        }
        else{
            res.status(error_code).send({message: error_msg});
        }
    } catch (error) {
        // console.log("error.message");
        console.log('/login - ERROR: ', error);
        res.status(401).json({ error: error.message });
    }
});

// Verify JWT
app.post('/verify', (req, res) => {
    const { token } = req.body;
    if (!token) {
        return res.status(400).json({ error: 'Missing token' });
    }

    const decoded = auth.verify_token(token);
    if (!decoded) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }

    res.json({ valid: true, decoded });
});

// Decode JWT (without verifying)
app.post('/decode', (req, res) => {
    const { token } = req.body;
    if(!token) {
        return res.status(400).json({ error: 'Missing token' });
    }

    const decoded = auth.decode_token(token);
    if(!decoded) {
        return res.status(400).json({ error: 'Failed to decode token' });
    }

    res.json({ decoded });
});

app.listen(PORT, () => {
    console.log(`mb-authentication listening on port ${PORT}`);
});
