
class Entity {
    constructor(key)
    {
        this.name = key;
        this.attributes = [];
        this.relations = [];
        this.numberFiles = 1;
    }
};

module.exports = Entity