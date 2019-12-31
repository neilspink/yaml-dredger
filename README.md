# Analyse YAML document structure

This utility can analyse the data structure of a large set of YAML files. It will provide a list of the entities, their attributes and relation to other entities. 

Start by running:

    npm install

You can run program using:

    node yaml-dredger.js <filename or path> [lists...]

For example, process all files in the testdata directory. ['innings', 'deliveries'] are entity lists in the files.

    node yaml-dredger.js ./testdata innings deliveries

My test data is cricket match data from https://cricsheet.org/format/

```
meta:
  data_version: 0.9
  created: 2013-02-22
  revision: 1
info:
  city: Southampton
  dates:
    - 2005-06-13
  gender: male
  match_type: T20
  overs: 20
  teams:
    - England
    - Australia
  venue: The Rose Bowl
innings:
  - 1st innings:
      team: England
      deliveries:
        - 0.1:
            batsman: ME Trescothick
            bowler: B Lee
            non_striker: GO Jones
            runs:
              batsman: 0
              extras: 0
              total: 0
```

Run this program on your directory of data and get a read of the entities, attributes and their relations. An Entity is marked with a star *, you get the data type and number of occurrences.

```
/usr/bin/node /home/neil/WebstormProjects/cleandata/app.js
 meta * 
-- data_version (number) 3088
-- created (date) 3088
-- revision (number) 3088
 info * 
-- city (string) 2591
-- gender (string) 3088
-- match_type (string) 3088
-- venue (string) 3088
-- overs (number) 2656
-- neutral_venue (number) 716
-- match_type_number (number) 428
-- teams * 3088
---- value (string) 3088
```

