import json
import urllib.parse
from dotenv import load_dotenv
import boto3
import tweepy
import os

print('Loading function')

s3 = boto3.client('s3')
load_dotenv()


def lambda_handler(event, context):
    # print("Received event: " + json.dumps(event['Records'][0], indent=2))

    # Get the object from the event and show its content type
    bucket = event['Records'][0]['s3']['bucket']['name']
    key = urllib.parse.unquote_plus(event['Records'][0]['s3']['object']['key'], encoding='utf-8')
    [id, authorId] = key.split(".")[0].split("_")
    print("key={}".format(key))
    try:
        response = s3.get_object(Bucket=bucket, Key=key)
        download_path = '/tmp/{}'.format(key)
        print("download_path={}".format(download_path))
        s3.download_file(bucket, key, download_path)

        # Authenticate access
        auth = tweepy.OAuthHandler(os.getenv("CONSUMER_TOKEN"), os.getenv("CONSUMER_SECRET"))
        auth.set_access_token(os.getenv("ACCESS_TOKEN"), os.getenv("ACCESS_TOKEN_SECRET"))

        # Create API handler
        api = tweepy.API(auth)

        # upload media
        media = api.media_upload(filename=download_path)
        recipient_id = authorId  # ID of the user
        api.send_direct_message(recipient_id=recipient_id, text='Hey there! Thank you for following me and tyring out Tweet Commit Graph Generator! Also, I plan on creating more cool projects in the future so I am excited to have you along for the the ride. If you have any questions, let me know! ', attachment_type='media', attachment_media_id=media.media_id)

        print("CONTENT TYPE: " + response['ContentType'])
        return response['ContentType']
    except Exception as e:
        print(e)
        print('Error getting object {} from bucket {}. Make sure they exist and your bucket is in the same region as this function.'.format(key, bucket))
        raise e
