/**
 * Create new Slack message template
 * 
 * @param {string} channel Channel ID
 * @param {string} text Message text. If Blocks are added, this will become the fallback text for notifications.
 */
function Message(channel, text, blocks, attachments) {
  this.channel = channel ? channel : '';
  this.text = text ? text : '';
  this.blocks = blocks ? blocks : [];
  this.attachments = attachments ? attachments : [];
};

const messageBuilder = {
  /**
   * Build a Slack message for an Accelo request
   * 
   * @param {string|number} requestId Unique identifier of the request
   * 
   * @returns {MessageType}
   */
  'request': function (requestId) {
    requestId = requestId.toString();
    var request = Accelo.requests.get(requestId, 'conversion_id,standing,type(),claimer,affiliation(contact(),company()),title,body');
    var issueId = request.conversion_id;
    var standing = request.standing.charAt(0).toUpperCase() + request.standing.slice(1);
    var title = request.title;
    var type = request.type.title;
    var claimerId = request.claimer;
    var contactId = request.affiliation.contact.id
    var contactName = request.affiliation.contact.firstname + ' ' + request.affiliation.contact.surname;
    var affiliationEmail = request.affiliation.email;
    var companyId = request.affiliation.company.id;
    var companyName = request.affiliation.company.name;
    var body = request.body;

    if (claimerId == 0) {
      var claimerText = 'Unclaimed';
    } else {
      claimerText = `<@${getUser(claimerId).slackId}>`;
    };

    var message = new Message(channels[type]);

    // add blocklist text in Utilities/Project
    for (var b in blocklist) {
      if (title.includes(blocklist[b])) {
        // close request
        Accelo.requests.update(requestId, { 'standing': 'closed' });
        message.channel = channels.blocklist;
        message.text = `:accelo: *<https://${acceloDomain}.accelo.com/?action=customer_request&id=${requestId}|${title}>*\n\nThis request matched the blocklist search \`${blocklist[b]}\` and was automatically closed.`;
        return message;
      };
    };

    message.text = title;
    message.blocks.push({
      'type': 'section',
      'text': {
        'type': 'mrkdwn',
        'text': `*<https://${acceloDomain}.accelo.com/?action=customer_request&id=${requestId}|${request.title}>*`
      }
    });
    message.blocks.push({
      'type': 'section',
      'fields': [
        {
          'type': 'mrkdwn',
          'text': '*Status:*\n`' + standing + '`'
        },
        {
          'type': 'mrkdwn',
          'text': '*Type:*\n' + type
        },
        {
          'type': 'mrkdwn',
          'text': '*Claimed by:*\n' + claimerText
        },
        {
          'type': 'mrkdwn',
          'text': `*Requester:*\n<https://${acceloDomain}.accelo.com/?action=view_contact&id=${contactId}|${contactName}>`
        },
        {
          'type': 'mrkdwn',
          'text': `*Company:*\n<https://${acceloDomain}.accelo.com/?action=view_company&id=${companyId}|${companyName}>`
        },
        {
          'type': 'mrkdwn',
          'text': '*Email:*\n' + affiliationEmail
        }
      ]
    });

    if (standing == 'Pending' || standing == 'Open') {
      // if type = Alerts, add the request body
      if (type == 'Alerts') {
        message.blocks.push({
          'type': 'section',
          'text': {
            'type': 'mrkdwn',
            'text': '```' + body + '```'
          }
        });
      };
      // Add action buttons
      message.blocks.push({
        'type': 'actions',
        'elements': [
          {
            'type': 'button',
            'text': {
              'type': 'plain_text',
              'emoji': true,
              'text': 'Refresh'
            },
            'value': requestId
          },
          {
            'type': 'button',
            'text': {
              'type': 'plain_text',
              'emoji': true,
              'text': 'Claim'
            },
            'style': 'primary',
            'value': requestId
          },
          {
            'type': 'button',
            'text': {
              'type': 'plain_text',
              'emoji': true,
              'text': 'Convert'
            },
            'style': 'primary',
            'url': `https://${acceloDomain}.accelo.com/?action=convert_request&id=${requestId}&conversion_id=1&no_auto_header=1`,
            'value': requestId
          },
          {
            'type': 'button',
            'text': {
              'type': 'plain_text',
              'emoji': true,
              'text': 'Close'
            },
            'style': 'danger',
            'value': requestId
          }
        ]
      });

    }

    else if (standing == 'Converted') {
      if (issueId) {
        var issue = Accelo.issues.get(issueId, 'assignee(),title,status(),standing(),description');
        var assignee = getUser(issue.assignee.id).slackId;
        // push issue details
        message.blocks.splice(1, 0, {
          'type': 'section',
          'text': {
            'type': 'mrkdwn',
            'text':
              `:ticket: <https://${acceloDomain}.accelo.com/?action=view_issue&id=${issueId}|${issue.title}>\nAssigned to: <@${assignee}>\nStatus: \`${issue.status.title}\`\n\`\`\`${issue.description.substring(0, 200)}...\`\`\``
          }
        });
        ;
        // push action buttons
        message.blocks.push({
          'type': 'actions',
          'elements': [
            {
              'type': 'button',
              'text': {
                'type': 'plain_text',
                'emoji': true,
                'text': 'Refresh'
              },
              'value': requestId
            },
            {
              'type': 'button',
              'text': {
                'type': 'plain_text',
                'emoji': true,
                'text': 'View Ticket'
              },
              'style': 'primary',
              'url': `https://${acceloDomain}.accelo.com/?action=view_issue&id=${issueId}`,
              'value': requestId
            }
          ]
        });
      };
    }

    else if (standing == 'Closed') {
      message.blocks.push({
        'type': 'actions',
        'elements': [
          {
            'type': 'button',
            'text': {
              'type': 'plain_text',
              'emoji': true,
              'text': 'Refresh'
            },
            'value': requestId
          },
          {
            'type': 'button',
            'text': {
              'type': 'plain_text',
              'emoji': true,
              'text': 'Re-Open'
            },
            'style': 'primary',
            'value': requestId
          }
        ]
      });
    }

    else {
      message.blocks.push({
        'type': 'actions',
        'elements': [
          {
            'type': 'button',
            'text': {
              'type': 'plain_text',
              'emoji': true,
              'text': 'Refresh'
            },
            'value': requestId
          }
        ]
      });
    }

    return message;
  }
}