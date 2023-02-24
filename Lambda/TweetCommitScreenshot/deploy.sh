rm package.zip
zip package.zip code.py
aws lambda update-function-code --function-name TweetHistoryScreenshot --zip-file fileb://package.zip