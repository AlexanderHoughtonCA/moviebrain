const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const db = require('common/models');

const DB_UserController = require('common/controllers/db-controllers/DB_UserController');
const user_controller = new DB_UserController(db);

class AuthenticationController {
    constructor(secret, options = {}) {
        this.secret = secret;
        this.issuer = options.issuer || 'mb-authentication';
        this.expiresIn = options.expiresIn || '1h';
        this.users = new Map(); // simple in-memory store: { username -> hashedPassword }
    }

    async register_user(username, password) {
        if (!username || !password) {
            console.log("username_and_password_required");
            return {result: "username_and_password_required"};
        }

        console.log("register_user - this.users: ", this.users);

        const user = await user_controller.get_model_where({username});
        if(user == null){
            // TODO: Update to store user in a DB....
            const password_hash = await bcrypt.hash(password, 10);
            // this.users.set(username, hashed);

            const user_data = {
                username, 
                password_hash
            }

            await user_controller.create_model(user_data);

            console.log("Registered " + username + " with: " + password_hash);
            return {result: "registered"};
        }
        else{
            console.log(user);
        }
            
        console.log("register_user - user already registered!");
        return {result: "user_already_registered"};
    }

    async login(username, password) {
        const user = await user_controller.get_model_where({username});
        if(!user){
            return {token: null, error_code: 401, error_msg: "User not found"};
        }

        const match = await bcrypt.compare(password, user.password_hash);
        if(!match) {
            return {token: null, error_code: 401, error_msg: "Invalid password"};
        }

        console.log("user.password_hash: ", user.password_hash);
        console.log("match: ", match);

        const token = jwt.sign(
            { username },
            this.secret,
            {
                issuer: this.issuer,
                expiresIn: this.expiresIn
            }
        );
        return {token};
    }

    verify_token(token) {
        try {
            return jwt.verify(token, this.secret, { issuer: this.issuer });
        } catch (error) {
            console.error('AuthenticationController.verify_token - ERROR:', error.message);
            return null;
        }
    }

    decode_token(token) {
        try {
            return jwt.decode(token, { complete: true });
        } catch (error) {
            console.error('AuthenticationController.decode_token - ERROR:', error.message);
            return null;
        }
    }
}

module.exports = AuthenticationController;
