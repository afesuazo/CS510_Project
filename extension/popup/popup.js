// Card with video thumbnail and title
function createTopVideoCard(videoData) {
    console.log('Creating video card for', videoData);
    const clickableCard = document.createElement('a');
    clickableCard.href = videoData.url;
    clickableCard.target = '_blank';
    clickableCard.className = 'video-card';

    const title = document.createElement('h2');
    title.textContent = videoData.title;

    const infoContainer = document.createElement('div');
    infoContainer.className = 'video-info';

    const channel = document.createElement('span');
    channel.textContent =videoData.channel_title;
    channel.className = 'video-channel';

    const date = document.createElement('span');
    date.textContent = videoData.published_at;
    date.className = 'video-date';


    infoContainer.appendChild(channel);
    infoContainer.appendChild(date);

    const thumbnail = document.createElement('img');
    thumbnail.src = videoData.thumbnail;
    thumbnail.alt = videoData.title + ' thumbnail';
    thumbnail.style.width = '100%';

    clickableCard.appendChild(title);
    clickableCard.appendChild(infoContainer);
    clickableCard.appendChild(thumbnail);

    return clickableCard;
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
                a.className = 'keyword-link';
                container.appendChild(a);

                const videoToggleButton = document.createElement('button');
                videoToggleButton.className = 'toggle-button';
                videoToggleButton.innerHTML = '<img src="../images/dropdown.png" alt="Show Video">';
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
