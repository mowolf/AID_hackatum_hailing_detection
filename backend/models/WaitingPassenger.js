module.exports = function(obj) {
    if (!obj.colorHist || !obj.pos) {
        return null;
    }

    return {
        colorHist: obj.colorHist,
        pos: obj.pos,
        cabId: false
    };
};
