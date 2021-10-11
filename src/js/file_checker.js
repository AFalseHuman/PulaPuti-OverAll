const fs = require('fs');

module.exports = function (path) {
    try {
        return fs.statSync(path).isFile();
    }
    catch (e) {

        if (e.code == 'ENOENT') { // no such file or directory. File really does not exist
            return false;
        }

        console.log("Exception fs.statSync (" + path + "): " + e);
        throw e; // something else went wrong, we don't have rights, ...
    }
}