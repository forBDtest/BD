(function() {
    // Create the fullscreen dark background overlay
    const overlay = document.createElement('div');
    overlay.id = 'overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    overlay.style.display = 'none';  // Initially hidden
    overlay.style.zIndex = '999';
    document.body.appendChild(overlay);

    // Create and style the modal for alerts
    const alertModal = document.createElement('div');
    alertModal.id = 'customAlert';
    alertModal.style.position = 'fixed';
    alertModal.style.bottom = '-100%';  // Start from bottom
    alertModal.style.left = '50%';
    alertModal.style.transform = 'translateX(-50%)';
    alertModal.style.width = '80%';
    alertModal.style.maxWidth = '400px';
    alertModal.style.backgroundColor = '#ffffff';
    alertModal.style.padding = '20px';
    alertModal.style.borderRadius = '10px';
    alertModal.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.1)';
    alertModal.style.textAlign = 'center';
    alertModal.style.transition = 'bottom 0.3s ease-out';
    alertModal.style.zIndex = '1000';

    const alertMessage = document.createElement('p');
    alertMessage.id = 'alertMessage';
    alertMessage.style.fontSize = '16px';
    alertMessage.style.color = '#333';
    alertMessage.style.marginBottom = '20px';

    const alertButton = document.createElement('button');
    alertButton.id = 'alertButton';
    alertButton.textContent = 'OK';
    alertButton.style.backgroundColor = '#6c63ff';
    alertButton.style.color = 'white';
    alertButton.style.padding = '10px 20px';
    alertButton.style.fontSize = '16px';
    alertButton.style.fontWeight = 'bold';
    alertButton.style.border = 'none';
    alertButton.style.borderRadius = '6px';
    alertButton.style.cursor = 'pointer';
    alertButton.style.transition = 'background-color 0.3s ease, transform 0.2s ease';

    alertButton.addEventListener('click', closeAlert);

    alertModal.appendChild(alertMessage);
    alertModal.appendChild(alertButton);
    document.body.appendChild(alertModal);

    // Create and style the modal for confirmations
    const confirmModal = document.createElement('div');
    confirmModal.id = 'customConfirm';
    confirmModal.style.position = 'fixed';
    confirmModal.style.bottom = '-100%';  // Start from bottom
    confirmModal.style.left = '50%';
    confirmModal.style.transform = 'translateX(-50%)';
    confirmModal.style.width = '80%';
    confirmModal.style.maxWidth = '400px';
    confirmModal.style.backgroundColor = '#ffffff';
    confirmModal.style.padding = '20px';
    confirmModal.style.borderRadius = '10px';
    confirmModal.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.1)';
    confirmModal.style.textAlign = 'center';
    confirmModal.style.transition = 'bottom 0.3s ease-out';
    confirmModal.style.zIndex = '1001';

    const confirmMessage = document.createElement('p');
    confirmMessage.id = 'confirmMessage';
    confirmMessage.style.fontSize = '16px';
    confirmMessage.style.color = '#333';
    confirmMessage.style.marginBottom = '20px';

    const confirmButtons = document.createElement('div');
    confirmButtons.style.display = 'flex';
    confirmButtons.style.justifyContent = 'space-around';

    const confirmAcceptButton = document.createElement('button');
    confirmAcceptButton.id = 'confirmAccept';
    confirmAcceptButton.textContent = 'Yes';
    confirmAcceptButton.style.backgroundColor = '#6c63ff';
    confirmAcceptButton.style.color = 'white';
    confirmAcceptButton.style.padding = '10px 20px';
    confirmAcceptButton.style.fontSize = '16px';
    confirmAcceptButton.style.fontWeight = 'bold';
    confirmAcceptButton.style.border = 'none';
    confirmAcceptButton.style.borderRadius = '6px';
    confirmAcceptButton.style.cursor = 'pointer';
    confirmAcceptButton.style.transition = 'background-color 0.3s ease, transform 0.2s ease';

    const confirmDeclineButton = document.createElement('button');
    confirmDeclineButton.id = 'confirmDecline';
    confirmDeclineButton.textContent = 'No';
    confirmDeclineButton.style.backgroundColor = '#6c63ff';
    confirmDeclineButton.style.color = 'white';
    confirmDeclineButton.style.padding = '10px 20px';
    confirmDeclineButton.style.fontSize = '16px';
    confirmDeclineButton.style.fontWeight = 'bold';
    confirmDeclineButton.style.border = 'none';
    confirmDeclineButton.style.borderRadius = '6px';
    confirmDeclineButton.style.cursor = 'pointer';
    confirmDeclineButton.style.transition = 'background-color 0.3s ease, transform 0.2s ease';

    confirmAcceptButton.addEventListener('click', function() { confirmAction(true); });
    confirmDeclineButton.addEventListener('click', function() { confirmAction(false); });

    confirmButtons.appendChild(confirmAcceptButton);
    confirmButtons.appendChild(confirmDeclineButton);
    confirmModal.appendChild(confirmMessage);
    confirmModal.appendChild(confirmButtons);
    document.body.appendChild(confirmModal);

    // Global variables for callback functions
    let confirmAcceptCallback = null;
    let confirmDeclineCallback = null;

    // Function to show a custom alert
    window.showAlert = function(message) {
        alertMessage.textContent = message;
        overlay.style.display = 'block';  // Show the overlay
        alertModal.style.display = 'flex';  // Show the alert modal
        setTimeout(function() {
            alertModal.style.bottom = '20px';  // Slide up from the bottom
        }, 10); // Delay to allow animation
    };

    // Function to close the alert
    function closeAlert() {
        alertModal.style.bottom = '-100%';  // Slide down to the bottom
        setTimeout(function() {
            overlay.style.display = 'none';  // Hide the overlay
            alertModal.style.display = 'none';  // Hide the alert modal
        }, 300); // Wait for animation to finish
    }

    // Function to show a custom confirmation dialog
    window.showConfirm = function(message, onAccept, onDecline) {
        confirmMessage.textContent = message;

        // Store the callback functions
        confirmAcceptCallback = onAccept;
        confirmDeclineCallback = onDecline;

        // Show the overlay
        overlay.style.display = 'block';
        confirmModal.style.display = 'flex';

        // Animate modal from bottom
        setTimeout(function() {
            confirmModal.style.bottom = '20px';
        }, 10); // Delay to allow animation
    };

    // Function to handle acceptance or rejection of the confirmation
    function confirmAction(accepted) {
        if (accepted && confirmAcceptCallback) {
            confirmAcceptCallback();  // Execute the accept callback
        } else if (!accepted && confirmDeclineCallback) {
            confirmDeclineCallback();  // Execute the decline callback
        }

        // Hide the confirmation modal after the action
        confirmModal.style.bottom = '-100%';  // Slide down to the bottom
        setTimeout(function() {
            overlay.style.display = 'none';  // Hide the overlay
            confirmModal.style.display = 'none';  // Hide the confirmation modal
        }, 300); // Wait for animation to finish
    }
})();
