

class Attribute {
    constructor(name, value) {
        this.name = name;
        this.dataType = typeof(value);
        this.numberFiles = 1;
        this.dataTypeDeviance = [];
    }
};

module.exports = Attribute