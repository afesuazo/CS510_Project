import json
import logging
from datetime import timedelta
from logging.handlers import RotatingFileHandler
from pathlib import Path

import requests
import yaml
from flask import Flask, request, jsonify
from transformers import (
    TokenClassificationPipeline, AutoModelForTokenClassification, AutoTokenizer
)
from transformers.pipelines import AggregationStrategy
from flask_cors import CORS, cross_origin

import redis

# ----  Set up logging ----
log_directory = Path(__file__).parent / 'logs'
log_directory.mkdir(exist_ok=True)

# Flask logs
flask_log_file = log_directory / 'flask.log'
flask_handler = RotatingFileHandler(flask_log_file)
flask_logger = logging.getLogger('werkzeug')
flask_logger.addHandler(flask_handler)

# Our logs
app_log_file = log_directory / 'app.log'
app_handler = RotatingFileHandler(app_log_file)
app_logger = logging.getLogger(__name__)
app_logger.addHandler(app_handler)
app_logger.setLevel(logging.DEBUG)


# ---- Configuration variables ----
def load_config(config_path):
    with open(config_path, 'r') as file:
        config = yaml.safe_load(file)
        return config


config = load_config('app.yaml')

# Specify your model
MODEL_NAME = config['env_variables']['MODEL_NAME']
MODEL_DIRECTORY = Path.cwd() / config['env_variables']['MODEL_DIRECTORY']

app = Flask(__name__)
redis_client = redis.Redis(host='localhost', port=6379)


# Check if the model and tokenizer are downloaded
def load_model_and_tokenizer(model_name: str, model_directory: Path):
    # Check and create the model directory if not exists
    model_directory.mkdir(parents=True, exist_ok=True)

    # Initialize paths for the model and tokenizer
    model_path = model_directory / "model"
    tokenizer_path = model_directory / "tokenizer"

    # Check if the model and tokenizer are already downloaded
    if not model_path.exists() or not tokenizer_path.exists():
        # Download and save the model and tokenizer
        model = AutoModelForTokenClassification.from_pretrained(model_name)
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        model.save_pretrained(model_path)
        tokenizer.save_pretrained(tokenizer_path)
    else:
        # Load the model and tokenizer from the local directory
        model = AutoModelForTokenClassification.from_pretrained(model_path)
        tokenizer = AutoTokenizer.from_pretrained(tokenizer_path)

    return model, tokenizer


def search_top_video(search_query: str) -> dict:
    # Check cache first
    cached_video = redis_client.get(search_query)
    if cached_video:
        return json.loads(cached_video)

    # Use the YouTube search API to get the top video
    url = f'{config["env_variables"]["YOUTUBE_API_URL"]}/search?part=snippet&maxResults=1&&order=relevance&q={search_query}&key={config["env_variables"]["API_KEY"]}'
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()

        '''
        Sample response:
        {
          "kind": "youtube#searchListResponse",
          "etag": etag,
          "nextPageToken": string,
          "prevPageToken": string,
          "regionCode": string,
          "pageInfo": {
            "totalResults": integer,
            "resultsPerPage": integer
          },
          "items": [
            search Resource
          ]
        }
        '''

        app_logger.debug(f"Search query: {search_query}")
        app_logger.debug(f"Top video: {data['items']}")

        # Make sure we have at least one video
        # If video has less than 1000 views, it is not relevant
        if not data['items']:
            app_logger.debug(f"No relevant video found for {search_query}")
            return {}

        # Get the video thumbnail, url, and title
        video_title = data['items'][0]['snippet']['title']
        video_thumbnail = data['items'][0]['snippet']['thumbnails']['default']['url']
        video_id = data['items'][0]['id']['videoId']
        video_url = f'https://www.youtube.com/watch?v={video_id}'
        video_data = {
            'title': video_title,
            'thumbnail': video_thumbnail,
            'url': video_url,
        }

        # Cache the video data
        redis_client.setex(search_query, timedelta(hours=1), json.dumps(video_data))
        return video_data

    except requests.exceptions.RequestException as e:
        app_logger.error(f"Error fetching data from YouTube API: {e}")
        return {}


# Load the model and tokenizer
model, tokenizer = load_model_and_tokenizer(MODEL_NAME, MODEL_DIRECTORY)
extractor = TokenClassificationPipeline(model=model, tokenizer=tokenizer,
                                        aggregation_strategy=AggregationStrategy.FIRST)


@app.route('/extract', methods=['POST'])
@cross_origin(supports_credentials=True)
def extract_keywords():
    data = request.json
    app_logger.debug(f"Received data: {data}")
    text = data['text']
    text = text.replace("\n", " ")
    outputs = extractor(text)
    app_logger.debug(f"Extracted outputs: {outputs}")
    keywords = [result.get("word").strip() for result in outputs]
    app_logger.debug(f"Extracted keywords: {keywords}")

    recommendations = []

    if keywords:
        for keyword in keywords:
            video = search_top_video(keyword)
            app_logger.debug(f"Top video for keyword '{keyword}': {video}")
            if not video:
                continue
            # insert keyword into dictionary
            video['keyword'] = keyword
            recommendations.append(video)

    return jsonify(recommendations)


if __name__ == '__main__':
    redis_client.flushall()
    app.run(port=8000, debug=True)
