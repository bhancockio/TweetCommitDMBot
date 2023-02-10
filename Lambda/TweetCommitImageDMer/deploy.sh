rm package.zip
cd package
zip -r ../package.zip .
cd ..
zip package.zip .env lambda_function.py
aws lambda update-function-code --function-name TweetCommitImageDMer --zip-file fileb://package.zip