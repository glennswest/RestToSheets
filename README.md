- App to pull from restful api and push to google docs

The following env variables must be set:
export SPREADSHEET_DOC="1UUpf3234134341ywu0RPJLTqw1LOW8jX7LLaSbI2VBc"
export RESTURL="https://something/api/v1/releases/?fields=id%2Cshortname&format=json"
export RESTCRON="* * * * *"
This is generated with the line: thevalue="$(cat google-generated-creds.json)" at the bash prompt
export GOOGLE_AUTH='{}'

Setting up service account:
Service Account

This is a 2-legged oauth method and designed to be "an account that belongs to your application instead of to an individual end user". Use this for an app that needs to access a set of documents that you have full access to. (read more)

Setup Instructions

Go to the Google Developers Console
Select your project or create a new one (and then select it)
Enable the Drive API for your project
In the sidebar on the left, expand APIs & auth > APIs
Search for "drive"
Click on "Drive API"
click the blue "Enable API" button
Create a service account for your project
In the sidebar on the left, expand APIs & auth > Credentials
Click blue "Add credentials" button
Select the "Service account" option
Select the "JSON" key type option
Click blue "Create" button
your JSON key file is generated and downloaded to your machine (it is the only copy!)
note your service account's email address (also available in the JSON key file)
Share the doc (or docs) with your service account using the email noted above

