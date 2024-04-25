// This sets up a listener in the background
// When a message of type "comments" is received, it sends the comments to the backend
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "comments") {
        console.log("Sending comments to the backend");

        // Send a post request to the backend with the comments
        fetch('https://localhost:8000/extract', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({comments: message.data})
        })
            .then(response => response.json())
            .then(data => {
                // Store the recommendations in local storage
                // The extension popup will read from local storage and display the recommendations as links
                chrome.storage.local.set({searchRecommendations: data});
            })
            .catch(error => console.error('Error:', error));
    }
});

