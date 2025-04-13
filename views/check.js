fetch('/verifyToken')
    .then(response => {
        if (response.status !== 200) {
            window.location.href = '/login.html';
        }
    });
