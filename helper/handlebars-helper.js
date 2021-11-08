const moment = require("moment");

module.exports = {
    select: function (selected, option) {
        return option
            .fn(this)
            .replace(
                new RegExp(' value="' + selected + '"'),
                '$&selected="selected"'
            );
    },
    generateTime: function (date, format) {
        return moment(date).format(format);
    },
    paginate: function (option) {
        let output = "";

        if (option.hash.current === 1) {
            output = `<li class="page-item disabled"><a class="page-link">First</a></li>`;
        } else {
            output = `<li class="page-item"><a href="?page=1" class="page-link">First</a></li>`;
        }
        return output;
    },
};
