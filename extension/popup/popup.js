
// When the popup is opened, check local storage for previous search recommendations and display them
// Displayed elements are links to YouTube search queries
document.addEventListener('DOMContentLoaded', function () {

    // Check local storage for previous search queries
    chrome.storage.local.get(['searchRecommendations'], function (result) {
        console.log('Displaying search recommendations', result.searchRecommendations);
        // If there are search recommendations, display them in the popup
        const linksContainer = document.getElementById('links');
        if (result.searchRecommendations && result.searchRecommendations.length > 0) {
            result.searchRecommendations.forEach(recommendation => {
                // List element
                const li = document.createElement('li');
                // Anchor element to open the search query in a new tab
                const a = document.createElement('a');
                a.href = `https://www.youtube.com/results?search_query=${encodeURIComponent(recommendation)}`;
                a.target = '_blank';
                a.textContent = recommendation;
                li.appendChild(a);
                linksContainer.appendChild(li);
            });
        } else {
            // Display a message if there are no results
            const li = document.createElement('li');
            li.textContent = 'No recommendations found';
            li.className = 'no-results';
            linksContainer.appendChild(li);
        }
    });
});
