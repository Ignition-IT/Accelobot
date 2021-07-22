var scriptProps = PropertiesService.getScriptProperties();
// set your Accelo domain
var acceloDomain = ''
// set channels for request types
var channels = {
  'Support Request': '',
  'Alerts': '',
  'blocklist': ''
};

function setVariables() {
  scriptProps.setProperties({
    // 'webAppSecret': '', // create a random password for authentication to your web app
    // 'slackBotToken': '', // Bot Token from your Slack app
    // 'acceloUsername': '', // username from your Accelo API app
    // 'acceloPassword': '' // password from your Accelo API app
  });
}

function matchUsernames() {
  var acceloUsers = Accelo.staff.list('email');
  var users = [];

  acceloUsers.forEach(function (acceloUser) {
    var slackUser = Slack.users.lookupByEmail(acceloUser.email);
    if (slackUser.ok == true) {
      users.push({
        'firstName': acceloUser.firstname,
        'lastName': acceloUser.surname,
        'fullName': acceloUser.firstname + ' ' + acceloUser.surname,
        'email': acceloUser.email,
        'acceloId': acceloUser.id,
        'slackId': slackUser.user.id,
        'slackUsername': slackUser.user.name
      });
    };
  });

  scriptProps.setProperty('users', JSON.stringify(users));
  // set a trigger to run every day
  var currentTriggers = ScriptApp.getProjectTriggers();
  var triggers = [];
  currentTriggers.forEach((trigger) => triggers.push(trigger.getHandlerFunction()));
  if (!triggers.includes('matchUsernames')) {
    ScriptApp.newTrigger('matchUsernames').timeBased().everyDays(1).create();
  };
}


var blocklist = [
  '[macOS Updates]',
  '[Windows Update]',
  '[Root Capacity]',
  '[OpenDNS Active]',
  '[Reboot Events]',
  '[Time Machine]',
  '[Activation Lock]'
];

/**
 * @typedef userProperties
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} fullName
 * @property {string} email
 * @property {string} acceloId
 * @property {string} slackId
 * @property {string} slackName
 * @property {string} slackUsername
 */

/**
 * Gets a user's Slack and Accelo details
 * 
 * @param {string} property User property to search. Can be one of first name, last name, full name, email, Accelo user ID, Slack user ID, Slack name, Slack username
 * 
 * @returns {userProperties}
 */
function getUser(property) {
  var users = JSON.parse(scriptProps.getProperty('users'));
  var user = users.find((entry) => Object.values(entry).includes(property.toString()));
  return user;
}

function getCurrentTime() {
  var currentDate = new Date();
  var currentTime = currentDate.toLocaleString() + ' (Pacific Time)';
  return currentTime;
}

function Database(name) {
  /**
   * @typedef DatabaseObj
   * @property {boolean} ok Returns true or false
   * @property {string} key Returns key
   * @property {string} value Returns value
   * @property {string} error If ok is false, returns error
   */
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  /**
   * Gets an entry to the selected database sheet
   * 
   * @param {string} key
   * 
   * @returns {DatabaseObj}
   */
  this.get = function (key) {
    try {
      var data = sheet.getDataRange().getValues();
      // find array with matching requestId, return ts
      try {
        var value = data.find(entry => entry[0] == key)[1];
      } catch (err) {
        value = null;
      };
      return {
        'ok': true,
        'key': key,
        'value': value
      };
    } catch (err) {
      return {
        'ok': false,
        'error': err,
        'key': null,
        'value': null
      };
    };
  };
  /**
   * Adds or updates an entry in the selected database sheet
   * 
   * @param {string} key
   * @param {string} value
   * 
   * @returns {DatabaseObj}
   */
  this.set = function (key, value) {
    try {
      var range = sheet.getDataRange()
      var data = range.getValues();
      // find array with matching requestId, return ts
      var row = data.findIndex(entry => entry[0] == key);
      // update values
      if (row > 0) {
        data[row] = [key, value];
        range.setValues(data);
      }
      // add new entry
      else {
        sheet.insertRowBefore(2).getRange(2, 1, 1, 2).setValues([[key, value]]);
        // 
        try {
          sheet.deleteRow(10001);
        } catch (err) { };
      };
      return {
        'ok': true,
        'key': key,
        'value': value
      };
    } catch (err) {
      return {
        'ok': false,
        'error': err,
        'key': null,
        'value': null
      };
    };
  };
}

const requestDb = new Database('Requests');