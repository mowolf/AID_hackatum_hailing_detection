const uuidv4 = require("uuid/v4");

module.exports = function(obj) {
    if (!obj.colorHist || !obj.pos) {
        return null;
    }

    return {
        id: uuidv4(),
        colorHist: obj.colorHist,
        pos: obj.pos,
        cabId: false
    };
};
