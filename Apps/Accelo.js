/**
 * Get access token from Accelo and store in Script Properties
 * 
 * Automatically creates a time-based trigger to refresh the token 12 hours before expiration
 */
function getAcceloAccessToken() {
  var acceloUsername = scriptProps.getProperty('acceloUsername');
  var acceloPassword = scriptProps.getProperty('acceloPassword');

  // base64 encode the credentials
  var clientCredentials = Utilities.base64Encode(acceloUsername + ':' + acceloPassword);

  var headers = {
    'Authorization': 'Basic ' + clientCredentials,
    'Content-Type': 'application/x-www-form-urlencoded'
  }

  var payload = 'grant_type=client_credentials';

  var params = {
    'method': 'post',
    'payload': payload,
    'headers': headers
  };

  var response = UrlFetchApp.fetch(`https://${acceloDomain}.api.accelo.com/oauth2/v0/token`, params);
  var text = response.getContentText();
  var data = JSON.parse(text);
  var accessToken = data.access_token;
  scriptProps.setProperty('acceloAccessToken', accessToken);

  // set trigger to refresh token after expiration
  var expiresIn = data.expires_in - 43200;
  ScriptApp.newTrigger('getAcceloAccessToken').timeBased().after(expiresIn * 1000).create();
}

const Accelo = {
  'app': {
  },
  'params': function (method, payload) {
    var accessToken = scriptProps.getProperty('acceloAccessToken');

    var headers = {
      'Authorization': 'Bearer ' + accessToken,
      'content-type': 'application/json'
    }

    var params = {
      'method': method ? method : 'get',
      'headers': headers,
      'payload': payload ? JSON.stringify(payload) : null,
      'muteHttpExceptions': true
    };

    return params;
  },
  'activities': {
    /**
     * If successful, this request returns an activity identified by its activity_id.
     * 
     * ...
     * https://api.accelo.com/docs/?http#get-activity
     * ...
     * 
     * @param {string|number} id A unique identifier for the object
     * @param {string} [fields] Specify fields to return
     * 
     * @returns {ActivityObj}
     */
    'get': function (id, fields) {
      var params = Accelo.params();

      var response = UrlFetchApp.fetch(`https://${acceloDomain}.api.accelo.com/api/v0/activities/${id}?_fields=${fields}`, params);
      var text = response.getContentText();
      var data = JSON.parse(text).response;

      return data;
    },
    /**
     * This request will return a list of activities on the Accelo deployment.
     * 
     * ...
     * https://api.accelo.com/docs/?http#list-activities
     * ...
     * 
     * @param {string} [fields] An string of the desired fields and linked objects, separated by commas
     * @param {object} [filters] An object containing filter names and values to be filtered
     * @param {string} [search] A search string to match object against
     * 
     * @returns {ActivityObj[]}
     */
    'list': function (fields, filters, search) {
      payload = {
        '_filters': filters,
        '_fields': fields,
        '_search': search
      };
      var params = Accelo.params('post', payload);

      var page = 0;
      var results = 50;
      var data = [];

      while (results == 50) {
        var response = UrlFetchApp.fetch(`https://${acceloDomain}.api.accelo.com/api/v0/activities?_method=get&_limit=50&_page=${page}`, params);
        var text = response.getContentText();
        var items = JSON.parse(text).response;

        items.forEach((item) => data.push(item));
        results = items.length;
        page++;
      };

      return data;
    },
    /**
     * This request will return a count of activities in a list defined by any available searches or filters. With no searches or filters this will be a count of all activities on the deployment.
     * 
     * ...
     * https://api.accelo.com/docs/?http#count-activities
     * ...
     * 
     * @param {object} [filters] An object containing filter names and values to be filtered
     * @param {string} [search] A search string to match object against
     * 
     * @returns {CountObj}
     */
    'count': function (filters, search) {
      payload = {
        '_fields': fields,
        '_filters': filters,
        '_search': search
      };
      var params = Accelo.params('post', payload);

      var response = UrlFetchApp.fetch(`https://${acceloDomain}.api.accelo.com/api/v0/activities/count?_method=get`, params);
      var text = response.getContentText();
      var data = JSON.parse(text).response;

      return data;
    },
    /**
     * This request will update, and return, the identified activity.
     * 
     * ...
     * The following fields from the activity object may be updated through this request:
     * subject - Updating this is only possible if the user executing the request is the owner.
     * body - Updating this is only possible if the user executing the request is the owner.
     * visibility - Updating this is only possible if the user executing has an interaction with the activity.
     * details - Additional details assigned to an activity.
     * priority_id - The unique identifier of the priority to be linked to the activity.
     * class_id* - The unique identifier of the class to be linked to the activity.
     * message_id - A custom message id to be given to the activity.
     * date_started - Seconds since UTC
     * date_ended - Seconds since UTC
     * date_due - Seconds since UTC
     * nonbillable* - The amount of nonbillable time, in seconds. Requires the user has the can_edit_time permission under the permission object.
     * billable* - The amount of billable time, in seconds. Requires the user has the can_edit_billable permission under the permission object, and that the activity is billable (see the is_billable flag on the activity).
     * * when the medium is 'email' only these fields may be updated
     * 
     * https://api.accelo.com/docs/?http#update-an-activity
     * ...
     * 
     * @param {string|number} id The unique ID of the object.
     * @param {object} payload JSON object of object's fields to update.
     * @param {string} [fields] An array of the desired fields and linked objects
     * 
     * @returns {ActivityObj}
     */
    'update': function (id, payload, fields) {
      var params = Accelo.params('put', payload);

      var response = UrlFetchApp.fetch(`https://${acceloDomain}.api.accelo.com/api/v0/activities/${id}?_fields=${fields}`, params);
      var text = response.getContentText();
      var data = JSON.parse(text).response;

      return data;
    },
    /**
     * This request will create, and return, a new activity on the deployment.
     * 
     * ...
     * Values for the following fields may be set through this request:
     * 
     * subject - Activity's subject that will appear in the title of the activity.
     * against_id - The id of the against_table object, the activity is linked against.
     * against_type - The object the activity is linked against. This can be: affiliation, contract, contract_period, invoice, issue, job, prospect, request, task or staff.
     * body - The content of the activity.
     * medium - Type of activity to create. This can be: 'note', 'meeting', 'email', or 'call'. This will default to note.
     * owner_type - The activity can be owned by a staff member or an affiliation. The owner defaults to the current user
     * owner_id - Owner's id. i.e, the staff or affiliation id of owner_table.
     * visibility - Defaults to private, unless the request is executed as the Accelo Support user.
     * details - Additional details assigned to an activity. For meetings and postals this is used to store the location/address. For calls this is used to store the number.
     * priority_id - The unique identifier of the priority to be linked to the new activity.
     * class_id - The unique identifier of the class to be linked to the new activity.
     * thread_id - The unique identifier of the thread to be linked to the new activity.
     * task_id - The unique identifier of the task to be linked to the new activity.
     * parent_id - The unique identifier of the parent activity of the new activity.
     * message_id - A custom message id to be given to the new activity.
     * date_started - Seconds since UTC
     * date_ended - Seconds since UTC
     * date_due - Seconds since UTC
     * file - A file you would like to add as an attachment to the new activity (Requires "multi-part/form-data")
     * send_invites - Only applicable if medium is set to "meeting". Either "true" or "false", whether invitations are enabled or not. Defaults to "false".
     * nonbillable - Requires the owner is a staff member.
     * billable - As above, but also requires the activity is against an issue, job, milestone, contract, or period
     * block_send - 1 or 0, whether to block sending the activity. Defaults to 0, so the activity will be sent if it is eligible.
     * 
     *  * We can create interactions with our activity by sending our request as JSON (see the introduction for information on sending JSON requests) and including the following objects:
     * 
     * to - Anyone to whom the activity is directed.
     * cc - Anyone to whom the activity should be cc'd.
     * bcc - Anyone to whom the activity should be bcc'd
     * 
     * https://api.accelo.com/docs/?http#create-an-activity
     * ...
     * 
     * @param {object} payload JSON object with fields to create object
     * @param {string} [fields] An array of the desired fields and linked objects
     * 
     * @returns {ActivityObj}
     */
    'create': function (payload, fields) {
      var params = Accelo.params('post', payload);

      var response = UrlFetchApp.fetch(`https://${acceloDomain}.api.accelo.com/api/v0/activities?_fields=${fields}`, params);
      var text = response.getContentText();
      var data = JSON.parse(text).response;

      return data;
    },
    'interacts': {
      /**
       * This request returns an array of activity interactions for the activity identified. This request returns a contact object, rather than affiliation object as in the case of Accelo.activities.interacts.list().
       * 
       * ...
       * https://api.accelo.com/docs/?http#list-interactions
       * ...
       * 
       * @param {string|number} id The unique ID for the activity to get interacts for.
       * @param {string} [fields] An string of the desired fields and linked objects, separated by commas.
       * 
       * @returns {ActivityInteractsObj}
       */
      'get': function (id, fields) {
        var params = Accelo.params();

        var response = UrlFetchApp.fetch(`https://${acceloDomain}.api.accelo.com/api/v0/activities/${id}/interacts?_fields=${fields}`, params);
        var text = response.getContentText();
        var data = JSON.parse(text).response;

        return data;
      },
      /**
       * The response will contain three arrays, one labeled "activities", one labeled "staff", and one labeled "affiliations". The objects in the "activities" array will be activity objects with the addition of an array labeled "interacts".
       * 
       * ...
       * https://api.accelo.com/docs/?http#list-activities
       * ...
       * 
       * @param {string} [fields] An string of the desired fields and linked objects, separated by commas
       * @param {object} [filters] An object containing filter names and values to be filtered
       * 
       * @returns {ActivitiesInteractsObj}
       */
      'list': function (fields, filters) {
        fields = fields ? 'interacts,' + fields : 'interacts';
        payload = {
          '_fields': fields,
          '_filters': filters
        };
        var params = Accelo.params('post', payload);

        var page = 0;
        var results = 50;
        var data = [];

        while (results == 50) {
          var response = UrlFetchApp.fetch(`https://${acceloDomain}.api.accelo.com/api/v0/activities?_method=get&_limit=50&_page=${page}`, params);
          var text = response.getContentText();
          var items = JSON.parse(text).response;
          items.forEach((item) => data.push(item));
          results = items.length;
          page++;
        };

        return data;
      },
      /**
       * This request returns an array of activity interactions for the activity identified. This request returns a contact object, rather than affiliation object as in the case of Accelo.activities.interacts.list().
       * 
       * ...
       * https://api.accelo.com/docs/?http#count-interactions
       * ...
       * 
       * @param {string|number} id The unique ID for the activity to get interacts for.
       * 
       * @returns {CountObj}
       */
      'count': function (id) {
        var params = Accelo.params();

        var response = UrlFetchApp.fetch(`https://${acceloDomain}.api.accelo.com/api/v0/activities/${id}/interacts/count?_fields=${fields}`, params);
        var text = response.getContentText();
        var data = JSON.parse(text).response;

        return data;
      }
    },
    'threads': {
      /**
       * This request returns an array of activity interactions for the activity identified. This request returns a contact object, rather than affiliation object as in the case of Accelo.activities.interacts.list().
       * 
       * ...
       * https://api.accelo.com/docs/?http#list-interactions
       * ...
       * 
       * @param {string|number} id The unique ID for the activity to get interacts for.
       * @param {string} [fields] An string of the desired fields and linked objects, separated by commas.
       * 
       * @returns {ActivityInteractsObj}
       */
      'get': function (id, fields) {
        var params = Accelo.params();

        var response = UrlFetchApp.fetch(`https://${acceloDomain}.api.accelo.com/api/v0/activities/${id}/interacts?_fields=${fields}`, params);
        var text = response.getContentText();
        var data = JSON.parse(text).response;

        return data;
      },
      /**
       * This request returns a list of activity threads.
       * 
       * ...
       * https://api.accelo.com/docs/?http#list-activity-threads
       * ...
       * 
       * @param {string} [fields] An string of the desired fields and linked objects, separated by commas
       * @param {object} [filters] An object containing filter names and values to be filtered
       * 
       * @returns {ActivityThreadObj}
       */
      'list': function (fields, filters) {
        payload = {
          '_fields': fields,
          '_filters': filters
        };
        var params = Accelo.params('post', payload);

        var page = 0;
        var results = 50;
        var data = [];

        while (results == 50) {
          var response = UrlFetchApp.fetch(`https://${acceloDomain}.api.accelo.com/api/v0/activities/threads?_method=get&_limit=50&_page=${page}`, params);
          var text = response.getContentText();
          var items = JSON.parse(text).response;
          items.forEach((item) => data.push(item));
          results = items.length;
          page++;
        };

        return data;
      },
      /**
       * This request will return a count of activity threads in a list defined by any available searches or filters. With no searches or filters this will be a count of all activity threads. This request returns a single field:
       * 
       * ...
       * https://api.accelo.com/docs/?http#count-activity-threads
       * ...
       * 
       * @param {object} [filters] An object containing filter names and values to be filtered
       * @param {string} [search] A search string to match object against
       * 
       * @returns {CountObj}
       */
      'count': function (filters, search) {
        payload = {
          '_filters': filters,
          '_search': search
        };
        var params = Accelo.params('post', payload);

        var response = UrlFetchApp.fetch(`https://${acceloDomain}.api.accelo.com/api/v0/activities/threads/count?_method=get`, params);
        var text = response.getContentText();
        var data = JSON.parse(text).response;

        return data;
      }
    }
  },
  'affiliations': {
    /**
     * This request returns an affiliation specified by their unique id.
     * 
     * ...
     * https://api.accelo.com/docs/?http#get-affiliation
     * ...
     * 
     * @param {string|number} id The unique identifier of the affiliation
     * @param {string} [fields] Specify fields to return. Defaults to _ALL if not provided
     * 
     * @returns {AffiliationObj}
     */
    'get': function (id, fields) {
      var params = Accelo.params();

      var response = UrlFetchApp.fetch(`https://${acceloDomain}.api.accelo.com/api/v0/affiliations/${id}?_fields=${fields}`, params);
      var text = response.getContentText();
      var data = JSON.parse(text).response;

      return data;
    },
    /**
     * This request returns a list of affiliation objects on the deployment.
     * 
     * ...
     * https://api.accelo.com/docs/?http#list-affiliations
     * ...
     * 
     * @param {string} [fields] An string of the desired fields and linked objects, separated by commas
     * @param {object} [filters] An object containing filter names and values to be filtered
     * @param {string} [search] A search string to match object against
     * 
     * @returns {AffiliationObj[]}
     */
    'list': function (fields, filters, search) {
      payload = {
        '_filters': filters,
        '_fields': fields,
        '_search': search
      };
      var params = Accelo.params('post', payload);

      var page = 0;
      var results = 50;
      var data = [];

      while (results == 50) {
        var response = UrlFetchApp.fetch(`https://${acceloDomain}.api.accelo.com/api/v0/affiliations?_method=get&_limit=50&_page=${page}`, params);
        var text = response.getContentText();
        var items = JSON.parse(text).response;

        items.forEach((item) => data.push(item));
        results = items.length;
        page++;
      };

      return data;
    },
    /**
     * This request will return a count of affiliations in a list defined by any available searches or filters. With no searches or filters this will be a count of all affiliations on the deployment.
     * 
     * ...
     * https://api.accelo.com/docs/?http#count-affiliations
     * ...
     * 
     * @param {object} [filters] An object containing filter names and values to be filtered
     * @param {string} [search] A search string to match object against
     * 
     * @returns {CountObj}
     */
    'count': function (filters, search) {
      payload = {
        '_fields': fields,
        '_filters': filters,
        '_search': search
      };
      var params = Accelo.params('post', payload);

      var response = UrlFetchApp.fetch(`https://${acceloDomain}.api.accelo.com/api/v0/affiliations/count?_method=get`, params);
      var text = response.getContentText();
      var data = JSON.parse(text).response;

      return data;
    },
    /**
     * This request will update and return an affiliation identified by its affiliation_id.
     * 
     * ...
     * The following fields from the activity object may be updated through this request:
     * country_id - Must point to a valid country.
     * physical_address_id - Must point to a valid address.
     * postal_address_id - Must point to a valid address.
     * phone - 
     * fax - 
     * mobile - 
     * email - 
     * position - 
     * status_id - Must point to a valid status.
     * standing - 
     * communication - Must be "yes" or "no", whether or not communications, such as updates, newsletters etc. are sent to this affiliation.
     * invoice_method - e.g. "email", "fax" or "postal", the method by which invoices should be sent.
     * 
     * https://api.accelo.com/docs/?http#update-an-affiliation
     * ...
     * 
     * @param {string|number} id The unique ID of the object.
     * @param {object} payload JSON object of object's fields to update.
     * @param {string} [fields] An array of the desired fields and linked objects
     * 
     * @returns {AffiliationObj}
     */
    'update': function (id, payload, fields) {
      var params = Accelo.params('put', payload);

      var response = UrlFetchApp.fetch(`https://${acceloDomain}.api.accelo.com/api/v0/affiliations/${id}?_fields=${fields}`, params);
      var text = response.getContentText();
      var data = JSON.parse(text).response;

      return data;
    },
    /**
     * This request will create a new affiliation between a company and contact (to be specified in the request), and return it.
     * 
     * ...
     * Values for the following fields may be set through this request:
     * 
     * company_id - Must point to a valid company. This is the company the new affiliation will point to.
     * contact_id - Must point to a valid contact. This is the contact the new affiliation will point to.
     * country_id - Must point to a valid country.
     * physical_address_id - Must point to a valid address.
     * postal_address_id - Must point to a valid address.
     * phone - 
     * fax - 
     * mobile - 
     * email - 
     * position - 
     * status_id - Must point to a valid status.
     * standing - 
     * communication - Must be "yes" or "no", whether or not communications, such as updates, newsletters etc. are sent to this affiliation, default "no".
     * invoice_method - e.g. "email", "fax" or "postal", the method by which invoices should be sent.
     * 
     * https://api.accelo.com/docs/?http#create-an-affiliation
     * ...
     * 
     * @param {object} payload JSON object with fields to create object
     * @param {string} [fields] An array of the desired fields and linked objects
     * 
     * @returns {AffiliationObj}
     */
    'create': function (payload, fields) {
      var params = Accelo.params('post', payload);

      var response = UrlFetchApp.fetch(`https://${acceloDomain}.api.accelo.com/api/v0/affiliations?_fields=${fields}`, params);
      var text = response.getContentText();
      var data = JSON.parse(text).response;

      return data;
    }
  },
  'companies': {
    /**
     * This request returns a single company from the Accelo deployment, identified by its company_id.
     * 
     * ...
     * https://api.accelo.com/docs/?http#get-company
     * ...
     * 
     * @param {string|number} id The unique identifier of the affiliation
     * @param {string} [fields] Specify fields to return. Defaults to _ALL if not provided
     * 
     * @returns {CompanyObj}
     */
    'get': function (id, fields) {
      var params = Accelo.params();

      var response = UrlFetchApp.fetch(`https://${acceloDomain}.api.accelo.com/api/v0/companies/${id}?_fields=${fields}`, params);
      var text = response.getContentText();
      var data = JSON.parse(text).response;

      return data;
    },
    /**
     * This request returns a list of companies from the Accelo deployment.
     * 
     * ...
     * https://api.accelo.com/docs/?http#list-companies
     * ...
     * 
     * @param {string} [fields] An string of the desired fields and linked objects, separated by commas
     * @param {object} [filters] An object containing filter names and values to be filtered
     * @param {string} [search] A search string to match object against
     * 
     * @returns {CompanyObj[]}
     */
    'list': function (fields, filters, search) {
      payload = {
        '_filters': filters,
        '_fields': fields,
        '_search': search
      };
      var params = Accelo.params('post', payload);

      var page = 0;
      var results = 50;
      var data = [];

      while (results == 50) {
        var response = UrlFetchApp.fetch(`https://${acceloDomain}.api.accelo.com/api/v0/companies?_method=get&_limit=50&_page=${page}`, params);
        var text = response.getContentText();
        var items = JSON.parse(text).response;

        items.forEach((item) => data.push(item));
        results = items.length;
        page++;
      };

      return data;
    },
    /**
     * This request will return a count of companies in a list defined by any available searches or filters. With no searches or filters this will be a count of all companies on the deployment.
     * 
     * ...
     * https://api.accelo.com/docs/?http#count-companies
     * ...
     * 
     * @param {object} [filters] An object containing filter names and values to be filtered
     * @param {string} [search] A search string to match object against
     * 
     * @returns {CountObj}
     */
    'count': function (filters, search) {
      payload = {
        '_fields': fields,
        '_filters': filters,
        '_search': search
      };
      var params = Accelo.params('post', payload);

      var response = UrlFetchApp.fetch(`https://${acceloDomain}.api.accelo.com/api/v0/companies/count?_method=get`, params);
      var text = response.getContentText();
      var data = JSON.parse(text).response;

      return data;
    },
    /**
     * This request will update and return an affiliation identified by its affiliation_id.
     * 
     * ...
     * The following fields from the activity object may be updated through this request:
     * 
     * website
     * phone
     * fax 
     * comments
     * name
     * 
     * https://api.accelo.com/docs/?http#update-a-company
     * ...
     * 
     * @param {string|number} id The unique ID of the object.
     * @param {object} payload JSON object of object's fields to update.
     * @param {string} [fields] An array of the desired fields and linked objects
     * 
     * @returns {CompanyObj}
     */
    'update': function (id, payload, fields) {
      var params = Accelo.params('put', payload);

      var response = UrlFetchApp.fetch(`https://${acceloDomain}.api.accelo.com/api/v0/companies/${id}?_fields=${fields}`, params);
      var text = response.getContentText();
      var data = JSON.parse(text).response;

      return data;
    },
    /**
     * This request creates a new company on the Accelo deployment, and returns it.
     * 
     * ...
     * Values for the following fields may be set through this request:
     * 
     * parent_id
     * status_id
     * standing - If you also send a status_id, this will be overwritten by the standing of the status linked.
     * website
     * phone
     * fax
     * comments
     * custom_id - custom_id will only show when you have custom id enabled on the web app
     * 
     * https://api.accelo.com/docs/?http#create-a-company
     * ...
     * 
     * @param {object} payload JSON object with fields to create object
     * @param {string} [fields] An array of the desired fields and linked objects
     * 
     * @returns {CompanyObj}
     */
    'create': function (payload, fields) {
      var params = Accelo.params('post', payload);

      var response = UrlFetchApp.fetch(`https://${acceloDomain}.api.accelo.com/api/v0/companies?_fields=${fields}`, params);
      var text = response.getContentText();
      var data = JSON.parse(text).response;

      return data;
    }
  },
  'contacts': {
    /**
     * This request returns a single contact, identified by their contact_id.
     * 
     * ...
     * https://api.accelo.com/docs/?http#get-contact
     * ...
     * 
     * @param {string|number} id The unique identifier of the affiliation
     * @param {string} [fields] Specify fields to return. Defaults to _ALL if not provided
     * 
     * @returns {ContactObj}
     */
    'get': function (id, fields) {
      var params = Accelo.params();

      var response = UrlFetchApp.fetch(`https://${acceloDomain}.api.accelo.com/api/v0/contacts/${id}?_fields=${fields}`, params);
      var text = response.getContentText();
      var data = JSON.parse(text).response;

      return data;
    },
    /**
     * This request returns a list of contacts from the Accelo deployment.
     * 
     * ...
     * https://api.accelo.com/docs/?http#list-contacts
     * ...
     * 
     * @param {string} [fields] An string of the desired fields and linked objects, separated by commas
     * @param {object} [filters] An object containing filter names and values to be filtered
     * @param {string} [search] A search string to match object against
     * 
     * @returns {ContactObj[]}
     */
    'list': function (fields, filters, search) {
      payload = {
        '_filters': filters,
        '_fields': fields,
        '_search': search
      };
      var params = Accelo.params('post', payload);

      var page = 0;
      var results = 50;
      var data = [];

      while (results == 50) {
        var response = UrlFetchApp.fetch(`https://${acceloDomain}.api.accelo.com/api/v0/contacts?_method=get&_limit=50&_page=${page}`, params);
        var text = response.getContentText();
        var items = JSON.parse(text).response;

        items.forEach((item) => data.push(item));
        results = items.length;
        page++;
      };

      return data;
    },
    /**
     * This request will return a count of contacts in a list defined by any available searches or filters. With no searches or filters this will be a count of all contacts on the deployment.
     * 
     * ...
     * https://api.accelo.com/docs/?http#count-contacts
     * ...
     * 
     * @param {object} [filters] An object containing filter names and values to be filtered
     * @param {string} [search] A search string to match object against
     * 
     * @returns {CountObj}
     */
    'count': function (filters, search) {
      payload = {
        '_fields': fields,
        '_filters': filters,
        '_search': search
      };
      var params = Accelo.params('post', payload);

      var response = UrlFetchApp.fetch(`https://${acceloDomain}.api.accelo.com/api/v0/contacts/count?_method=get`, params);
      var text = response.getContentText();
      var data = JSON.parse(text).response;

      return data;
    },
    /**
     * This request updates and returns a contact in the Accelo deployment, identified by its contact_id. Recall that affiliations hold contact information (address, phone numbers etc.) for a contact, so if you wish to update these fields, or do not see the field you are after here, you may need to look at the affiliation object.
     * 
     * ...
     * The following fields from the activity object may be updated through this request:
     * 
     * firstname
     * middlename
     * surname
     * username - The contact's new username, this must be a unique username, otherwise an invalid request will be returned.
     * password - The contact's new password for the Accelo deployment. This field is write only.
     * title
     * comments
     * status - Must point to a valid status_id, otherwise an invalid request will be returned.
     * standing - Please only send one of status or standing, it both are sent the standing of the linked status object will dominate anything sent through this field.
     * 
     * https://api.accelo.com/docs/?http#update-a-contact
     * ...
     * 
     * @param {string|number} id The unique ID of the object.
     * @param {object} payload JSON object of object's fields to update.
     * @param {string} [fields] An array of the desired fields and linked objects
     * 
     * @returns {ContactObj}
     */
    'update': function (id, payload, fields) {
      var params = Accelo.params('put', payload);

      var response = UrlFetchApp.fetch(`https://${acceloDomain}.api.accelo.com/api/v0/contacts/${id}?_fields=${fields}`, params);
      var text = response.getContentText();
      var data = JSON.parse(text).response;

      return data;
    },
    /**
     * This request creates a new company on the Accelo deployment, and returns it.
     * 
     * ...
     * Values for the following fields may be set through this request:
     * 
     * company_id - Must point to a valid company. This is the company the new affiliated contact will be associated with.
     * country_id - Must point to a valid country
     * physical_address_id - Must point to a valid address.
     * postal_address_id - Must point to a valid address.
     * phone - The contact's phone number in their role in the associated company. For example, their work number.
     * fax - As for phone but a fax number.
     * email - As for phone but an email address. Must be a valid email address.
     * position - The contact's position in the associated company.
     * communication - As in the affiliation object
     * invoice_method - As in the affiliation object
     * 
     * https://api.accelo.com/docs/?http#create-a-contact
     * ...
     * 
     * @param {object} payload JSON object with fields to create object
     * @param {string} [fields] An array of the desired fields and linked objects
     * 
     * @returns {ContactObj}
     */
    'create': function (payload, fields) {
      var params = Accelo.params('post', payload);

      var response = UrlFetchApp.fetch(`https://${acceloDomain}.api.accelo.com/api/v0/contacts?_fields=${fields}`, params);
      var text = response.getContentText();
      var data = JSON.parse(text).response;

      return data;
    },
    /**
     * This request sets a contact on the Accelo deployment, identified by its contact_id, to inactive. This request does NOT delete the contact, a user can only be removed from the web deployment, see the support documentation for information. This request accepts no parameters and only returns the meta object.
     * 
     * ...
     * The following fields from the activity object may be updated through this request:
     * 
     * firstname
     * middlename
     * surname
     * username - The contact's new username, this must be a unique username, otherwise an invalid request will be returned.
     * password - The contact's new password for the Accelo deployment. This field is write only.
     * title
     * comments
     * status - Must point to a valid status_id, otherwise an invalid request will be returned.
     * standing - Please only send one of status or standing, it both are sent the standing of the linked status object will dominate anything sent through this field.
     * 
     * https://api.accelo.com/docs/?http#update-a-contact
     * ...
     * 
     * @param {string|number} id The unique ID of the object.
     * @param {object} payload JSON object of object's fields to update.
     * @param {string} [fields] An array of the desired fields and linked objects
     * 
     * @returns {ContactObj}
     */
    'deactivate': function (id) {
      var params = Accelo.params('delete');

      var response = UrlFetchApp.fetch(`https://${acceloDomain}.api.accelo.com/api/v0/contacts/${id}`, params);
      var text = response.getContentText();
      var data = JSON.parse(text);

      return data;
    }
  },
  'issues': {
    /**
     * This request returns a single issue, identified by its issueId.
     * 
     * ...
     * https://api.accelo.com/docs/?http#get-issue
     * ...
     * 
     * @param {string|number} id The unique identifier of the affiliation
     * @param {string} [fields] Specify fields to return.
     * 
     * @returns {IssueObj}
     */
    'get': function (id, fields) {
      var params = Accelo.params();

      var response = UrlFetchApp.fetch(`https://${acceloDomain}.api.accelo.com/api/v0/issues/${id}?_fields=${fields}`, params);
      var text = response.getContentText();
      var data = JSON.parse(text).response;

      return data;
    },
    /**
     * This request returns a list of issue objects on the deployment.
     * 
     * ...
     * https://api.accelo.com/docs/?http#list-issues
     * ...
     * 
     * @param {string} [fields] An string of the desired fields and linked objects, separated by commas
     * @param {object} [filters] An object containing filter names and values to be filtered
     * @param {string} [search] A search string to match object against
     * 
     * @returns {IssueObj[]}
     */
    'list': function (fields, filters, search) {
      payload = {
        '_filters': filters,
        '_fields': fields,
        '_search': search
      };
      var params = Accelo.params('post', payload);

      var page = 0;
      var results = 50;
      var data = [];

      while (results == 50) {
        var response = UrlFetchApp.fetch(`https://${acceloDomain}.api.accelo.com/api/v0/issues?_method=get&_limit=50&_page=${page}`, params);
        var text = response.getContentText();
        var items = JSON.parse(text).response;

        items.forEach((item) => data.push(item));
        results = items.length;
        page++;
      };

      return data;
    },
    /**
     * This request will return a count of issues in a list defined by any available searches or filters. With no searches or filters this will be a count of all issues on the deployment.
     * 
     * ...
     * https://api.accelo.com/docs/?http#count-issues
     * ...
     * 
     * @param {object} [filters] An object containing filter names and values to be filtered
     * @param {string} [search] A search string to match object against
     * 
     * @returns {CountObj}
     */
    'count': function (filters, search) {
      payload = {
        '_fields': fields,
        '_filters': filters,
        '_search': search
      };
      var params = Accelo.params('post', payload);

      var response = UrlFetchApp.fetch(`https://${acceloDomain}.api.accelo.com/api/v0/issues/count?_method=get`, params);
      var text = response.getContentText();
      var data = JSON.parse(text).response;

      return data;
    },
    /**
     * This request updates and returns an issue object, identified by its issueId.
     * 
     * ...
     * The following fields from the activity object may be updated through this request:
     * 
     * description
     * against_id - Note: If supplied, you must also supply an against_type.
     * against_type - Note: If supplied, you must also supply an against_id.
     * class_id - Must point to a valid issue class. You may retrieve a list of classes through GET /issues/classes.
     * affiliation_id
     * date_started
     * date_due
     * assignee - A staff_id, must point to a valid staff member. The staff will be assigned and informed of this assigned issue.
     * priority_id - The priority object's id. For available priorities see GET /issues/priorities
     * status_id - Must point to a valid issue status. Should not be sent in conjunction with standing, otherwise standing will take priority. You may retrieve a list of statuses through GET /issues/statuses. If you have a status_id, please use this instead of standing. standing will be used to guess the status, thus, status_id is more precise. Warning this will bypass any progressions and should only be used deliberately when automating tasks.
     * standing - The standing you want to change the issue to (e.g, 'submitted', 'open', 'resolved', 'closed', or 'inactive'). Warning this will bypass any progressions and should only be used deliberately when automating tasks.
     * resolution_id - The identifier of the issue resolution. The resolution will only show if the issue's standing is resolved. This must point to a valid resolution, you may retrieve a list of resolutions through GET /issues/resolutions.
     * resolution_detail - The details of any resolution. To clear the resolution_detail you may send this field with no value.
     * contract_id - The id of the contract the issue is under, if this field is empty, the contract_id will be unset. This must point to a related contract, you can use the is_related_to_issue filter on GET /contracts to find related contracts.
     * 
     * https://api.accelo.com/docs/?http#update-an-issue
     * ...
     * 
     * @param {string|number} id The unique ID of the object.
     * @param {object} payload JSON object of object's fields to update.
     * @param {string} [fields] An array of the desired fields and linked objects
     * 
     * @returns {IssueObj}
     */
    'update': function (id, payload, fields) {
      var params = Accelo.params('put', payload);

      var response = UrlFetchApp.fetch(`https://${acceloDomain}.api.accelo.com/api/v0/issues/${id}?_fields=${fields}`, params);
      var text = response.getContentText();
      var data = JSON.parse(text).response;

      return data;
    },
    /**
     * This request creates and returns an issue.
     * 
     * ...
     * Values for the following fields may be set through this request:
     * 
     * title
     * type_id - Must point to a valid issue type. You may retrieve a list of types through GET /issues/types.
     * against_type - Must be a valid type of object.
     * against_id - Must point to a valid object of type against_type.
     * standing - Must be a valid standing. (e.g, 'submitted', 'open', 'resolved', 'closed', or 'inactive'). If you have a status_id, please use this instead of standing. standing will be used to guess the status, thus, status_id is more precise.
     * status_id - Must point to a valid issue status. Should not be sent in conjunction with standing, otherwise standing will take priority. You may retrieve a list of statuses through GET /issues/statuses.
     * affiliation_id
     * date_started
     * date_due
     * description
     * class_id - Must point to a valid issue class. You may retrieve a list of classes through GET /issues/classes
     * assignee - A staff_id, must point to a valid staff member.
     * priority_id - The priority object's id. For available priorities see GET /issues/priorities
     * 
     * https://api.accelo.com/docs/?http#create-an-issue
     * ...
     * 
     * @param {object} payload JSON object with fields to create object
     * @param {string} [fields] An array of the desired fields and linked objects
     * 
     * @returns {IssueObj}
     */
    'create': function (payload, fields) {
      var params = Accelo.params('post', payload);

      var response = UrlFetchApp.fetch(`https://${acceloDomain}.api.accelo.com/api/v0/issues?_fields=${fields}`, params);
      var text = response.getContentText();
      var data = JSON.parse(text).response;

      return data;
    },
    'profiles': {
      'values': {
        /**
         * This request returns a list of profile values for the given issue identified by id.
         * 
         * ...
         * https://api.accelo.com/docs/?http#list-an-issue-39-s-profile-field-values
         * ...
         * 
         * @param {string|number} id The unique identifier of the affiliation
         * @param {string} [fields] Specify fields to return.
         * 
         * @returns {ProfileValueObj[]}
         */
        'get': function (id, fields) {
          return Accelo.profiles.values.get('issues', id, fields);
        },
        /**
         * This request returns a list of profile values for the given issue.
         * 
         * ...
         * https://api.accelo.com/docs/?http#list-profile-values
         * ...
         * 
         * @param {string} [fields] An string of the desired fields and linked objects, separated by commas
         * @param {object} [filters] An object containing filter names and values to be filtered
         * @param {string} [search] A search string to match object against
         * 
         * @returns {ProfileValueObj[]}
         */
        'list': function (fields, filters, search) {
          return Accelo.profiles.values.list('issues', fields, filters, search);
        },
        /**
         * This request updates and returns a profile value, specified by its profile_value_id, of a particular issue, specified by its issueId.
         * 
         * ...
         * The following fields from the activity object may be updated through this request:
         * 
         * value_int - If field_type is "integer", update the value with this integer.
         * value_date - If field_type is "date", update the value with this string. This field supports values as both unix timestamps and in ISO8601 form, for ease of readability we recommend ISO8601.
         * value_id - If field_type is "lookup", update the value with this integer, representing an object id.
         * value_type - If field_type is "lookup", update the value_type with this string.
         * value - If field_type is none of the above, update the value with this string.
         * 
         * https://api.accelo.com/docs/?http#update-a-profile-value
         * ...
         * 
         * @param {string|number} issueId The unique ID of the issue.
         * @param {string|number} profile_value_id The unique ID of the profile value.
         * @param {object} payload JSON object of object's fields to update.
         * @param {string} [fields] An array of the desired fields and linked objects
         * 
         * @returns {ProfileValueObj}
         */
        'update': function (issueId, profile_value_id, payload, fields) {
          return Accelo.profiles.values.update('issues', issueId, profile_value_id, payload, fields);
        },
        /**
         * This request sets and returns a profile value for a profile field, specified by its profile_field_id. The issue whose profile field is to be update is identified by issueId.
         * 
         * ...
         * Values for the following fields may be set through this request:
         * 
         * value_int - If field_type is "integer", update the value with this integer.
         * value_date - If field_type is "date", update the value with this string. This field supports values as both unix timestamps and in ISO8601 form, for ease of readability we recommend ISO8601.
         * value_id - If field_type is "lookup", update the value with this integer, representing an object id.
         * value_type - If field_type is "lookup", update the value_type with this string.
         * value - If field_type is none of the above, update the value with this string.
         * 
         * https://api.accelo.com/docs/?http#create-a-profile-value
         * ...
         * 
         * @param {string|number} issueId The unique ID of the issue.
         * @param {string|number} profile_field_id The unique ID of the profile field for which to create a value.
         * @param {object} payload JSON object with values for new profile value.
         * @param {string} [fields] An array of the desired fields and linked objects.
         * 
         * @returns {ProfileValueObj}
         */
        'create': function (issueId, profile_field_id, payload, fields) {
          return Accelo.profiles.values.create('issues', issueId, profile_field_id, payload, fields);
        }
      },
      'fields': {
        /**
         * This request returns a list of all profile field values on issues. This is the request GET /{object}/profiles/values, where the object is "issues".
         * 
         * ...
         * https://api.accelo.com/docs/?http#list-profile-values
         * ...
         * 
         * @param {string} [fields] An string of the desired fields and linked objects, separated by commas
         * @param {object} [filters] An object containing filter names and values to be filtered
         * 
         * @returns {ProfileFieldObj[]}
         */
        'list': function (fields, filters) {
          return Accelo.profiles.fields.list('issues', fields, filters);
        }
      }
    },
    'extensions': {

      'values': {

        'get': function () {

        },

        'list': function () {

        },

        'update': function () {

        }

      },

      'fields': {

        'list': function () {

        },

        'update': function () {

        }
      }
    }

  },
  'profiles': {
    'values': {
      /**
       * This request returns a list of profile values for the given object of identified by object_id.
       * 
       * ...
       * https://api.accelo.com/docs/?http#list-an-issue-39-s-profile-field-values
       * ...
       * 
       * @param {string} object Name of the object type (e.g. "issues", "companies", etc.)
       * @param {string|number} id The unique identifier of the affiliation
       * @param {string} [fields] Specify fields to return.
       * 
       * @returns {ProfileValueObj[]}
       */
      'get': function (object, id, fields) {
        var params = Accelo.params();

        var response = UrlFetchApp.fetch(`https://${acceloDomain}.api.accelo.com/api/v0/${object}/${id}/profiles/values?_fields=${fields}`, params);
        var text = response.getContentText();
        var data = JSON.parse(text).response;

        return data;
      },
      /**
       * This request returns a list of profile values for the given object.
       * 
       * ...
       * https://api.accelo.com/docs/?http#list-profile-values
       * ...
       * 
       * @param {string} object Name of the object type (e.g. "issues", "companies", etc.)
       * @param {string} [fields] An string of the desired fields and linked objects, separated by commas
       * @param {object} [filters] An object containing filter names and values to be filtered
       * @param {string} [search] A search string to match object against
       * 
       * @returns {ProfileValueObj[]}
       */
      'list': function (object, fields, filters, search) {
        payload = {
          '_filters': filters,
          '_fields': fields,
          '_search': search
        };
        var params = Accelo.params('post', payload);

        var page = 0;
        var results = 50;
        var data = [];

        while (results == 50) {
          var response = UrlFetchApp.fetch(`https://${acceloDomain}.api.accelo.com/api/v0/${object}/profiles/values?_method=get&_limit=50&_page=${page}`, params);
          var text = response.getContentText();
          var items = JSON.parse(text).response;

          items.forEach((item) => data.push(item));
          results = items.length;
          page++;
        };

        return data;
      },
      /**
       * This request updates and returns a profile value, specified by its profile_value_id, of a particular object, specified by its object_id, of a particular type, specified by object.
       * 
       * ...
       * The following fields from the activity object may be updated through this request:
       * 
       * value_int - If field_type is "integer", update the value with this integer.
       * value_date - If field_type is "date", update the value with this string. This field supports values as both unix timestamps and in ISO8601 form, for ease of readability we recommend ISO8601.
       * value_id - If field_type is "lookup", update the value with this integer, representing an object id.
       * value_type - If field_type is "lookup", update the value_type with this string.
       * value - If field_type is none of the above, update the value with this string.
       * 
       * https://api.accelo.com/docs/?http#update-a-profile-value
       * ...
       * 
       * @param {string} object Name of the object type (e.g. "issues", "companies", etc.)
       * @param {string|number} object_id The unique ID of the object.
       * @param {string|number} profile_value_id The unique ID of the profile value.
       * @param {object} payload JSON object of object's fields to update.
       * @param {string} [fields] An array of the desired fields and linked objects
       * 
       * @returns {ProfileValueObj}
       */
      'update': function (object, object_id, profile_value_id, payload, fields) {
        var params = Accelo.params('put', payload);

        var response = UrlFetchApp.fetch(`https://${acceloDomain}.api.accelo.com/api/v0/${object}/${object_id}/profiles/values/${profile_value_id}?_fields=${fields}`, params);
        var text = response.getContentText();
        var data = JSON.parse(text).response;

        return data;
      },
      /**
       * This request sets and returns a profile value for a profile field, specified by its profile_field_id. The object whose profile field is to be update is identified by object_id and object.
       * 
       * ...
       * Values for the following fields may be set through this request:
       * 
       * value_int - If field_type is "integer", update the value with this integer.
       * value_date - If field_type is "date", update the value with this string. This field supports values as both unix timestamps and in ISO8601 form, for ease of readability we recommend ISO8601.
       * value_id - If field_type is "lookup", update the value with this integer, representing an object id.
       * value_type - If field_type is "lookup", update the value_type with this string.
       * value - If field_type is none of the above, update the value with this string.
       * 
       * https://api.accelo.com/docs/?http#create-a-profile-value
       * ...
       * 
       * @param {string} object Name of the object type (e.g. "issues", "companies", etc.)
       * @param {string|number} object_id The unique ID of the object.
       * @param {string|number} profile_field_id The unique ID of the profile field for which to create a value.
       * @param {object} payload JSON object with values for new profile value.
       * @param {string} [fields] An array of the desired fields and linked objects.
       * 
       * @returns {ProfileValueObj}
       */
      'create': function (object, object_id, profile_field_id, payload, fields) {
        var params = Accelo.params('post', payload);

        var response = UrlFetchApp.fetch(`https://${acceloDomain}.api.accelo.com/api/v0/${object}/${object_id}/profiles/fields/${profile_field_id}?_fields=${fields}`, params);
        var text = response.getContentText();
        var data = JSON.parse(text).response;

        return data;
      }
    },
    'fields': {
      /**
       * This request returns a list of profile fields available for the given object.
       * 
       * ...
       * https://api.accelo.com/docs/?http#list-profile-values
       * ...
       * 
       * @param {string} object Name of the object type (e.g. "issues", "companies", etc.)
       * @param {string} [fields] An string of the desired fields and linked objects, separated by commas
       * @param {object} [filters] An object containing filter names and values to be filtered
       * 
       * @returns {ProfileFieldObj[]}
       */
      'list': function (object, fields, filters) {
        payload = {
          '_filters': filters,
          '_fields': fields
        };
        var params = Accelo.params('post', payload);

        var page = 0;
        var results = 50;
        var data = [];

        while (results == 50) {
          var response = UrlFetchApp.fetch(`https://${acceloDomain}.api.accelo.com/api/v0/${object}/profiles/fields?_method=get&_limit=50&_page=${page}`, params);
          var text = response.getContentText();
          var items = JSON.parse(text).response;

          items.forEach((item) => data.push(item));
          results = items.length;
          page++;
        };

        return data;
      }
    }
  },
  'requests': {
    /**
     * This request returns a request specified by its requestId.
     * 
     * ...
     * https://api.accelo.com/docs/?http#get-request
     * ...
     * 
     * @param {string|number} id The unique identifier of the object
     * @param {string} [fields] Specify fields to return.
     * 
     * @returns {RequestObj}
     */
    'get': function (id, fields) {
      var params = Accelo.params();

      var response = UrlFetchApp.fetch(`https://${acceloDomain}.api.accelo.com/api/v0/requests/${id}?_fields=${fields}`, params);
      var text = response.getContentText();
      var data = JSON.parse(text).response;

      return data;
    },
    /**
     * This request returns a list of requests on the deployment.
     * 
     * ...
     * https://api.accelo.com/docs/?http#list-requests
     * ...
     * 
     * @param {string} [fields] An string of the desired fields and linked objects, separated by commas
     * @param {object} [filters] An object containing filter names and values to be filtered
     * @param {string} [search] A search string to match object against
     * 
     * @returns {RequestObj[]}
     */
    'list': function (fields, filters, search) {
      payload = {
        '_filters': filters,
        '_fields': fields,
        '_search': search
      };
      var params = Accelo.params('post', payload);

      var page = 0;
      var results = 50;
      var data = [];

      while (results == 50) {
        var response = UrlFetchApp.fetch(`https://${acceloDomain}.api.accelo.com/api/v0/requests?_method=get&_limit=50&_page=${page}`, params);
        var text = response.getContentText();
        var items = JSON.parse(text).response;

        items.forEach((item) => data.push(item));
        results = items.length;
        page++;
      };

      return data;
    },
    /**
     * This request will return a count of requests in a list defined by any available searches or filters. With no searches or filters this will be a count of all requests on the deployment.
     * 
     * ...
     * https://api.accelo.com/docs/?http#count-requests
     * ...
     * 
     * @param {object} [filters] An object containing filter names and values to be filtered
     * @param {string} [search] A search string to match object against
     * 
     * @returns {CountObj}
     */
    'count': function (filters, search) {
      payload = {
        '_fields': fields,
        '_filters': filters,
        '_search': search
      };
      var params = Accelo.params('post', payload);

      var response = UrlFetchApp.fetch(`https://${acceloDomain}.api.accelo.com/api/v0/requests/count?_method=get`, params);
      var text = response.getContentText();
      var data = JSON.parse(text).response;

      return data;
    },
    /**
     * This request updates and returns an issue object, identified by its issueId.
     * 
     * ...
     * The following fields from the activity object may be updated through this request:
     * 
     * title
     * body
     * type_id
     * affiliation_id
     * priority_id
     * source
     * standing
     * claimer_id
     * 
     * https://api.accelo.com/docs/?http#update-a-request
     * ...
     * 
     * @param {string|number} id The unique ID of the object.
     * @param {object} payload JSON object of object's fields to update.
     * @param {string} [fields] An array of the desired fields and linked objects
     * 
     * @returns {RequestObj}
     */
    'update': function (id, payload, fields) {
      var params = Accelo.params('put', payload);

      var response = UrlFetchApp.fetch(`https://${acceloDomain}.api.accelo.com/api/v0/requests/${id}?_fields=${fields}`, params);
      var text = response.getContentText();
      var data = JSON.parse(text).response;

      return data;
    },
    /**
     * This request creates and returns an issue.
     * 
     * ...
     * Values for the following fields may be set through this request:
     * 
     * title
     * body
     * type_id
     * affiliation_id - If an affiliation_id is not available please follow the proceeding steps.
     * priority_id
     * source
     * lead_id
     * 
     * If no affiliation data is available we will attempt to link the given data to a known affiliation, otherwise we will create one. 
     * 
     * https://api.accelo.com/docs/?http#create-a-request
     * ...
     * 
     * @param {object} payload JSON object with fields to create object
     * @param {string} [fields] An array of the desired fields and linked objects
     * 
     * @returns {RequestsObj}
     */
    'create': function (payload, fields) {
      var params = Accelo.params('post', payload);

      var response = UrlFetchApp.fetch(`https://${acceloDomain}.api.accelo.com/api/v0/requests?_fields=${fields}`, params);
      var text = response.getContentText();
      var data = JSON.parse(text).response;

      return data;
    },
    'threads': {
      /**
       * This request returns a list of request threads on the deployment.
       * 
       * ...
       * https://api.accelo.com/docs/?http#list-request-threads
       * ...
       * 
       * @param {string} [fields] An string of the desired fields and linked objects, separated by commas
       * @param {object} [filters] An object containing filter names and values to be filtered
       * 
       * @returns {RequestThreadsObj}
       */
      'list': function (fields, filters) {
        payload = {
          '_filters': filters,
          '_fields': fields
        };
        var params = Accelo.params('post', payload);

        var page = 0;
        var results = 50;
        var data = [];

        while (results == 50) {
          var response = UrlFetchApp.fetch(`https://${acceloDomain}.api.accelo.com/api/v0/requests/threads?_method=get&_limit=50&_page=${page}`, params);
          var text = response.getContentText();
          var items = JSON.parse(text).response;

          items.forEach((item) => data.push(item));
          results = items.length;
          page++;
        };

        return data;
      }
    }

  },
  'staff': {
    /**
     * This requests returns a staff member, specified by their staff_id.
     * 
     * ...
     * https://api.accelo.com/docs/?shell#get-staff
     * ...
     * 
     * @param {string|number} id The unique identifier of the object.
     * @param {string} [fields] Specify fields to return.
     * 
     * @returns {StaffObj}
     */
    'get': function (id, fields) {
      var params = Accelo.params();

      var response = UrlFetchApp.fetch(`https://${acceloDomain}.api.accelo.com/api/v0/staff/${id}?_fields=${fields}`, params);
      var text = response.getContentText();
      var data = JSON.parse(text).response;

      return data;
    },
    /**
     * This request returns a list of staff members on the deployment.
     * 
     * ...
     * https://api.accelo.com/docs/?shell#list-staff
     * ...
     * 
     * @param {string} [fields] An string of the desired fields and linked objects, separated by commas
     * @param {object} [filters] An object containing filter names and values to be filtered
     * 
     * @returns {StaffObj[]}
     */
    'list': function (fields, filters) {
      payload = {
        '_filters': filters,
        '_fields': fields
      };
      var params = Accelo.params('post', payload);

      var page = 0;
      var results = 50;
      var data = [];

      while (results == 50) {
        var response = UrlFetchApp.fetch(`https://${acceloDomain}.api.accelo.com/api/v0/staff?_method=get&_limit=50&_page=${page}`, params);
        var text = response.getContentText();
        var items = JSON.parse(text).response;

        items.forEach((item) => data.push(item));
        results = items.length;
        page++;
      };

      return data;
    },
    /**
     * This request will return a count of staff in a list defined by any available searches or filters. With no searches or filters this will be a count of all staff on the deployment.
     * 
     * ...
     * https://api.accelo.com/docs/?shell#count-staff
     * ...
     * 
     * @param {object} [filters] An object containing filter names and values to be filtered
     * @param {string} [search] A search string to match object against
     * 
     * @returns {CountObj}
     */
    'count': function (filters, search) {
      payload = {
        '_fields': fields,
        '_filters': filters,
        '_search': search
      };
      var params = Accelo.params('post', payload);

      var response = UrlFetchApp.fetch(`https://${acceloDomain}.api.accelo.com/api/v0/staff/count?_method=get`, params);
      var text = response.getContentText();
      var data = JSON.parse(text).response;

      return data;
    },
    /**
     * This request updates and returns a staff member, identified by their staff_id.
     * 
     * ...
     * The following fields from the activity object may be updated through this request:
     * 
     * firstname
     * surname
     * title
     * email
     * fax
     * phone
     * mobile
     * position
     * 
     * https://api.accelo.com/docs/?shell#update-a-staff-member
     * ...
     * 
     * @param {string|number} id The unique ID of the object.
     * @param {object} payload JSON object of object's fields to update.
     * @param {string} [fields] An array of the desired fields and linked objects
     * 
     * @returns {StaffObj}
     */
    'update': function (id, payload, fields) {
      var params = Accelo.params('put', payload);

      var response = UrlFetchApp.fetch(`https://${acceloDomain}.api.accelo.com/api/v0/staff/${id}?_fields=${fields}`, params);
      var text = response.getContentText();
      var data = JSON.parse(text).response;

      return data;
    },
    /**
     * This request creates and returns a new staff member.
     * 
     * ...
     * Values for the following fields may be set through this request:
     * 
     * username
     * password - A password for the new staff member on the deployment.
     * firstname
     * surname
     * title
     * email
     * fax
     * phone
     * mobile
     * position
     * 
     * https://api.accelo.com/docs/?shell#create-a-staff-member
     * ...
     * 
     * @param {object} payload JSON object with fields to create object
     * @param {string} [fields] An array of the desired fields and linked objects
     * 
     * @returns {StaffObj}
     */
    'create': function (payload, fields) {
      var params = Accelo.params('post', payload);

      var response = UrlFetchApp.fetch(`https://${acceloDomain}.api.accelo.com/api/v0/staff?_fields=${fields}`, params);
      var text = response.getContentText();
      var data = JSON.parse(text).response;

      return data;
    }
  },
  'tasks': {
    /**
     * This request returns a single task, identified by its task_id.
     * 
     * ...
     * https://api.accelo.com/docs/?shell#get-task
     * ...
     * 
     * @param {string|number} id The unique identifier of the object
     * @param {string} [fields] Specify fields to return.
     * 
     * @returns {TaskObj}
     */
    'get': function (id, fields) {
      var params = Accelo.params();

      var response = UrlFetchApp.fetch(`https://${acceloDomain}.api.accelo.com/api/v0/tasks/${id}?_fields=${fields}`, params);
      var text = response.getContentText();
      var data = JSON.parse(text).response;

      return data;
    },
    /**
     * This request returns a list of tasks on the deployment.
     * 
     * ...
     * https://api.accelo.com/docs/?shell#list-tasks
     * ...
     * 
     * @param {string} [fields] An string of the desired fields and linked objects, separated by commas
     * @param {object} [filters] An object containing filter names and values to be filtered
     * @param {string} [search] A search string to match object against
     * 
     * @returns {TaskObj[]}
     */
    'list': function (fields, filters, search) {
      payload = {
        '_filters': filters,
        '_fields': fields,
        '_search': search
      };
      var params = Accelo.params('post', payload);

      var page = 0;
      var results = 50;
      var data = [];

      while (results == 50) {
        var response = UrlFetchApp.fetch(`https://${acceloDomain}.api.accelo.com/api/v0/tasks?_method=get&_limit=50&_page=${page}`, params);
        var text = response.getContentText();
        var items = JSON.parse(text).response;

        items.forEach((item) => data.push(item));
        results = items.length;
        page++;
      };

      return data;
    },
    /**
     * This request will return a count of tasks in a list defined by any available searches or filters. With no searches or filters this will be a count of all tasks on the deployment.
     * 
     * ...
     * https://api.accelo.com/docs/?shell#count-tasks
     * ...
     * 
     * @param {object} [filters] An object containing filter names and values to be filtered
     * @param {string} [search] A search string to match object against
     * 
     * @returns {CountObj}
     */
    'count': function (filters, search) {
      payload = {
        '_fields': fields,
        '_filters': filters,
        '_search': search
      };
      var params = Accelo.params('post', payload);

      var response = UrlFetchApp.fetch(`https://${acceloDomain}.api.accelo.com/api/v0/tasks/count?_method=get`, params);
      var text = response.getContentText();
      var data = JSON.parse(text).response;

      return data;
    },
    /**
     * This request updates and return a task on the deployment.
     * 
     * ...
     * The following fields from the activity object may be updated through this request:
     * 
     * title
     * description
     * assignee_id
     * affiliation_id
     * manager_id
     * type_id
     * rate_id
     * rate_charged
     * date_due
     * remaining
     * 
     * https://api.accelo.com/docs/?shell#update-a-task
     * ...
     * 
     * @param {string|number} id The unique ID of the object.
     * @param {object} payload JSON object of object's fields to update.
     * @param {string} [fields] An array of the desired fields and linked objects
     * 
     * @returns {TaskObj}
     */
    'update': function (id, payload, fields) {
      var params = Accelo.params('put', payload);

      var response = UrlFetchApp.fetch(`https://${acceloDomain}.api.accelo.com/api/v0/tasks/${id}?_fields=${fields}`, params);
      var text = response.getContentText();
      var data = JSON.parse(text).response;

      return data;
    },
    /**
     * This request creates and returns a task.
     * 
     * ...
     * Values for the following fields may be set through this request:
     * 
     * title
     * against_id - Must point to a valid object.
     * against_type - Must point to a valid object type.
     * date_started
     * description
     * status_id - The status_id for the initial status. You may retrieve a list of statuses for tasks if required.
     * manager_id - The staff_id for the staff to be assigned manager.
     * assignee_id - The staff_id for the staff to be assigned to the task.
     * affiliation_id - The affiliation_id for the affiliation to be associated with the task.
     * date_due
     * remaining - The field budgeted will be automatically updated with this value upon creation.
     * rate_id - Only available if the task is against a "job" or "milestone". The rate_id of the rate for this task.
     * rate_charged - Only available if the task is against a "job" or "milestone". The rate charged for work on this task, as a decimal.
     * is_billable - Only available if the task is against a "job" or "milestone". Whether this task is billable, may either by "yes" or "no".
     * 
     * https://api.accelo.com/docs/?shell#create-a-task
     * ...
     * 
     * @param {object} payload JSON object with fields to create object
     * @param {string} [fields] An array of the desired fields and linked objects
     * 
     * @returns {TaskObj}
     */
    'create': function (payload, fields) {
      var params = Accelo.params('post', payload);

      var response = UrlFetchApp.fetch(`https://${acceloDomain}.api.accelo.com/api/v0/tasks?_fields=${fields}`, params);
      var text = response.getContentText();
      var data = JSON.parse(text).response;

      return data;
    }
  }
}