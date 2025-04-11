import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

import { initializeApp } from "firebase/app";
import {update, get, getDatabase, ref, set, query, orderByChild, equalTo} from "firebase/database";
import cookieParser from 'cookie-parser';

const app = express();
const port = 3000;
app.use(cors());
app.use(express.json());
app.use(cookieParser());
// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAqOFLpnmag9OFMG7yZ6H-NEHJIgEMZfUw",
    authDomain: "forbdtest.firebaseapp.com",
    databaseURL: "https://forbdtest-default-rtdb.firebaseio.com",
    projectId: "forbdtest",
    storageBucket: "forbdtest.firebasestorage.app",
    messagingSenderId: "55955102433",
    appId: "1:55955102433:web:2246045c97325ac1fff5a0"
};

// Initialize Firebase
const fireapp = initializeApp(firebaseConfig);
const db = getDatabase(fireapp);

//main functions to read and write to database by path
async function setData(path, data) {
    const dbRef = ref(db, path);
    return set(dbRef, data)
        .then(() => {
            return 1; // Return 1 if successful
        })
        .catch((error) => {
            return 0; // Return 0 if an error occurs
        });
}

async function readData(path) {
    const dbRef = ref(db, path);
    try {
        const snapshot = await get(dbRef);
        if (snapshot.exists()) {
            return snapshot.val(); // Return the data if it exists
        } else {
            console.log('No data available');
            return 0; // Return 0 if no data is available
        }
    } catch (error) {
        return 0; // Return 0 if an error occurs
    }
}
//using not set but update
async function updateData(path, data) {
    const dbRef = ref(db, path);
    return update(dbRef, data)
        .then(() => {
            return 1; // Return 1 if successful
        })
        .catch((error) => {
            return 0; // Return 0 if an error occurs
        });
}

async function readFilteredData(path, item, value) {
    const dbRef = ref(db, path);
    try {
        const filterQuery = query(dbRef, orderByChild(item), equalTo(value));
        const snapshot = await get(filterQuery);
        if (snapshot.exists()) {
            return snapshot.val();
        } else {
            console.log('No data available');
            return 0;
        }
    } catch (error) {
        return 0;
    }
}


function generateToken(length = 32) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < length; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
}

function encodeData(input) {
        return input.replace(/\./g, '%2E').replace(/#/g, '%23').replace(/\$/g, '%24').replace(/\[/g, '%5B').replace(/\]/g, '%5D');    
}

function processData(...fields) {
    return (req, res, next) => {
        for (const field of fields) {
            const value = req.body[field];

            if (!value) {
                return res.status(400).send(`Field "${field}" is required`);
            }

            req.body[field] = encodeData(value);
        }

        next();
    };
}


async function checkLogin (req,res,next) {
    const token = req.cookies.token;
    if (!token) return res.status(401).send('Missing token');
    const tokenData = await readData('token/'+ token);
    if (tokenData == 0) return res.status(401).send('Wrong token');
    req.email = tokenData.email;
    req.accountType = tokenData.type;
    next();
}

//--------------------------
app.post('/volonteer/register',processData('email', 'password', 'name', 'surname','address', 'phone'), async (req, res) => {
    console.log('Registering user...');
    let { email, password, name, surname, address, phone } = req.body;

    const userPath = `user/${email}`;
    const existingUser = await readData(userPath);

    if (existingUser) {
        return res.status(400).send('Email already registered');
    }

    const result = await setData(userPath, {email, password, name, surname, address, phone, type: "volonteer"});
    if (result) {
        res.status(200).send('User registered successfully');
    } else {
        res.status(500).send('Error registering user');
    }
});

app.post('/shelter/register',processData('email', 'password', 'name', 'surname', 'address', 'phone', 'owner_name', 'owner_surname', 'owner_position', 'website', 'social_media'), async (req, res) => {
    let { email, password, name, surname, address, phone, owner_name, owner_surname, owner_position, website, social_media } = req.body;

    const userPath = `user/${email}`;
    const existingUser = await readData(userPath);

    if (existingUser) {
        return res.status(400).send('Email already registered');
    }

    const result = await setData(userPath, {email, password, name, surname, address, phone, owner_name, owner_surname, owner_position, website, social_media, type: "shelter"});
    if (result) {
        res.status(200).send('User registered successfully');
    } else {
        res.status(500).send('Error registering user');
    }
});


app.post('/login',processData('email', 'password'), async (req, res) => {
    let { email, password} = req.body;

    const userPath = `user/${email}`;
    const userData = await readData(userPath);

    if (!userData) {
        return res.status(400).send('Email not registered');
    }

    if(password != userData.password) return res.status(400).send('Wrong password');

    const newToken = generateToken();

    const result = await setData('token/'+newToken, {email, type: userData.type});
    if (result) {
        res.status(200).send(newToken);
    } else {
        res.status(500).send('Error registering user');
    }
});


app.post('/post', processData('photo', 'specie', 'sex', 'age', 'colour', 'health', 'status', 'description'), checkLogin, async (req, res) => {
    let { photo, specie, sex, age, colour, health, status, description } = req.body;
    age = parseInt(age);
    if (isNaN(age))  res.status(400).send('Age must be a number');
    const pathType = req.accountType == 'shelter' ? 's' : 'v';
    const id = await readData(pathType+"id");
    setData(pathType+"id", id+1);
    const userPath = `${pathType}Post/${id}`; 

    const result = await setData(userPath, {photo, specie, sex, age, colour, health, status, description, author: req.email});
    if (result) {
        res.status(200).send('Pet registered successfully');
    } else {
        res.status(500).send('Error registering pet');
    }
});


app.get('/myOffers', checkLogin, async (req, res) => {
    const pathType = req.accountType == 'shelter' ? 's' : 'v';
    const userPath = `${pathType}Post`; 

    const result = await readFilteredData('user','name','te');
    if (result) {
        res.status(200).send(result);
    } else {
        res.status(500).send('Error');
    }
});




//--------------------------





























//read all database
app.get('/dev/read', async (req, res) => {
    const data = await readData('/');
    if (data) {
        res.status(200).send(data);
    } else {
        res.status(404).send('No data available');
    }
});


















app.get('/', (req, res) => {
    res.send('Hello, World!');
});

// This is a workaround to keep the server alive
setInterval(() => {
    fetch('https://bd-h8ye.onrender.com/');
}, 1000);

app.listen(port, () => {
    console.log(`App is running at http://localhost:${port}`);
});