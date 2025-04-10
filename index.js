import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

import { initializeApp } from "firebase/app";
import { get, getDatabase, ref, set } from "firebase/database";

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




//email registration using database email + password in format /user/ [email:{password:1234}]
app.post('/register', (req, res) => {
    console.log('Registering user...');
    let { email, password } = req.body;
    email = btoa(encodeURI(email));
    password = btoa(encodeURI(password));
    console.log('Email:', email);

    if (!email || !password) {
        return res.status(400).send('Email and password are required');
    }
    // Check if email is already registered
    const checkRegistered = ref(db, 'user/' + email);
    get(checkRegistered)
        .then((snapshot) => {
            if (snapshot.exists()) {
                return res.status(400).send('Email already registered');
            } else {
                // Register the user
                const userRef = ref(db, 'user/' + email);
                set(userRef, {
                    password: password
                })
                    .then(() => {
                        res.status(200).send('User registered successfully');
                    })
    .catch((error) => {
        res.status(500).send('Error registering user: ' + error);
    });
        }
    })
    .catch((error) => {
        res.status(500).send('Error checking registration: ' + error);
    });
});



//read all databse
app.get('/dev/read', (req, res) => {
    const dbRef = ref(db);
    get(dbRef)
        .then((snapshot) => {
            if (snapshot.exists()) {
                res.status(200).send(snapshot.val());
            } else {
                res.status(404).send('No data available');
            }
        })
        .catch((error) => {
            res.status(500).send('Error reading data: ' + error);
        });
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
