function setSlackCreds() {
  scriptProps.setProperty('slackSigningSecret', '');
}

/**
 * Slack API
 * 
 * ...
 * Slack app: https://api.slack.com/apps/A012JHA8QJY/general?
 * ...
 */
const Slack = {
  /**
   * Get parameters for Slack API call
   * 
   * @param {string} [method] 'get' or 'post'. If no method is supplied, a GET request will be sent
   * @param {string} [type] 'json', 'form', or 'url'
   * @param {object} [body] JSON-encoded request payload
   * 
   * @returns {RequestParams} Request parameters
   */
  'params': function (method, type, body) {
    var botToken = scriptProps.getProperty('slackBotToken');

    if (type == 'json') {
      var headers = {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + botToken
      };
      body = JSON.stringify(body);
    } else if (type == 'form') {
      headers = {
        'Authorization': 'Bearer ' + botToken
      };
    } else if (type == 'url') {
      headers = {
        'content-type': 'application/json'
      };
      body = JSON.stringify(body);
    };

    var params = {
      'method': method,
      'headers': headers
    };

    if (method == 'post') {
      params.payload = body;
    };

    return params;
  },

  'app': {
    'client_id': '6418292772.1459884490758',
    'client_secret': scriptProps.getProperty('slackClientSecret'),
    'signing_secret': scriptProps.getProperty('slackSigningSecret'),
    'app_id': 'A01DHS0EENA'
  },

  'oauth': {
    'v2': {
      /**
       * Exchanges a temporary OAuth verifier code for an access token
       * 
       * ...
       * https://api.slack.com/methods/oauth.v2.access
       * ...
       * 
       * @param {object} body 
       * @param {string} body.client_id Issued when you created your application.
       * @param {string} body.client_secret Issued when you created your application.
       * @param {string} body.code The code param returned via the OAuth callback.
       * @param {string} body.grant_type The grant_type param as described in the OAuth spec. Default: authorization_code
       * @param {string} body.redirect_uri This must match the originally submitted URI (if one was sent).
       * @param {string} body.refresh_token The refresh_token param as described in the OAuth spec.
       * 
       * @returns {AuthType}
       */
      'access': function (body, queryString) {
        var params = {
          'method': 'post',
          'payload': body
        };
        var response = UrlFetchApp.fetch('https://slack.com/api/oauth.v2.access' + queryString, params);
        var text = response.getContentText();
        var data = JSON.parse(text);

        return data;
      }
    }
  },

  'chat': {
    /**
     * Post message to Slack
     * 
     * ...
     * https://api.slack.com/methods/chat.postMessage
     * ...
     * 
     * @param {object} body JSON message
     * @param {string} body.channel Channel ID
     * @param {string} [body.text] Plain text message
     * @param {object[]} [body.blocks] A JSON-based array of structured blocks, presented as a URL-encoded string.
     * @param {object[]} [body.attachments] A JSON-based array of structured attachments, presented as a URL-encoded string. This field is required when not presenting text.
     * @param {boolean} [body.as_user] Pass true to update the message as the authed user. Bot users in this context are considered authed users.
     * 
     * @returns {MessageReturnObj} JSON object including result and message
     */
    'postMessage': function (body) {

      var params = Slack.params('post', 'json', body);
      var response = UrlFetchApp.fetch('https://slack.com/api/chat.postMessage', params);
      var text = response.getContentText();
      var data = JSON.parse(text);

      return data;
    },

    /**
     * Updates a message
     * 
     * ...
     * https://api.slack.com/methods/chat.update
     * ...
     * 
     * @param {object} body JSON message
     * @param {string} body.channel Channel ID
     * @param {string} body.ts Timestamp of the message to be updated.
     * @param {string} [body.text] New text for the message, using the default formatting rules. It's not required when presenting blocks or attachments.
     * @param {object[]} [body.blocks] A JSON-based array of structured blocks, presented as a URL-encoded string. If you don't include this field, the message's previous blocks will be retained. To remove previous blocks, include an empty array for this field.
     * @param {object[]} [body.attachments] A JSON-based array of structured attachments, presented as a URL-encoded string. This field is required when not presenting text. If you don't include this field, the message's previous attachments will be retained. To remove previous attachments, include an empty array for this field.
     * @param {boolean} [body.as_user] Pass true to update the message as the authed user. Bot users in this context are considered authed users.
     * 
     * @returns {MessageReturnObj} JSON object including result and message
     */
    'update': function (body) {

      var params = Slack.params('post', 'json', body);
      var response = UrlFetchApp.fetch('https://slack.com/api/chat.update', params);
      var text = response.getContentText();
      var data = JSON.parse(text);

      return data;
    },

    /**
     * Post message to Slack
     * 
     * ...
     * https://api.slack.com/methods/chat.delete
     * ...
     * 
     * @param {object} body JSON message
     * @param {string} body.channel Channel containing the message to be deleted.
     * @param {string} body.ts Timestamp of the message to be deleted.
     * @param {boolean} [body.as_user] Pass true to delete the message as the authed user with chat:write:user scope. Bot users in this context are considered authed users. If unused or false, the message will be deleted with chat:write:bot scope.
     * 
     * @returns {MessageDeleteObj} JSON object including result and message
     */
    'delete': function (body) {

      var params = Slack.params('post', 'json', body);
      var response = UrlFetchApp.fetch('https://slack.com/api/chat.delete', params);
      var text = response.getContentText();
      var data = JSON.parse(text);

      return data;
    },

    /**
     * Provide custom unfurl behavior for user-posted URLs
     * 
     * ...
     * https://api.slack.com/methods/chat.unfurl
     * ...
     * 
     * @param {object} body JSON message
     * @param {string} body.channel Channel ID of the message
     * @param {string} body.ts Timestamp of the message to add unfurl behavior to.
     * @param {string} body.unfurls URL-encoded JSON map with keys set to URLs featured in the the message, pointing to their unfurl blocks or message attachments.
     * @param {object[]} [body.user_auth_blocks] Provide a JSON based array of structured blocks presented as URL-encoded string to send as an ephemeral message to the user as invitation to authenticate further and enable full unfurling behavior.
     * @param {string} [body.user_auth_message] Provide a simply-formatted string to send as an ephemeral message to the user as invitation to authenticate further and enable full unfurling behavior. Provides two buttons, Not now or Never ask me again.
     * @param {boolean} [body.user_auth_required] Set to true or 1 to indicate the user must install your Slack app to trigger unfurls for this domain. Default: 0
     * @param {string} [body.user_auth_url] Send users to this custom URL where they will complete authentication in your app to fully trigger unfurling. Value should be properly URL-encoded.
     * 
     * @returns {BasicReturnObj}
     */
    'unfurl': function (body) {

      var params = Slack.params('post', 'form', body);
      var response = UrlFetchApp.fetch('https://slack.com/api/chat.unfurl', params);
      var text = response.getContentText();
      var data = JSON.parse(text);

      return data;
    },
  },

  'conversations': {
    /**
     * Retrieve a thread of messages posted to a conversation
     * 
     * ...
     * https://api.slack.com/methods/conversations.replies
     * ...
     * @param {Object} body Provide the channel and message timestamp of the parent message
     * @param {string} body.channel Conversation ID to fetch thread from
     * @param {string} body.ts Unique identifier of either a thread’s parent message or a message in the thread
     * @param {string} [body.cursor] Paginate through collections of data by setting the cursor parameter to a next_cursor attribute returned by a previous request's response_metadata. Default value fetches the first "page" of the collection.
     * @param {boolean} [body.inclusive] Include messages with latest or oldest timestamp in results only when either timestamp is specified. Default: 0
     * @param {string} [body.latest] End of time range of messages to include in results. Default: now
     * @param {string} [body.oldest] Start of time range of messages to include in results. Default: 0
     * @param {number} [body.limit] The maximum number of items to return. Fewer than the requested number of items may be returned, even if the end of the users list hasn't been reached. Default: 10
     * 
     * @returns {RepliesReturnObj}
     */
    'replies': function (body) {

      var params = Slack.params('post', 'form', body);
      var response = UrlFetchApp.fetch('https://slack.com/api/conversations.replies', params);
      var text = response.getContentText();
      var data = JSON.parse(text);

      return data;
    },
    /**
     * Joins an existing conversation.
     * 
     * ...
     * https://api.slack.com/methods/conversations.join
     * ...
     * @param {string} channel Conversation ID to join
     * 
     * @returns {ChannelReturnObj}
     */
    'join': function (channel) {
      var body = {
        'channel': channel
      };
      var params = Slack.params('post', 'json', body);
      var response = UrlFetchApp.fetch('https://slack.com/api/conversations.join', params);
      var text = response.getContentText();
      var data = JSON.parse(text);

      return data;
    }
  },

  'views': {
    /**
     * Publish a static view for a User
     * 
     * ...
     * https://api.slack.com/methods/views.publish
     * ...
     * 
     * @param {object} body
     * @param {string} body.user_id id of the user you want publish a view to.
     * @param {object} body.view A view payload. This must be a JSON-encoded string.
     * @param {string} [body.hash] A string that represents view state to protect against possible race conditions.
     *
     * @returns {ViewReturnObj}
     */
    'publish': function (body) {
      var params = Slack.params('post', 'json', body);
      var response = UrlFetchApp.fetch('https://slack.com/api/views.publish', params);
      var text = response.getContentText();
      var data = JSON.parse(text);

      return data;
    },

    /**
     * Open a view for a user
     * 
     * ...
     * https://api.slack.com/methods/views.open
     * ...
     * 
     * @param {object} body
     * @param {string} body.trigger_id Exchange a trigger to post to the user.
     * @param {object} body.view A view payload. This must be a JSON-encoded string.
     *
     * @returns {ViewReturnObj}
     */
    'open': function (body) {
      var params = Slack.params('post', 'json', body);
      var response = UrlFetchApp.fetch('https://slack.com/api/views.open', params);
      var text = response.getContentText();
      var data = JSON.parse(text);

      return data;
    },

    /**
     * Update an existing view
     * 
     * ...
     * https://api.slack.com/methods/views.update
     * ...
     * 
     * @param {object} body
     * @param {object} body.view[] A view payload. This must be a JSON-encoded string.
     * @param {string} [body.external_id] A unique identifier of the view set by the developer. Must be unique for all views on a team. Max length of 255 characters. Either view_id or external_id is required.
     * @param {string} [body.view_id] A unique identifier of the view to be updated. Either view_id or external_id is required.
     * @param {string} [body.hash] A string that represents view state to protect against possible race conditions.
     *
     * @returns {ViewReturnObj}
     */
    'update': function (body) {
      var params = Slack.params('post', 'json', body);
      var response = UrlFetchApp.fetch('https://slack.com/api/views.update', params);
      var text = response.getContentText();
      var data = JSON.parse(text);

      return data;
    },

    /**
     * Push a view onto the stack of a root view
     * 
     * ...
     * https://api.slack.com/methods/views.push
     * ...
     * 
     * @param {object} body
     * @param {string} body.trigger_id Exchange a trigger to post to the user.
     * @param {object} body.view A view payload. This must be a JSON-encoded string.
     *
     * @returns {ViewReturnObj}
     */
    'push': function (body) {
      var params = Slack.params('post', 'json', body);
      var response = UrlFetchApp.fetch('https://slack.com/api/views.push', params);
      var text = response.getContentText();
      var data = JSON.parse(text);

      return data;
    }
  },

  'users': {
    /**
     * Find a user with an email address
     * 
     * ...
     * https://api.slack.com/methods/users.lookupByEmail
     * ...
     * 
     * @param {string} email
     * 
     * @returns {UserReturnObj}
     */
    'lookupByEmail': function (email) {
      var body = {
        'email': email
      };
      var params = Slack.params('post', 'form', body);
      var response = UrlFetchApp.fetch('https://slack.com/api/users.lookupByEmail', params);
      var text = response.getContentText();
      var data = JSON.parse(text);

      return data;
    },

    /**
     * Lists all users in a Slack team
     * 
     * ...
     * https://api.slack.com/methods/users.lookupByEmail
     * ...
     * 
     * @param {Object} body
     * @param {string} [body.cursor] Paginate through collections of data by setting the cursor parameter to a next_cursor attribute returned by a previous request's response_metadata. Default value fetches the first "page" of the collection.
     * @param {boolean} [body.include_locale] Set this to true to receive the locale for users. Defaults to false.
     * @param {number} [body.limit] The maximum number of items to return. Fewer than the requested number of items may be returned, even if the end of the users list hasn't been reached. Default: 10
     * @param {string} [body.team_id] Encoded team id to list users in, required if org token is used
     * 
     * @returns {UsersReturnObj}
     */
    'list': function (body) {
      var params = Slack.params('post', 'form', body);
      var response = UrlFetchApp.fetch('https://slack.com/api/users.list', params);
      var text = response.getContentText();
      var data = JSON.parse(text);

      return data;
    }
  },

  'urlResponse': function (body, responseUrl) {
    var params = Slack.params('post', 'url', body);
    var response = UrlFetchApp.fetch(responseUrl, params);
    var data = response.getContentText();

    return data;
  }
}
