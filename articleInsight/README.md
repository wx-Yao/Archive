# Article Insight

Essentially, this web application is a wikipedia article revision analyzer. It accepts multiple JSON files as input. Each JSON is named after a specific book in wikipedia, and the content in it is the revisions made to that book from the very beginning with the structure defined in [Wiki API](https://www.mediawiki.org/wiki/API:Main_page). Then it processese these data and produces interesting analytical result. In one word, this app processes data from some JSON files, stores in database and display the analysis result to the browser. It was an university assignment in 03/2019.

# Disclaimer

This is a group assignment. I basically wrote the whole backend (i.e., everything except those in the `public` directory) and partial front-end (i.e., part of code in `public` directory). Part of code in the `public` directory were the work of my teammates. My sincere "thank you" to them. Their details are the following.

# Member Details

|Name|Uni email|
|:-:|:-:|
Wayne Yao      | wyao0284@uni.sydney.edu.au
Tianming Chen  | tche4409@uni.sydney.edu.au
Chen Cui       | ccui8093@uni.sydney.edu.au

# File Structure

- **app.js**: Entry of the application

- **datapath.json**: describe data path where the "roles" data stores.

- **dbcredential.json**.bak: Originally this was where the server knew the location of the database. Since it's public now, you can put your credential in it.

- **router/**: responsible for the routing control

- **public/**: the application frontend in jQuery

- **helper/**: miscellaneous functions are falling into this category

- **services/**: So-called "controller" in MVC. Modules in this direcotry interact with the model in **db/**

- **db/**: So-called "model" in MVC. It doesn't interact with anyone except for the database

- **sampledata/**: 

# API

See the repo wiki
