# THIS SCRIPT WILL DELETE ALL IMAGES ON S3 THAT ARE NOT FOUND IN THE del_images.txt FILE, USE WITH CAUTION !
# THIS IS USEFUL FOR DELETING UNUSED IMAGES , WE CAN USE IT BY GETTING ALL IMAGE URLS FROM DB AND PLACING THEM IN THE 
# TXT FILE (One per line) THEN RUN THIS SCRIPT TO AVOID DELETING THOSE...

# pip install boto3 first

import boto3
from dotenv import load_dotenv
import os

load_dotenv()

BUCKET_NAME = 'trybae-test'

# Load list of image URLs from file
with open('del_images.txt', 'r') as f:
    urls_to_keep = [url.strip() for url in f.readlines()]

# Initialize S3 client
s3 =  boto3.client(
    's3',
    aws_access_key_id=os.environ['AWS_ACCESS'],
    aws_secret_access_key=os.environ['AWS_SECRET'],
    region_name='us-east-1'
)

# List all objects in bucket, recursively
keys_to_delete = []
paginator = s3.get_paginator('list_objects_v2')
for result in paginator.paginate(Bucket=BUCKET_NAME):
    for obj in result.get('Contents', []):
        # Skip objects that should be kept
        if obj['Key'] in urls_to_keep:
            continue
        # Add objects to delete list
        keys_to_delete.append({'Key': obj['Key']})

# Delete objects from S3
if len(keys_to_delete) > 0:
    response = s3.delete_objects(
        Bucket=BUCKET_NAME,
        Delete={
            'Objects': keys_to_delete,
            'Quiet': False
        }
    )

# Print results
print(f"Deleted {len(keys_to_delete)} objects from S3.")
