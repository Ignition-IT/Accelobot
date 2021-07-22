/**
 * Log to the attached Google Sheet or specified channel in Slack
 * 
 * Writing to a sheet and posting to Slack are both slow! Only use this logger for testing and QA. Use the built-in console.log() when possible.
 * 
 * @param {object} logs Anything you'd like to log
 * @param {string} [color] Color to display next to Slack message attachment. Options are "red", "orange", or "green". Defaults to grey
 */
function log(logs, color) {
  // set logging to Sheet, Slack, or disabled
  var logging = [
    //'slack'
    'sheet'
    //'off'
  ];
  var slackLoggingChannel = ''; // set Channel ID for your logging channel
  
  if (logging.includes('off')) {
    return;
  };
  
  var header = log.caller.name;
  
  if (logging.includes('slack')) {
    
    // set attachment color
    if (color == 'green') {
      var color = '#36a64f';
    } else if (color == 'red') {
      color = '#E21836';
    } else if (color == 'orange') {
      color = '#F88E20';
    } else if (!color) {
      color = '#A0A0A0';
    };
    
    var message = {
      'channel': slackLoggingChannel,
      'attachments': [
        {
          'fallback': 'Accelo: ' + logs,
          'color': color,
          'text': '*' + header + '*: `' + logs + '`',
          'footer': 'Accelo',
          'ts': new Date().getTime()
        }
      ]
    };
    
    Slack.chat.postMessage(message);
  };
  
  if (logging.includes('sheet')) {
    try {
      logs = JSON.stringify(logs);
    }
    catch(err) {
    };
    
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Logs');
    var timestamp = new Date();
    var json = {};
    json[header] = logs;
    json['Timestamp'] = timestamp;
    
    var keys = Object.keys(json).sort();
    var last = sheet.getLastColumn();
    var header = sheet.getRange(1, 1, 1, last).getValues()[0];
    
    var newCols = [];
    
    for (var k = 0; k < keys.length; k++) {
      if (header.indexOf(keys[k]) === -1) {
        newCols.push(keys[k]);
      }
    }
    
    if (newCols.length > 0) {
      sheet.insertColumnsAfter(last, newCols.length);
      sheet.getRange(1, last + 1, 1, newCols.length).setValues([newCols]);
      header = header.concat(newCols);
    }
    
    var row = [];
    Logger.log(row);
    for (var h = 0; h < header.length; h++) {
      row.push(header[h] in json ? json[header[h]] : '');
    }
    
    sheet.appendRow(row);
  };
}