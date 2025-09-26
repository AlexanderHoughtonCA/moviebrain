

const c_invalid_username_or_password = "Invalid username or password";
const c_invalid_search_param = "Invalid search parameter";


const {
    validate_username,
    validate_password,
    validate_search,
    validate_id
}  = require("./InputValidator");

class RequestValidator {
    
    validate_username_password = (req, res, next)=>{
        req.validated = false;
        if(req.body){
            const { username, password } = req.body;
            if(username && password){
                const username_result = validate_username(username);
                if(!username_result.valid) {
                    return this.send_bad_request("validate_username_password", 
                                                 c_invalid_username_or_password,
                                                res);
                }

                const password_result = validate_password(password);
                if(!password_result.valid) {
                    return this.send_bad_request("validate_username_password", 
                                c_invalid_username_or_password,
                            res);
                }

                req.validated = true;
                next();
                return;
            }
        }
        
        return this.send_bad_request("validate_username_password", 
                        c_invalid_username_or_password,
                        res);
    }

    validate_search = (req, res, next)=>{
        req.validated = false;
        if(req.body){
            const { search } = req.body;
            if(search){
                const result = validate_search(search);
                if(!result.valid) {
                    return this.send_bad_request("validate_search", 
                                                 c_invalid_search_param,
                                                res);
                }

                req.validated = true;
                next();
                return;
            }
        }
        
        return this.send_bad_request("validate_search", 
                                    c_invalid_search_param,
                                    res);
    }

    validate_id = (req, res, next)=>{
        req.validated = false;
        if(req.params){
            const { id } = req.params;
            if(id){
                const result = validate_id(id);
                if(!result.valid) {
                    return this.send_bad_request("validate_id", 
                                                 c_invalid_id_param,
                                                 res);
                }

                req.validated = true;
                next();
                return;
            }
        }

        return this.send_bad_request("validate_id", 
                                     c_invalid_id_param,
                                     res);
    }

    send_bad_request=(fn, error, res)=>{
        console.log("RequestValidator." + fn + " - failed: ", error);
        return res.status(400).json({ error });
    }
}

module.exports = RequestValidator;

