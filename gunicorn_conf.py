# gunicorn_conf.py

bind = "127.0.0.1:4500"

# Worker Options
workers = 1
worker_class = 'uvicorn.workers.UvicornWorker'

# Logging Options
loglevel = 'debug'
accesslog = './access_log'
errorlog = './error_log'
