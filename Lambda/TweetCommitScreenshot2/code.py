try:
    import json
    import time
    from selenium.webdriver import Chrome
    from selenium.webdriver.chrome.options import Options
    import os
    import shutil
    import uuid
    import boto3
    from datetime import datetime
    import datetime

    print("All Modules are ok ...")

except Exception as e:

    print("Error in Imports ")


# ------------------------------------Settings ---------------------------------------
global AWS_ACCESS_KEY
global AWS_SECRET_KEY
global AWS_REGION_NAME
global AWS_BUCKET
global URL
global DESTINATION

AWS_ACCESS_KEY="AKIA2HYOGHXZGFEK3MQG"
AWS_SECRET_KEY="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"
AWS_REGION_NAME="us-east-1"
AWS_BUCKET="tweet-commit"

# ---------------------------------------------------------------------------------------


class SchemaValidator(object):

    def __init__(self, response):
        self.response = response

    def isTrue(self):

        errorMessages = []


        try:
            url = self.response.get("url")
            if url is None:
                raise Exception ("Please pass valid url ")
        except Exception as e:errorMessages.append("Please pass valid url ")

        try:
            destinationPath = self.response.get("destinationPath")

            if destinationPath is None:
                raise Exception ("Please pass valid destinationPath  ")
        except Exception as e:errorMessages.append("Please pass valid destinationPath ")

        return errorMessages


class WebDriver(object):

    def __init__(self):
        self.options = Options()

        self.options.binary_location = '/opt/headless-chromium'
        self.options.add_argument('--headless')
        self.options.add_argument('--no-sandbox')
        self.options.add_argument('--single-process')
        self.options.add_argument('--disable-dev-shm-usage')
        self.options.add_argument("--window-size=1600,275")

    def get(self):
        driver = Chrome('/opt/chromedriver', options=self.options)
        return driver


class WebDriverScreenshot:

    def __init__(self):

        self._tmp_folder = '/tmp/{}'.format(uuid.uuid4())

        if not os.path.exists(self._tmp_folder):
            os.makedirs(self._tmp_folder)

        if not os.path.exists(self._tmp_folder + '/user-data'):
            os.makedirs(self._tmp_folder + '/user-data')

        if not os.path.exists(self._tmp_folder + '/data-path'):
            os.makedirs(self._tmp_folder + '/data-path')

        if not os.path.exists(self._tmp_folder + '/cache-dir'):
            os.makedirs(self._tmp_folder + '/cache-dir')


    def save_screenshot(self, url, filename, height=275, width=1600):
        driverHelper = WebDriver()
        driver = driverHelper.get()
        driver.get(url)
        time.sleep(10)
        driver.save_screenshot(filename)
        driver.quit()

    def close(self):
        # Remove specific tmp dir of this "run"
        shutil.rmtree(self._tmp_folder)

        # Remove possible core dumps
        folder = '/tmp'

        for the_file in os.listdir(folder):

            file_path = os.path.join(folder, the_file)

            try:
                if 'core.headless-chromi' in file_path and os.path.exists(file_path) and os.path.isfile(file_path):
                    os.unlink(file_path)
            except Exception as e:
                print(e)


def lambda_handler(event, context):
    print(event)

    try:

        _instance = SchemaValidator(response=event)
        response = _instance.isTrue()
        print("Parsed")

        if len(response) != 0:
            _response = {
                            "Error":"Please Correct following issue in Json format",
                            "message":response
                        },403
            return _response
        else:
            URL = event.get("url")
            author_id = event.get("authorId")
            destinationPath = event.get("destinationPath")

            # ===========================Crawling ===========================
            driver = WebDriverScreenshot()
            driver.save_screenshot(URL, '/tmp/{}.png'.format(destinationPath))
            driver.close()
            #=================================================================================


            # ===================================AWS S3 ==============================
            s3 = boto3.client("s3",aws_access_key_id=AWS_ACCESS_KEY, aws_secret_access_key=AWS_SECRET_KEY,region_name=AWS_REGION_NAME)
            s3.upload_file('/tmp/{}.png'.format(destinationPath), AWS_BUCKET,'{}_{}.png'.format(destinationPath, author_id))

            return True

    except Exception as e:
        print("Error : {} ".format(e))
        return False