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
  player_of_match:
    - KP Pietersen
  teams:
    - England
    - Australia
  umpires:
    - NJ Llong
    - JW Lloyds
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
        - 0.2:
            batsman: ME Trescothick
            bowler: B Lee
            non_striker: GO Jones
            runs:
              batsman: 1
              extras: 0
              total: 1
        ...
```

Run this program on your directory of data and get a read of the entities, attributes and their relations. An Entity is marked with a star *, you get the data type and number of occurrences.

```
/usr/bin/node /home/neil/WebstormProjects/cleandata/app.js
 meta * 1
-- data_version (number) 3088
-- created (date) 3088
-- revision (number) 3088
 info * 1
-- city (string) 2591
-- dates * 3088
---- value (variant) 3088
-- gender (string) 3088
-- match_type (string) 3088
-- overs (number) 2656
-- player_of_match * 2849
---- value (string) 2849
-- teams * 3088
---- value (string) 3088
-- umpires * 3083
---- value (string) 3083
-- venue (string) 3088
 innings * 1
-- value (string) 3088
-- team (string) 3088
-- deliveries * 3088
---- value (string) 3088
---- batsman (string) 3088
---- bowler (string) 3088
---- non_striker (string) 3088
---- runs * 3088
------ batsman (number) 3088
------ extras (number) 3088
------ total (number) 3088
...
```

