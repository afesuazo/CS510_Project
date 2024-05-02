// Card with video thumbnail and title
function createTopVideoCard(videoData) {
    console.log('Creating video card for', videoData);
    const clickable_card = document.createElement('a');
    clickable_card.href = videoData.url;
    clickable_card.target = '_blank';
    clickable_card.className = 'video-card';

    const title = document.createElement('h2');
    title.textContent = videoData.title;
    clickable_card.appendChild(title);

    const thumbnail = document.createElement('img');
    thumbnail.src = videoData.thumbnail;
    thumbnail.alt = videoData.title + ' thumbnail';
    thumbnail.style.width = '100%';
    clickable_card.appendChild(thumbnail);

    return clickable_card;
}


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

                const container = document.createElement('div');
                container.className = 'link-container';

                // List element
                const li = document.createElement('li');
                // Anchor element to open the search query in a new tab
                const a = document.createElement('a');
                a.href = `https://www.youtube.com/results?search_query=${encodeURIComponent(recommendation.keyword)}`;
                a.target = '_blank';
                a.textContent = recommendation.keyword;
                container.appendChild(a);

                const videoToggleButton = document.createElement('button');
                videoToggleButton.className = 'toggle-button';
                videoToggleButton.innerHTML = 'Top Video <img src="../images/eye.png" alt="Show Video">';
                container.appendChild(videoToggleButton);

                li.appendChild(container);
                linksContainer.appendChild(li);

                // Add the top video card to the list element
                const videoContainer = document.createElement('div');
                const videoCard = createTopVideoCard(recommendation);
                videoContainer.appendChild(videoCard);
                videoContainer.className = 'video-container hidden';
                li.appendChild(videoContainer);

                videoToggleButton.onclick = () => {
                    // Show the video card when the link is clicked
                    videoContainer.classList.toggle('hidden');
                }
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
