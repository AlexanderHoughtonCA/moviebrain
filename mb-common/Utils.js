const c_Months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function date_from_year(year){
    return new Date(`${year}-01-01T00:00:00Z`);
}

function format_time_ampm(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
}

function get_date_suffix(date) {
    if(date > 3 && date < 21)
    {
        return "th";
    }

    switch(date % 10) 
    {
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

function format_date(date){
    const month = c_Months[date.getMonth()];
    const day = date.getDate();
    const display_date = day +  get_date_suffix(day) + " " + month + ", " + date.getFullYear();

    return display_date;
}

function format_date_time(date){
    const day = date.getDate();
    const display_date =  format_time_ampm(date) + ", " + day + format_date(date);

    return display_date;
}

module.exports = {
    c_Months,
    date_from_year,
    format_time_ampm,
    get_date_suffix,
    format_date,
    format_date_time
}