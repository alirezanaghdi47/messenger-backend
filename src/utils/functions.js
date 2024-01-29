// libraries
const fs = require("fs");
const ObjectId = require('mongoose').Types.ObjectId;

const isValidObjectId = (id) => {

    if (ObjectId.isValid(id)) {
        if ((String)(new ObjectId(id)) === id)
            return true;
        return false;
    }
    return false;
}

const saveFile = async (path , data) => {
    await fs.writeFileSync(path, data, err => {
        if (err) return console.log(err);
        console.log("file saved");
    });
}

const removeFile = async (path) => {
    await fs.unlinkSync(path, function (err) {
        if (err) return console.log(err);
        console.log('file deleted');
    })
}

const getFileExtension = (name) => name.split('.').pop();

const getFileName = (name) => name.replace(/\.[^/.]+$/, "");

const delay = (ms) => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

module.exports = {
    isValidObjectId,
    saveFile,
    removeFile,
    getFileExtension,
    getFileName,
    delay,
}
