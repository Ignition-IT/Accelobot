# Accelobot
Get interactive Slack notifications every time a new request is created or updated in Accelo!

![Example Notification](https://github.com/Ignition-IT/Accelobot/blob/main/Images/new_request.png?raw=true)

This integration adds a Slack app to your workspace that posts a message every time a new request is created. It includes action buttons to interact with the request directly from Slack! You can claim, close, and re-open requests without leaving Slack. You can also convert a request to a ticket with a click of a button, which will open a browser page with all the details prefilled. Once a request has been converted to a ticket, the Slack message will automatically update to show the ticket details, and a new button will appear to view the ticket.

![Notification with Issue](https://github.com/Ignition-IT/Accelobot/blob/main/Images/request_with_issue.png?raw=true)

It also features a configurable blocklist to automatically close requests whose title's contain a blocklist text match. This can be super helpful for cutting down on spam requests from systems that don't have configurable alerts or various other reasons.

---

## Set Up Instructions

1. Open your ![Slack Apps](https://api.slack.com/apps) page and create a new app. Select __From Manifest__, and paste the contents of ![slack_app_manifest.json](https://github.com/Ignition-IT/Accelobot). There are 2 variables in the `Interactivity URL` that you'll need to change later after your Google Script web app is published.
![Slack App Manifest](https://github.com/Ignition-IT/Accelobot/blob/main/Images/slack_app_manifest.png?raw=true)
2. Install the app to your workspace and make note of the __Bot Token__. We'll need to add this to the Script Properties later.
![Install Slack App](https://github.com/Ignition-IT/Accelobot/blob/main/Images/install_slack_app.png?raw=true)
3. Go to your Accelo API settings (https://YOUR_SUBDOMAIN.accelo.com/?action=edit_api_application&target=edit_api_application) and register a new app. Set the __Type__ to `Service`. Make note of the __Client ID__ and __Client Secret__.
4. Make a copy of my example project: https://docs.google.com/spreadsheets/d/1xL16vynjG6JSvlGmTR1Ag38P15Yp9guMTV1gZw8Wj1c/edit?usp=sharing
5. Open the Script Editor from __Tools > Script editor__
6. Go to _Utilities/Project.gs_ and set up the following variables:
    - `acceloDomain`: set this to your Accelo instance subdomain (e.g. `company`, if your deployment is at `https://company.accelo.com`)
    - `channels`: There are 3 channel options to set, 2 different types of requests, plus a blocklist channel. Get the __Channel ID__ for the channel you wish the messages for that request type to be posted in by copying the link to that channel and finding the ID in the URL. If your request types in Accelo are different, simply change the keys in the channels object to match.
    - `webAppSecret`: Create a random secret. You'll need to set this as `token=` when you're calling your web app from Slack or Accelo
    - `slackBotToken`: The __Bot Token__ from your Slack app
    - `acceloUsername`: the __Client ID__ from your Accelo app
    - `acceloPassword`: the __Client Secret__ from your Accelo app
7. Manually run `initialSetup()` to save your secrets to the Script Props. Then delete them from the function so they aren't visible in your code.
8. `initialSetup()` also runs `matchUsernames()` to match up your Accelo users to Slack users. This function matches based on email, so make sure your users' Slack and Accelo emails are the same. Once this function is run, it creates a time-based trigger to automatically run itself every day, so when you onboard or offboard a new user it will match their accounts.
9. `initialSetup()`also runs `getAcceloAccessToken()`, which calls the Accelo API to exchange your username and password for an access token. This function automatically sets a trigger to get a new access token 12 hours before your old one expires.
10. Deploy your script as a web app and copy the URL. Set __Execute as__ to your email and __Who can access__ to `Anyone`. If you make any changes to the code, you'll need to edit the deployment and publish as a new version in order for your changes to be implemented for the web app.
![Deploy Web App](https://github.com/Ignition-IT/Accelobot/blob/main/Images/deploy_web_app.png?raw=true)
11. Go back to Slack, and change the Interactivity URL to your published web app URL and webAppSecret as the token=
12. Go to your Accelo webhooks settings page (https://YOUR_SUBDOMAIN.accelo.com/?action=list_webhook_subscriptions&target=list_webhook_subscriptions) and create two new webhooks:
    - Event: `Request created`
    - Payload URL: `https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?token=YOUR_WEB_APP_SECRET&app=accelo&type=request_created`
    - Content Type: `application/json`
    - Secret: none

    - Event: `Request status updated`
    - Payload URL: `https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?token=YOUR_WEB_APP_SECRET&app=accelo&type=request_status_updated`
    - Content Type: `application/json`
    - Secret: none
![Accelo Webhooks](https://github.com/Ignition-IT/Accelobot/blob/main/Images/create_accelo_webhook.png?raw=true)
13. Click __Test__ on the Request Created webhook and enter a valid Request ID. The first time you test, it won't send anything to Slack, but rather it should add itself to the channel you set for that request type. Test again, and it should send the message.
14. Profit.

---

Accelo API reference: https://api.accelo.com/docs

Google Apps Script reference: https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet-app



Created by Ella Hansen for Ignition, Inc., a California corporation https://www.ignitionit.com
