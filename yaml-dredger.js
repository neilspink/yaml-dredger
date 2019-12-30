'use strict';
/*
    Start by running:

        npm install

    You can run program using:

        node yaml-dredger.js <filename or path> [lists...]

    For example, process all files in the testdata directory. ['innings', 'deliveries'] are entity lists in the files.

        node yaml-dredger.js ./testdata innings deliveries

    Result:

    - Entities are marked with a star *
    - Attributes data type is provided in bracets (number), (string) or (date). You get (variant) if it's mixed.
    - The program counts the number of files in which an  entity or attribute appears

 */
const Entity = require('./entity.js');
const Attribute = require('./attribute.js');

const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');

let target = '';    //File or directory
let lists = [];     //YAML files can have lists of entities, these need to be identified

//target = './testdata';                //Directory example
//target = './testdata/211028.yaml';    //Single file

//lists = ['innings', 'deliveries'];     //See testdata for examples. Cricket matches can have multiples of those.

try {

    if (process.argv.length > 2) //Args are listed at top. You could also uncomment the target & list examples above.
    {
        target = process.argv[2];

        process.argv.forEach((val, index) => {
            if (index > 2) lists.push(val)
        });
    }

    if (fs.lstatSync(target).isDirectory()) {
        processDirectory(target);
    } else {
        processOneFile(target);
    }

} catch (e) {
    console.error(e);
}

function processOneFile(filename) {
    let fileContents = fs.readFileSync(filename, 'utf8');
    let data = yaml.safeLoad(fileContents);
    let content = analyse(data);
    show(content, '');
}

function processDirectory(path) {
    const files = fromDir(path, '.yaml');

    let merge = [];

    files.forEach(function (item) {
        let fileContents = fs.readFileSync(item, 'utf8');
        let data = yaml.safeLoad(fileContents);
        let content = analyse(data);
        merge.push(content);
    });

    let result = [];

    for (let [, file] of Object.entries(merge)) {
        for (let [, item] of Object.entries(file)) {

            let master = getByName(result, item.name);

            if (master === undefined) {
                result.push(item);
            } else {
                aggregateAttributes(item, master);
                aggregateRelations(item, master);
            }
        }
    }

    show(result, '');
}

function analyse(yamlData) {
    let result = [];

    for (let [key, data] of Object.entries(yamlData)) {

        if (isInList(key, lists)) { //special handling for lists
            let e = analyseList(key, data);
            result.push(e);
        } else if (typeof data === 'object') {
            let e = new Entity(key);
            e.attributes = getAttributes(data);
            e.relations = getRelationships(data);
            result.push(e);
        } else {
            let a = new Attribute(key, data);
            result.push(a);
        }
    }

    return result;
}

function analyseList(key, yamlData) {
    let merge = [];

    for (let [, item] of Object.entries(yamlData)) {
        let e = analyse(item)[0]; //the array should have only one slice
        merge.push(e);
    }

    let result = new Entity(key);

    let a = new Attribute('value', 'string');
    a.dataType = 'string'; //TODO: this could be derived

    result.attributes.push(a);

    for (let [, item] of Object.entries(merge)) {

        for (let [, att] of Object.entries(item.attributes)) {

            if (!containsAttribute(result.attributes, att.name)) {
                result.attributes.push(att);
            }
        }

        for (let [, rel] of Object.entries(item.relations)) {
            if (!containsAttribute(result.relations, rel.name)) {
                result.relations.push(rel);
            }
        }
    }

    return result;
}

function getRelationships(data) {

    let rel = [];

    for (let [key, item] of Object.entries(data)) {

        if (typeof item === 'object') {
            if (item instanceof Date) {
                //ignore
            } else if (isInList(key, lists)) {
                let e = analyseList(key, item);
                rel.push(e);
            } else if (Array.isArray(item)) {
                let e = getArrayEntity(key, item);
                rel.push(e);
            } else {
                let e = new Entity(key);
                e.attributes = getAttributes(item);
                e.relations = getRelationships(item);
                rel.push(e);
            }
        }
    }

    return rel;
}

function getAttributes(data) {

    let attrib = [];

    for (let [key, value] of Object.entries(data)) {

        if (typeof value != 'object') {
            let a = new Attribute(key, value);
            attrib.push(a);
        } else if (value instanceof Date) {
            let a = new Attribute(key, value);
            a.dataType = 'date';
            attrib.push(a);
        }
    }

    return attrib;
}

function getArrayEntity(key, value) {

    let t = undefined;

    value.forEach(function (item) {
        if (t === undefined) {
            t = typeof (item);
            if (item instanceof Date) {
                t = 'date';
            }
        } else {
            if (typeof (item) !== t) {
                t = 'variant';
            }
        }
    });

    let e = new Entity(key);

    let att = new Attribute('value', t);
    att.dataType = t; //fix typeof(t) in constructor making everything string

    e.attributes = [att];

    return e;
}

function show(data, indent) {

    for (let [, item] of Object.entries(data)) {

        switch (item.constructor.name) {
            case 'Entity':
                console.log(`${indent} ${item.name} * ${item.numberFiles}`);

                for (let [, att] of Object.entries(item.attributes)) {
                    console.log(`--${indent} ${att.name} (${att.dataType}) ${att.numberFiles}`);
                }
                show(item.relations, '--' + indent);

                break;

            case 'Attribute':
                console.log(`${indent} ${item.name} ${item.numberFiles}`);
                break;
        }

    }
}

function isInList(value, list) {
    let result = false;

    list.forEach(function (item) {
        if (value === item) {
            result = true;
        }
    });

    return result;
}

function containsAttribute(list, itsName) {
    let result = false;

    for (let [, b] of Object.entries(list)) {
        if (b.name === itsName) {
            return true;
        }
    }

    return result;
}

function getByName(list, itsName) {
    for (let [, b] of Object.entries(list)) {
        if (b.name === itsName) {
            return b;
        }
    }

    return undefined;
}

function fromDir(startPath, filter) {

    let result = [];

    if (!fs.existsSync(startPath)) {
        console.log("no dir ", startPath);
        return;
    }

    var files = fs.readdirSync(startPath);
    for (var i = 0; i < files.length; i++) {
        let filename = path.join(startPath, files[i]);
        let stat = fs.lstatSync(filename);
        if (stat.isDirectory()) {
            fromDir(filename, filter); //recurse
        } else if (filename.indexOf(filter) >= 0) {
            result.push(filename);
        }
    }

    return result;
}

function aggregateAttributes(item, master) {
    for (let [, att] of Object.entries(item.attributes)) {

        let masterAtt = getByName(master.attributes, att.name);

        if (masterAtt === undefined) {
            master.attributes.push(att);
        } else {
            masterAtt.numberFiles = masterAtt.numberFiles + att.numberFiles;
        }
    }
}

function aggregateRelations(item, master) {
    for (let [, rel] of Object.entries(item.relations)) {

        if (master === undefined) {
            console.log('wtf');
            return;
        }

        let masterEntity = getByName(master.relations, rel.name);

        if (masterEntity === undefined) {
            master.relations.push(rel);
        } else //deep clone
        {
            masterEntity.numberFiles = masterEntity.numberFiles + rel.numberFiles;
            aggregateAttributes(rel, masterEntity);
            aggregateRelations(rel, masterEntity);
        }
    }
}