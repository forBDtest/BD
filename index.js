import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

import { initializeApp } from "firebase/app";
import { update, get, getDatabase, ref, set, query, orderByChild, equalTo, endAt } from "firebase/database";
import cookieParser from 'cookie-parser';

const app = express();
const port = 3000;

const corsOptions = {
    origin: (origin, callback) => {
      callback(null, true);  // This allows all origins
    },
    credentials: true,  // Allow cookies and authentication tokens
  };
  
  app.use(cors(corsOptions));  
// app.use(cors());
  
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
            return 0;
        }
    } catch (error) {
        return 0;
    }
}

//for sessions
function generateToken(length = 32) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < length; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
}


//to encode path
function encodeData(input) {
    let data = input + '';
    return data.replace(/\./g, '%2E').replace(/#/g, '%23').replace(/\$/g, '%24').replace(/\[/g, '%5B').replace(/\]/g, '%5D');
}


//to send selected fields only
function formData(input, ...fields) {
    let output = {};
    for (const field of fields) {
        output[field] = input[field];
    }
    return output;
}



//to check if all fields are defined
function processData(...fields) {
    return (req, res, next) => {
        for (const field of fields) {
            const value = req.body[field];

            if (!value) {
                return res.status(400).send(`Field "${field}" is required`);
            }

            req.body[field] = value + '';
        }

        next();
    };
}



//login via token and define email and account type
async function checkLogin(req, res, next) {
    // const token = req.cookies.token;
    const token = req.headers['authorization'];
    if (!token) return res.status(401).send('Missing token');
    const tokenData = await readData('token/' + token);
    if (tokenData == 0) return res.status(401).send('Wrong token');
    req.email = tokenData.email;
    req.accountType = tokenData.accountType;
    next();
}

//--------------------------
app.post('/volonteer/register', processData('email', 'password', 'name', 'surname', 'address', 'phone'), async (req, res) => {
    console.log('Registering user...');
    let { email, password, name, surname, address, phone } = req.body;

    const userPath = `user/${encodeData(email)}`;
    const existingUser = await readData(userPath);

    if (existingUser) {
        return res.status(400).send('Email already registered');
    }

    const result = await setData(userPath, { password, name, surname, address, phone, accountType: "volonteer" });
    if (result) {
        res.status(200).send('User registered successfully');
    } else {
        res.status(500).send('Error registering user');
    }
});

app.post('/shelter/register', processData('email', 'password', 'name', 'address', 'phone', 'contact_name', 'contact_surname', 'contact_position', 'website', 'social_media'), async (req, res) => {
    let { email, password, name, address, phone, contact_name, contact_surname, contact_position, website, social_media } = req.body;

    const userPath = `user/${encodeData(email)}`;
    const existingUser = await readData(userPath);

    if (existingUser) {
        return res.status(400).send('Email already registered');
    }

    const result = await setData(userPath, { password, name, address, phone, contact_name, contact_surname, contact_position, website, social_media, accountType: "shelter" });
    if (result) {
        res.status(200).send('User registered successfully');
    } else {
        res.status(500).send('Error registering user');
    }
});



//login to get token
app.post('/login', processData('email', 'password'), async (req, res) => {
    let { email, password } = req.body;

    const userPath = `user/${encodeData(email)}`;
    const userData = await readData(userPath);

    if (!userData) {
        return res.status(400).send('Email not registered');
    }

    if (password != userData.password) return res.status(400).send('Wrong password');

    const newToken = generateToken();

    const result = await setData('token/' + newToken, { email, accountType: userData.accountType });
    if (result) {
        res.status(200).send({token:newToken});
    } else {
        res.status(500).send('Error registering user');
    }
});


//verify if token is still available
app.get('/verifyToken', checkLogin, async (req, res) => {
    res.status(200).send({ email: req.email, accountType: req.accountType });
});


//user profile data
app.get('/myInfo', checkLogin, async (req, res) => {
    const result = await readData('user/' + encodeData(req.email));
    if (result != 0) {
        let formedData;
        if (result.accountType == 'volonteer') {
            formedData = formData(result, 'name', 'surname', 'address', 'phone');
        } else {
            formedData = formData(result, 'name', 'surname', 'address', 'phone', 'contact_name', 'contact_surname', 'contact_position', 'website', 'social_media');
        }
        formedData.email = req.email;
        res.status(200).send(formedData);
    } else {
        res.status(404).send('Not found');
    }
});



//user profile data
app.get('/userInfo/:email', async (req, res) => {
    const result = await readData('user/' + encodeData(req.params.email));
    if (result != 0) {
        let formedData;
        if (result.accountType == 'volonteer') {
            formedData = formData(result, 'name', 'surname', 'address', 'phone');
        } else {
            formedData = formData(result, 'name', 'surname', 'address', 'phone', 'contact_name', 'contact_surname', 'contact_position', 'website', 'social_media');
        }
        formedData.email = req.email;
        res.status(200).send(formedData);
    } else {
        res.status(404).send('Not found');
    }
});



//create offer based on user account type
app.post('/myOffers', processData('photo', 'specie', 'sex', 'age', 'colour', 'health', 'status', 'description'), checkLogin, async (req, res) => {
    let { photo, specie, sex, age, colour, health, status, description } = req.body;
    if (isNaN(parseInt(age))) res.status(400).send('Age must be a number');
    const pathType = req.accountType == 'shelter' ? 's' : 'v';
    const id = await readData(pathType + "id");
    setData(pathType + "id", id + 1);
    const userPath = `${pathType}Post/${id}`;

    const result = await setData(userPath, { photo, specie, sex, age, colour, health, status, description, author: req.email });
    if (result) {
        res.status(200).send('Pet registered successfully');
    } else {
        res.status(500).send('Error registering pet');
    }
});

//get list of your own offers
app.get('/myOffers', checkLogin, async (req, res) => {
    const pathType = req.accountType == 'shelter' ? 's' : 'v';
    const userPath = `${pathType}Post`;
    const result = await readFilteredData(userPath, "author", req.email);
    if (result != 0) {
        res.status(200).send(result);
    } else {
        res.status(200).send({});
    }
});

//edit offer
app.post('/editOffer/:id', processData('photo', 'specie', 'sex', 'age', 'colour', 'health', 'status', 'description'), checkLogin, async (req, res) => {
    if (isNaN(parseInt(req.params.id))) return res.status(400).send('Is that ID?! HUH, i didnt know :o');
    let { photo, specie, sex, age, colour, health, status, description } = req.body;
    if (isNaN(parseInt(age))) res.status(400).send('Age must be a number');
    const pathType = req.accountType == 'shelter' ? 's' : 'v';
    const id = parseInt(req.params.id);
    const userPath = `${pathType}Post/${id}`;
    const check = await readData(userPath);
    if (!check) return res.status(400).send('No such pet');
    if (check.author != req.email) return res.status(403).send('Its not your offer');
    const result = await setData(userPath, { photo, specie, sex, age, colour, health, status, description, author: req.email });
    if (result) {
        res.status(200).send('Pet updated successfully');
    } else {
        res.status(500).send('Error updating pet');
    }
});


//delete your own offers by id
app.delete('/myOffers/:id', checkLogin, async (req, res) => {
    const pathType = req.accountType == 'shelter' ? 's' : 'v';
    if (isNaN(parseInt(req.params.id))) return res.status(400).send('Is that ID?! HUH, i didnt know :o');
    const userPath = `${pathType}Post/` + req.params.id;
    const result = await readData(userPath);
    if (result != 0) {
        if (result.author != req.email) return res.status(403).send('Delteting someones offfer is bad...');
        setData(userPath, null);
        res.status(200).send('Deleted');
    } else {
        res.status(404).send('Not found');
    }
});

//browse marketplace based on your accont type
app.get('/market', checkLogin, async (req, res) => {
    const pathType = req.accountType == 'shelter' ? 's' : 'v';
    const userPath = `${pathType}Post`;
    const result = await readData(userPath);
    if (result != 0) {
        res.status(200).send(result);
    } else {
        res.status(200).send({});
    }
});

//marketplace with filters
app.get('/market/filter', checkLogin, async (req, res) => {
    const pathType = req.accountType == 'shelter' ? 's' : 'v';
    const userPath = `${pathType}Post`;
    if (!req.query.key && !req.query.value) return res.status(400).send('Wrong query proveded');
    if (!["colour", "species", "age", "sex", "health", "status"].includes(req.query.key)) return res.status(400).send('filtering supported by colour, species, age, sex, health, status');
    const result = await readFilteredData(userPath, req.query.key, req.query.value);
    if (result != 0) {
        res.status(200).send(result);
    } else {
        res.status(404).send({});
    }
});




//add to favourited
app.post('/liked', processData('id'), checkLogin, async (req, res) => {
    setData('user/' + req.email + '/liked/' + req.body.id, true);
    res.status(200).send('Added');
});
//remove
app.delete('/liked', processData('id'), checkLogin, async (req, res) => {
    setData('user/' + req.email + '/liked/' + req.body.id, null);
    res.status(200).send('Deteted');
});



//show favourited offers
app.get('/liked', checkLogin, async (req, res) => {
    const ids = await readData('user/' + req.email + '/liked') || {};
    console.log(ids);
    const pathType = req.accountType == 'shelter' ? 's' : 'v';
    const checks = Object.keys(ids).map(async (id) => {
        const mainKeySnap = await readData(pathType + 'Post/' + id);
        return { id, value: mainKeySnap };
    });

    const results = await Promise.all(checks);
    const validItems = {};
    let response = {}, correct = 1;
    results.forEach(({ id, value }) => {
        if (!value) correct = 0;
        else {
            response[id] = value;
            validItems[id] = true;
        }
    });

    if (correct) {
        console.log('all are ok');
    } else {
        setData('user/'+req.email+'/liked/',validItems);
        console.log('Deleted keys');
    }
    res.status(200).send(response);
});





//---------------------------------------------









































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