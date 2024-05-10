# CS510_Project - Media Recommendation System

![GitHub Release](https://img.shields.io/github/v/release/afesuazo/vault?include_prereleases)

The project at its core is a Chrome browser extension designed to revolutionize
the way users discover content. Currently, it targets YouTube as its sole platform
in order to demonstrate the concept in action. The tool dynamically lists keyword
recommendations (and top content for said keyword) based on real-time analysis of
user interactions, particularly focusing on the current viewport and how users 
engage with comments

Key Features:

* **Tailored Recommendations** 
* **Context awareness**
* **Media Display**

## Getting Started

### Prerequisites
* Python 3.10
* Virtualenv (Recommended)

### (Optional) Create a virtual environment

```bash
# Create the venv
$ python3 -m venv env

# Activate it
$ source env/bin/activate
```

### Clone and Setup

```bash
# Clone the repository
$ git clone https://github.com/afesuazo/CS510_Project.git
$ cd CS510_Project

# Run the setup script to install packages
# Same as pip3 install -r requirements.txt
$ chmod +x ./setup.sh
$ ./setup.sh
```

### Configuration File

Create the app.yaml configuration file with the following content and replace the values with your own

```yaml
runtime: python310
entrypoint: gunicorn -b :$PORT api:app

instance_class: F2

automatic_scaling:
  target_cpu_utilization: 0.65
  min_instances: 1
  max_instances: 10

env_variables:
  MODEL_NAME: "ml6team/keyphrase-extraction-kbir-inspec"
  MODEL_DIRECTORY: "model"
  YOUTUBE_API_URL: "https://www.googleapis.com/youtube/v3"
  API_KEY: "<API_KEY>"
  REDIS_URL: "redis://<localhost>:<6379>"
runtime_config:
  python_version: 3.10

```

The file should be placed in the root directory of the project.

### Running the Program

#### Backend

```bash
python3 api.py
```

#### Frontend

[//]: # (Instructions to load the extension in Chrome)

Go to [chrome://extensions/]() and enable Developer Mode. There, click on "Load unpacked" and select the "extension" folder from the project directory.


## Usage

[//]: # (Instructions on how to use the extension)

1. Open the YouTube website
2. Open a video. Preferebaly interact with the site (scroll, look at comments, add a like, etc.)
3. Click on the extension icon to view the recommendations
4. Click on either the keyword or the video to open the content

## Work in Progress / Future Improvements

- [ ] Store history of user interactions for better analytics
- [ ] Aggregate session data to improve recommendations
- [ ] Integrate other text based platforms (Reddit, Twitter, etc.)
