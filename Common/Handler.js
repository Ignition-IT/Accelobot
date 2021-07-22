var scriptProps = PropertiesService.getScriptProperties();

/**
 * Handles GET requests to the web app
 * 
 * @param {object} e Request object including query string parameters, headers, and body
 * 
 * @returns {HTML} Redirects to Accelo instance
 */
function doGet(e) {
  return HtmlService.createHtmlOutput(
    '<script>window.top.location.href=\'https://' + acceloDomain + '.accelo.com\';</script>'
  );
}

/**
 * Handles POST requests to web app
 * 
 * ...
 * https://developers.google.com/apps-script/guides/web
 * ...
 * 
 * @param {object} e Request object including query string parameters, headers, and body
 * @param {object} e.parameter An object of key/value pairs that correspond to the request parameters. Only the first value is returned for parameters that have multiple values.
 * @param {object} e.parameters An object similar to e.parameter, but with an array of values for each key
 * @param {object} e.postData
 * @param {string} e.postData.type The MIME type of the POST body
 * @param {object} e.postData.contents The content text of the POST body
 */
function doPost(e) {
  console.log(e);

  var parameter = e.parameter
  var parameters = e.parameters
  var requestType = e.postData.type
  var contents = e.postData.contents

  // parse JSON
  if (requestType == 'application/json') {
    var body = JSON.parse(contents);
  };

  // query string parameters
  var token = parameters.token
  var app = parameters.app
  var type = parameters.type

  // authentication
  var secret = scriptProps.getProperty('webAppSecret');
  if (token == secret) {
    // designate app

    // Accelo
    if (app == 'accelo') {
      // id of Accelo object from webhook (request, issue, etc)
      var id = body.id

      //request created
      if (type == 'request_created') {
        sendNewRequest(id);
      } 
      // request updated
      else if (type == 'request_status_changed') {
        Utilities.sleep(2000);
        updateRequest(id);
      };
    };

    // Slack
    if (app == 'slack') {

      // handle interactions from Slack
      if (type == 'interaction') {
        var payload = JSON.parse(parameter.payload);

        var actions = payload.actions;
        var blocks = payload.blocks;
        var value = actions[0].value;
        var text = actions[0].text.text;
        var userId = payload.user.id;

        // Claim button was pressed
        if (text == 'Claim') {
          claimRequest(payload);
        }
        // Close button was pressed
        else if (text == 'Close') {
          closeRequest(payload);
        }
        // Re-Open button was pressed
        else if (text == 'Re-Open') {
          reOpenRequest(payload);
        }
        // Refresh button was pressed
        else if (text == 'Refresh') {
          refreshRequest(payload);
        };
      }

      // handle events from Slack
      else if (type == 'event') {

        var eventType = body.type;

        // URL verification for initial Slack app set up
        if (eventType == 'url_verification') {
          var challenge = body.challenge;
          return ContentService.createTextOutput(challenge);
        }

        else if (eventType == 'event_callback') {
          eventType = body.event.type;

          // Unfurl Accelo links to add issue/task/activity details
          if (eventType == 'link_shared') {
            var event = body.event;
            var channel = event.channel;
            var slackUserId = event.user;
            var links = event.links;
            var ts = event.message_ts;

            var unfurls = {};

            links.forEach(function(link) {
              var url = link.url;
              // extract up to a 7-digit ID and cut off the trailing non-numerical characters if ther are any
              var id = url.substring(url.lastIndexOf('id=') + 3, url.lastIndexOf('id=') + 10).replace(/[^0-9]/g, '');

              // handle issue links
              if (url.includes('view_issue') || url.includes('view_support_issue')) {
                // get issue details from Accelo API
                var details = getIssueDetails(id);
                var title = details.title;
                var description = details.description;
                var contact = details.contact;
                var assignee = '<@' + getAcceloSlackId(details.assignee) + '>';
                var standing = details.standing;
                var status = details.status;
                var company = details.company;

                unfurls[url] = {
                  'title': ':ticket: ' + title,
                  'text': '\nContact: ' + contact + '\nCompany: ' + company + '\nAssigned to: ' + assignee + '\nStatus: `' + status + '`\n```' + description + '```'
                };
              } 
              // handle task links
              else if (url.includes('view_task')) {
                // get task details from Accelo API
                var details = getDetails('tasks', id);
                // only proceed if task is against an issue
                if (details.against_type == 'issue') {
                  var ticket = '<https://' + acceloDomain + '.accelo.com/?action=view_issue&id=' + details.issue.id + '|' + details.issue.title + '>';
                  var contact = '<https://' + acceloDomain + '.accelo.com/?action=view_contact&id=' + details.contact.id + '|' + details.contact.firstname + ' ' + details.contact.surname + '>';
                  var assignee = '<@' + getAcceloSlackId(details.assignee) + '>';

                  unfurls[url] = {
                    'title': ':clipboard: ' + details.title,
                    'text': '\nTicket: ' + ticket + '\nContact: ' + contact + '\nAssigned to: ' + assignee + '\nStatus: `' + details.status.title + '`\n```' + details.description + '```'
                  };
                };
              } 
              // handle activity links
              else if (url.includes('view_activity')) {
                // get activity details from Accelo API
                var details = getDetails('activities', id);
                // only proceed if task is against an issue
                if (details.against_type == 'issue') {

                  // get issue details
                  var issueDetails = getIssueDetails(details.against_id);
                  // translate to Slack user ID if activity owner is staff
                  if (details.owner_type == 'staff') {
                    var assignee = '<@' + getAcceloSlackId(details.staff) + '>';
                  } 
                  // otherwise set assignee to affiliation's email
                  else if (details.owner_type == 'affiliation') {
                    var assignee = '`' + getDetails('affiliations', details.owner_id).email + '`';
                  };

                  unfurls[url] = {
                    'title': ':pencil: ' + details.subject,
                    'text': '\nTicket: <https://' + acceloUrl + '.accelo.com/?action=view_issue&id=' + details.against_id + '|' + issueDetails.title + '>\nFrom: ' + assignee + '\n```' + details.body + '```'
                  };
                };
              };
            });
            // URL encode the unfurls
            unfurls = encodeURIComponent(JSON.stringify(unfurls));

            var message = 'channel=' + channel + '&ts=' + ts + '&unfurls=' + unfurls;
            slackChatUnfurl(message);
          };
        };
      };
    }
  };


  return ContentService.createTextOutput()
    .setMimeType(ContentService.MimeType.JSON);
};