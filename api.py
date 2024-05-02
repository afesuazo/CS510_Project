import logging
from logging.handlers import RotatingFileHandler
from pathlib import Path

import yaml
from flask import Flask, request, jsonify
from transformers import (
    TokenClassificationPipeline, AutoModelForTokenClassification, AutoTokenizer
)
from transformers.pipelines import AggregationStrategy
from flask_cors import CORS, cross_origin

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
    keywords = [result.get("word").strip() for result in outputs]
    app_logger.debug(f"Extracted keywords: {keywords}")
    return jsonify(keywords)


if __name__ == '__main__':
    app.run(port=8000, debug=True)
