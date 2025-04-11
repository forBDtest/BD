import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

import { initializeApp } from "firebase/app";
import {update, get, getDatabase, ref, set } from "firebase/database";

const app = express();
const port = 3000;
app.use(cors());
app.use(express.json());

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
            console.log('Data written successfully');
            return 1; // Return 1 if successful
        })
        .catch((error) => {
            console.error('Error writing data:', error);
            return 0; // Return 0 if an error occurs
        });
}

async function readData(path) {
    const dbRef = ref(db, path);
    try {
        const snapshot = await get(dbRef);
        if (snapshot.exists()) {
            console.log('Data read successfully:', snapshot.val());
            return snapshot.val(); // Return the data if it exists
        } else {
            console.log('No data available');
            return 0; // Return 0 if no data is available
        }
    } catch (error) {
        console.error('Error reading data:', error);
        return 0; // Return 0 if an error occurs
    }
}
//using not set but update
async function updateData(path, data) {
    const dbRef = ref(db, path);
    return update(dbRef, data)
        .then(() => {
            console.log('Data written successfully');
            return 1; // Return 1 if successful
        })
        .catch((error) => {
            console.error('Error writing data:', error);
            return 0; // Return 0 if an error occurs
        });
}

function processData(...fields) {
    return (req, res, next) => {
        for (const field of fields) {
            const value = req.body[field];

            if (!value) {
                return res.status(400).send(`Field "${field}" is required`);
            }

            req.body[field] = encodeURIComponent(value);
        }

        next();
    };
}


//--------------------------
app.post('/volonteer/register',processData('email', 'password', 'name', 'surname','address', 'phone'), async (req, res) => {
    console.log('Registering user...');
    let { email, password, name, surname, address, phone } = req.body;

    const userPath = `volonteer/${email}`;
    const existingUser = await readData(userPath);

    if (existingUser) {
        return res.status(400).send('Email already registered');
    }

    const result = await setData(userPath, {email, password, name, surname, address, phone});
    if (result) {
        res.status(200).send('User registered successfully');
    } else {
        res.status(500).send('Error registering user');
    }
});

app.post('/volonteer/post', processData('photo', 'specie', 'sex', 'age', 'colour', 'health', 'status', 'description'), async (req, res) => {
    console.log('Registering user...');
    let { photo, specie, sex, age, colour, health, status, description } = req.body;
    const id = await readData("vid");
     setData("vid", id+1);
    const userPath = `vpost/${id}`;

    const result = await setData(userPath, {photo, specie, sex, age, colour, health, status, description});
    if (result) {
        res.status(200).send('Pet registered successfully');
    } else {
        res.status(500).send('Error registering pet');
    }
});

app.post('/shelter/post', processData('photo', 'specie', 'sex', 'age', 'colour', 'health', 'status', 'description'), async (req, res) => {
    console.log('Registering user...');
    let { photo, specie, sex, age, colour, health, status, description } = req.body;
    const id = await readData("sid");
     setData("sid", id+1);
    const userPath = `spost/${id}`;

    const result = await setData(userPath, {photo, specie, sex, age, colour, health, status, description});
    if (result) {
        res.status(200).send('Pet registered successfully');
    } else {
        res.status(500).send('Error registering pet');
    }
});


//--------------------------




























//email registration using database email + password in format /user/ [email:{password:1234}]
app.post('/register', async (req, res) => {
    console.log('Registering user...');
    let { email, password, type, name, address } = req.body;
    if (!["veterinaty", "shelter","kennel"].includes(type)) return res.status(400).send('type must be veterinaty, shelter, kennel');
    email = btoa(encodeURI(email));
    password = btoa(encodeURI(password));
    name = btoa(encodeURI(name));
    type = btoa(encodeURI(type));
    address = btoa(encodeURI(address));
    // console.log('Email:', email);

    if (!email || !password || !name || !address) {
        return res.status(400).send('Email, name, type of shelter and password are required');
    }

    const userPath = `user/${email}`;
    const existingUser = await readData(userPath);

    if (existingUser) {
        return res.status(400).send('Email already registered');
    }

    const result = await setData(userPath, { password, type, name, address });
    if (result) {
        res.status(200).send('User registered successfully');
    } else {
        res.status(500).send('Error registering user');
    }
});

//read all database
app.get('/dev/read', async (req, res) => {
    const data = await readData('/');
    if (data) {
        res.status(200).send(data);
    } else {
        res.status(404).send('No data available');
    }
});

//login using database email + password in format /user/ [email:{password:1234}]
app.post('/login', async (req, res) => {
    console.log('Logging in user...');
    let { email, password } = req.body;
    email = btoa(encodeURI(email));
    password = btoa(encodeURI(password));
    console.log('Email:', email);

    if (!email || !password) {
        return res.status(400).send('Email and password are required');
    }

    const userPath = `user/${email}`;
    const userData = await readData(userPath);

    if (userData) {
        if (userData.password === password) {
            res.status(200).send('User logged in successfully');
        } else {
            res.status(400).send('Invalid password');
        }
    } else {
        res.status(400).send('Email not registered');
    }
});

//update password using database email + password in format /user/ [email:{password:1234}]
app.post('/update', async (req, res) => {
    console.log('Updating user...');
    let { email, password, newPassword } = req.body;
    email = btoa(encodeURI(email));
    password = btoa(encodeURI(password));
    newPassword = btoa(encodeURI(newPassword));
    console.log('Email:', email);

    if (!email || !password || !newPassword) {
        return res.status(400).send('Email, password, and new password are required');
    }

    const userPath = `user/${email}`;
    const userData = await readData(userPath);

    if (userData) {
        if (userData.password === password) {
            const result = await updateData(userPath, { password: newPassword });
            if (result) {
                res.status(200).send('User updated successfully');
            } else {
                res.status(500).send('Error updating user');
            }
        } else {
            res.status(400).send('Invalid password');
        }
    } else {
        res.status(400).send('Email not registered');
    }
});

//delete user using database email + password in format /user/ [email:{password:1234}]
app.post('/delete', async (req, res) => {
    console.log('Deleting user...');
    let { email, password } = req.body;
    email = btoa(encodeURI(email));
    password = btoa(encodeURI(password));
    console.log('Email:', email);

    if (!email || !password) {
        return res.status(400).send('Email and password are required');
    }

    const userPath = `user/${email}`;
    const userData = await readData(userPath);

    if (userData) {
        if (userData.password === password) {
            const result = await setData(userPath, null);
            if (result) {
                res.status(200).send('User deleted successfully');
            } else {
                res.status(500).send('Error deleting user');
            }
        } else {
            res.status(400).send('Invalid password');
        }
    } else {
        res.status(400).send('Email not registered');
    }
});

app.get('/dev/getuser/:email',async (req, res) => {
    const email = btoa(encodeURI(req.params.email));
    const userPath = `user/${email}`;
    let data = await readData(userPath);
    data = decodeValues(data);

    res.send(data);
});
















await updateData("user/us12", {84:5  });










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