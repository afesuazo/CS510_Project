from flask import Flask, request, jsonify
from transformers import (
    TokenClassificationPipeline, AutoModelForTokenClassification, AutoTokenizer
)
from transformers.pipelines import AggregationStrategy
from flask_cors import CORS, cross_origin
import os

app = Flask(__name__)

# Specify your model
model_name = "ml6team/keyphrase-extraction-kbir-inspec"
model_directory = "./model"

# Check if the model and tokenizer are downloaded
def load_model_and_tokenizer(model_name, model_directory):
    # Check and create the model directory if not exists
    if not os.path.exists(model_directory):
        os.makedirs(model_directory, exist_ok=True)
    
    # Initialize paths for the model and tokenizer
    model_path = os.path.join(model_directory, "model")
    tokenizer_path = os.path.join(model_directory, "tokenizer")
    
    # Check if the model and tokenizer are already downloaded
    if not os.path.exists(model_path) or not os.path.exists(tokenizer_path):
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
model, tokenizer = load_model_and_tokenizer(model_name, model_directory)
extractor = TokenClassificationPipeline(model=model, tokenizer=tokenizer, aggregation_strategy=AggregationStrategy.FIRST)

@app.route('/extract', methods=['POST'])
@cross_origin(supports_credentials=True)
def extract_keywords():
    data = request.json
    text = data['text']
    text = text.replace("\n", " ")
    outputs = extractor(text)
    keywords = [result.get("word").strip() for result in outputs]
    print(keywords)
    return jsonify(keywords)

if __name__ == '__main__':
    app.run(port=8000, debug=True)
