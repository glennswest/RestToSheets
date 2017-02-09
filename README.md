- App to pull from restful api and push to google docs

The following env variables must be set:
export SPREADSHEET_DOC="1UUpf3234134341ywu0RPJLTqw1LOW8jX7LLaSbI2VBc"
export RESTURL="https://something/api/v1/releases/?fields=id%2Cshortname&format=json"
export RESTCRON="* * * * *"
This is generated with the line: thevalue="$(cat google-generated-creds.json)" at the bash prompt
export GOOGLE_AUTH='{}'
