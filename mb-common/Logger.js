const env = process.env.NODE_ENV || 'development';
const mysql_config = require(__dirname + '/mysql_config/mysql_log_config.json')[env];

const winston = require('winston');
const winston_mysql = require('winston-mysql');
const mysql = require('mysql2/promise');
const {combine, timestamp, printf} = winston.format;

class Logger{
	constructor(){
		const mysql_options = {
		    host: mysql_config.host,
		    user: mysql_config.username,
		    password: mysql_config.password,
		    database: mysql_config.database,
		    table: 'LogEntry'
		};

		const timestamp_format = {format: 'YYYY-MM-DD hh:mm:ss'};
		const log_config = {
			level: 'info',
			format: combine(
				timestamp(),
				printf((info) => `${info.timestamp} ${info.level} ${info.message}`)
			),
			transports: [
				// Console keeps real newlines
				new winston.transports.Console({
					format: combine(
						timestamp(timestamp_format),
						printf((info) => `${info.timestamp} ${info.level} ${info.message}`)
					)
				}),

				// MySQL transport escapes newlines/tabs
				new winston_mysql({
					...mysql_options,
					format: combine(
						timestamp(timestamp_format),
						printf((info) => {
							const safe_message = typeof info.message === "string"
								? info.message.replace(/\r?\n|\r/g, "\\n").replace(/\t/g, "\\t")
								: JSON.stringify(info.message);
							return `${info.timestamp} ${info.level} ${safe_message}`;
						})
					)
				}),

				// File transport shares the same escaping
				new winston.transports.File({
					filename: 'app.log',
					level: 'info',
					format: combine(
						timestamp(timestamp_format),
						printf((info) => {
							const safe_message = typeof info.message === "string"
								? info.message.replace(/\r?\n|\r/g, "\\n").replace(/\t/g, "\\t")
								: JSON.stringify(info.message);
							return `${info.timestamp} ${info.level} ${safe_message}`;
						})
					)
				})
			]
		};


		this.logger = winston.createLogger(log_config);

		this.config = log_config;
	}

	init_log_entry = (prefix, args)=>{
		var text = "";

		if(prefix){
			text += prefix;
		}

		for(var i=0; i < args.length; ++i){
			text += args[i];
		}
		return text;
	}

	sanitize_for_db = (str)=>{
		if(!str){
			return "";
		}

		// Flatten newlines and tabs into visible escape sequences
		return str.replace(/\r?\n|\r/g, "\\n").replace(/\t/g, "\\t");
	}

	debug = (prefix, ...args)=>{
		const text = this.init_log_entry(prefix, args);
		this.logger.debug(text);
	}

	info = (prefix, ...args)=>{
		const text = this.init_log_entry(prefix, args);
		this.logger.info(text);
	}

	warn = (prefix, ...args)=>{
		const text = this.init_log_entry(prefix, args);
		this.logger.warn(text);
	}

	error = (prefix, ...args)=>{
		const text = this.init_log_entry(prefix, args);
		this.logger.error(text);
	}

    format_time_ampm = (date)=>{
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12;
        minutes = minutes < 10 ? '0'+minutes : minutes;
        var strTime = hours + ':' + minutes + ' ' + ampm;
        return strTime;
    }

    get_date_suffix = (date)=>{
        if(date > 3 && date < 21){
            return "th";
        }

        switch(date % 10) {
            case 1:
                return "st";
            case 2:
                return "nd";
            case 3:
                return "rd";
            default:
                return "th";
        }        
    }
    
    format_date_time(date){
        const display_date = date.getMonth() + '/' + date.getMonth()+ '/' + date.getFullYear() + ' ' + this.format_time_ampm(date);
        return display_date;
    }

}

module.exports = new Logger();