const express = require('express');
const cors = require('cors');
const app = express();


// app.use(express.static(path.join(__dirname, `../${FILES_FOLDER.public}`)));

app.use(cors());
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


module.exports = app;
