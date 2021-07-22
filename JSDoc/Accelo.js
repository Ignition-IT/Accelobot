// ActivityObj
/**
 * @typedef ActivityObj
 * @property {string} id The activity's unique identifier.
 * @property {string} subject String describing the content of the activity.
 * @property {number} confidential The flag indicates whether the activity has been marked as confidential to the current user. Confidential activities are returned but the content of the subject and body is replaced with a confidential placeholder. You can use this flag to determine whether or not the content has been covered up. If 1, then it has been replaced and the subject and body will be something like "Confidential activity sent to: Bob, Alice". Otherwise 0 indicates the body and subject are returned in full. Don't confuse this with the "visibility" attribute.
 * @property {string} parent_id The unique identifier of the parent activity, returns "0" if the activity has no parent.
 * @property {string} thread If the activity is part of the response set to another activity, this will be a string describing the original activity, as outlined below e.g. "activity/346". Otherwise this will be the current activity.
 * @property {string} parent API URI of the parent activity object of the request activity, returns "/activities/0" if the activity has no parent. Example "/activities/347"
 * @property {string} thread_id The unique identifier of the thread activity.
 * @property {string} against_type The type of the object that the activity is against.
 * @property {string} against_id The unique identifier of the object the activity is against.
 * @property {string} against API URI of the object the activity is against.
 * @property {string} owner_type The type of the owner object of the activity.
 * @property {string} owner_id The unique identifier of the owner object of the activity.
 * @property {string} owner API URI of the object representing the owner of the activity.
 * @property {string} medium The activity medium.
 * @property {string} body The main plaintext content of the activity.
 * @property {string} preview_body A preview of the plaintext body. This is the first 250 characters only.
 * @property {string} html_body The main content of the activity as HTML. For example, for plain text activities, newlines will be replaced with line breaks (<br>). For rich text activities, complete HTML will be returned.
 * @property {string} visibility The activity visibility.
 * @property {string} details Additional details assigned to an activity. For meetings and postals this is used to store the location/address. For calls this is used to store the number.
 * @property {string} date_created The date the activity was created.
 * @property {string} date_started The date the activity was started. For meetings this is the scheduled start date of the meeting, for other activities it is the date time was logged, returns null otherwise.
 * @property {string} date_ended For meetings, the scheduled end date of the meeting.
 * @property {string} date_logged Read only takes the value of date_started, if this is not set then it takes the value of date_created.
 * @property {string} date_modified The date the event was last modified.
 * @property {string} billable Amount of billable time logged for the activity, in seconds.
 * @property {string} nonbillable Amount of non-billable time logged for the activity, in seconds.
 * @property {StaffObj} staff The staff member that has logged time on the event.
 * @property {ActivityClassObj} activity_class The activity's class. The default is "1".
 * @property {ActivityPriorityObj} activity_priority The priority of the activity.
 * @property {TaskObj} task The task the activity is against. Returns null if there is no task against the activity.
 * @property {TimeAllocationObj} time_allocation The time allocation for the activity.
 * @property {RateObj} rate The rate charged for any billable time logged against the activity.
 * @property {string} rate_charged The rate at which billable time was charged, this is part of the rate object.
 * @property {NameObj[]} tag A list of tags associated with the activity.
 * @property {string} scheduled Either 'yes' or 'no', whether the activity is scheduled.
 * @property {string} standing The standing of the activity, may be one of "unapproved", "approved", "invoiced", "locked", or empty.
 * @property {string} invoice_id The unique identifier of the invoice the activity is attached to, if any.
 * @property {string} contract_period_id The unique identifier of the contract period the activity is attached to, if any.
 * @property {string} is_billable Either 1 or 0, whether billable time can be logged on the activity.
 * @property {object} permissions An object containing a list of permissions for the current user on the activity.
 * @property {InteractsObj[]} [interacts] An array of interact objects. Only present when _fields=interacts is included.
 */
// ActivitiesInteractsObj
/**
 * @typedef ActivitiesInteractsObj
 * @property {AffiliationObj[]} affiliations List of affiliation objects
 * @property {StaffObj[]} staff List of staff objects
 * @property {ActivityObj[]} activities List of activity objects
 */
// ActivityInteractsObj
/**
 * @typedef ActivityInteractsObj
 * @property {StaffObj[]} staff Array of staff objects that have an interaction against the activity.
 * @property {ContactObj[]} contacts Array of contact objects that have an interaction against the activity.
 */
// InteractsObj
/**
 * @typedef InteractsObj
 * @property {string} id Unique identifier for the interact.
 * @property {string} date_actioned The date the interact actioned the activity (if actioned)
 * @property {string} type The type of the interaction, one of: "creator", "from" "to", "cc", "bcc", "attendee", "did_not_attend"
 * @property {string} owner_id The owner's unique id. This will correspond to the id of either a staff or affiliation object.
 * @property {string} owner_type The type of owner, either "staff" or "affiliation".
 * @property {string} owner_name The firstname and surname of the owner.
 * @property {string} email The e-mail associated with the owner.
 */
// InteractObj
/**
 * @typedef InteractObj
 * @property {string} id The unique identifier of the interaction.
 * @property {string} date_actioned The unix ts date the interact actioned the activity (if actioned).
 * @property {string} type The type of the interaction, one of: "creator", "from" "to", "cc", "bcc", "attendee", "did_not_attend".
 */
// ActivityClassObj
/**
 * @typedef ActivityClassObj
 * @property {string} id A unique identifier for the class.
 * @property {string} title A name for the class.
 * @property {string} parent The unique identifier of the parent class, if there is no parent class this will be "0".
 * @property {string} status The status of the class, either "active" or "inactive".
 */
// ActivityPriorityObj
/**
 * @typedef ActivityPriorityObj
 * @property {string} id A unique identifier for the priority.
 * @property {string} title A name for the priority.
 * @property {number} level A number representing the urgency, by default 1 is "extreme", 5 is "none"
 */
// ActivityThreadObj
/**
 * @typedef ActivityThreadObj
 * @property {string} id The unique activity_id of the original activity in the thread.
 * @property {string} event_text A description of the original activity in the thread, for example "created a note" or "sent an email".
 * @property {ActivityObj[]} activities An array containing the most recent activity in the thread.
 * @property {number} total_activities A count of the number of activities in the thread.
 */
// TimeAllocationObj
/**
 * @typedef TimeAllocationObj
 * @property {string} id A unique identifier for the time allocation.
 * @property {string} against The object the time is logged against, in the form "{object}/{object_id}".
 * @property {string} standing The standing of the logged time.
 * @property {number} billable The amount of billable time logged, in seconds.
 * @property {number} nonbillable The amount of nonbillable time logged, in seconds.
 * @property {number} charged The rate charged for billable work.
 * @property {string} comments Any comments made against the logged time.
 * @property {string} date_locked The date the activity was locked, that is, when the logged time was approved for invoicing.
 * @property {string} date_created The date the time was logged.
 */
// AffiliationObj
/**
 * @typedef AffiliationObj
 * @property {string} id The unique identifier for the affiliation.
 * @property {string} mobile The mobile number of the contact in the role of this affiliation.
 * @property {string} email The email address of the contact in the role of this affiliation.
 * @property {string} fax The fax number of the contact in the role of this affiliation.
 * @property {string} position The contact's position in the company. For example "CEO", "Software Engineer", "Advisor".
 * @property {string} phone The phone number of the contact in the role of this affiliation.
 * @property {AddressObj} postal_address The postal address of the contact in the role of this affiliation.
 * @property {AddressObj} physical_address The physical address of the contact in the role of this affiliation.
 * @property {CompanyObj} company The company that the contact is affiliated with.
 * @property {ContactObj} contact The contact the affiliation is against.
 * @property {string} affiliation_status The contact's status in the role of this affiliation.
 * @property {string} standing The standing of the contact's status. See the status object.
 * @property {string} date_modified The latest date that this affiliation was modified.
 * @property {string} date_last_interacted The latest date that there was interaction with this affiliation.
 * @property {string} staff_bookmarked Whether the current user has bookmarked the affiliation.
 * @property {string} portal_access Whether the affiliation has been granted access to the Client Portal.
 * @property {string} communication Whether or not communications, such as updates, newsletters etc. are sent to this affiliation.
 * @property {string} invoice_method The method the affiliation wishes to receive an invoice.
 */
// CompanyObj
/**
 * @typedef CompanyObj
 * @property {string} id The company's unique identifier.
 * @property {string} name The name of the company.
 * @property {string} custom_id The custom id for the company.
 * @property {string} website The company's website.
 * @property {string} phone A contact phone number for the company.
 * @property {string} fax A fax number for the company.
 * @property {string} date_created The date the company was created on the Accelo deployment.
 * @property {string} date_modified The date the company was last modified on the Accelo deployment.
 * @property {string} date_last_interacted The date the company was last modified on the Accelo deployment.
 * @property {string} comments Any comments or notes made against the company.
 * @property {string} standing The standing of the company, from its status.
 * @property {StatusObj} status The company's status.
 * @property {AddressObj} postal_address The postal address of the company.
 * @property {string} staff_bookmarked Whether the company has been bookmarked by the current user.
 * @property {string} default_affiliation The affiliation_id of the main affiliation associated with this company.
 */
// ContactObj
/**
 * @typedef ContactObj
 * @property {string} id The unique identifier for the contact.
 * @property {string} firstname The contact's first name.
 * @property {string} surname The contact's surname.
 * @property {string} username The contact's Accelo username.
 * @property {string} middlename The contact's middle name.
 * @property {string} title The contact's preferred title. For example "Ms", "Mr", "Dr".
 * @property {string} timezone The contact's timezone.
 * @property {string} date_created The date the contact was added on the Accelo deployment.
 * @property {string} date_modified The date the contact was last modified.
 * @property {string} date_last_interacted The most recent date of interaction with the contact.
 * @property {string} comments Any comments or notes made against the contact.
 * @property {string} default_affiliation The unique identifier of the default affiliation associated with the contact.
 * @property {StatusObj} status The status of the contact.
 * @property {string} standing The contact's standing, this is part of the status object. For example "active", "potential".
 * @property {InteractObj} Activity interact object. Only returned when /activities/{activity_id}/interacts is called.
 */
// IssueObj
/**
 * @typedef IssueObj
 * @property {string} id A unique identifier for the issue.
 * @property {string} title A name for the issue
 * @property {string} custom_id The custom ID for the issue. Only issues whose type allows custom IDs will have a value for this field.
 * @property {string} description A description of the issue.
 * @property {string} against The API URI of the object this issue is against.
 * @property {string} against_type A string representing the type of object this issue is against.
 * @property {string} against_id The unique identifier of the object this issue is against.
 * @property {IssueTypeObj} issue_type The issue type of this issue.
 * @property {AffiliationObj} affiliation The affiliation associated with this issue.
 * @property {IssueClassObj} class The issue class of this issue.
 * @property {PriorityObj} issue_priority The priority of the issue.
 * @property {ResolutionTypeObj} resolution The resolution type used by the issue, if it has been resolved.
 * @property {string} resolution_detail A description of the resolution, if resolved.
 * @property {StatusObj} status The status of the issue.
 * @property {string} standing The standing of the issue, taken from the issue status.
 * @property {string} date_submitted The date the issue was submitted
 * @property {StaffObj} submitted by The staff member who submitted the issue.
 * @property {string} date_opened The date the issue was opened.
 * @property {StaffObj} opened_by The staff member who opened the issue.
 * @property {string} date_resolved If resolved, the date the issue was resolved.
 * @property {StaffObj} resolved_by The staff member who resolved the issue.
 * @property {string} date_closed If closed, the date the issue was closed.
 * @property {StaffObj} closed_by The staff member who closed the issue.
 * @property {string} date_due The due date for the issue.
 * @property {string} date_last_interacted The date the issue was last interacted with.
 * @property {string} date_modified The date the issue was last modified.
 * @property {string} referrer_type If the issue was created from the deployment as a "related issue" to an object, this will be the object's type.
 * @property {string} referrer_id The unique identifier of this related object.
 * @property {string} staff_bookmarked Whether the current viewer has bookmarked the issue.
 * @property {string} billable_seconds The amount of billable time, in seconds, on the issue.
 * @property {CompanyObj} company If against_type is company, the company the issue is against.
 * @property {StaffObj} assignee The staff assigned to the issue.
 * @property {ContractObj} contract If the issue is assigned a contract (retainer), this will return the contract object.
 * @property {BudgetObj} issue_object_budget The object budget associated with the issue.
 */
// PriorityObj
/**
 * @typedef PriorityObj
 * @property {string} id A unique identifier for the priority.
 * @property {string} title A name for the priority.
 * @property {string} color The color of the priority when displayed on the deployment. The colors, in order of increasing urgency a "grey", "blue", "green", "orange", "red".
 * @property {string} factor A number representing the urgency of the priority. 5 is "Extreme", 1 is "None".
 */
// StatusObj
/**
 * @typedef StatusObj
 * @property {string} id A unique identifier for the status.
 * @property {string} title A name for the status.
 * @property {string} standing A string describing the standing of the issue.
 * @property {string} color The color of the status shown on the deployment.
 * @property {string} start Either "yes" or "no", whether an issue may be created with this status.
 * @property {string} ordering A number describing the order of the status on the deployment.
 */
// IssueTypeObj
/**
 * @typedef IssueTypeObj
 * @property {string} id A unique identifier for the issue type.
 * @property {string} title A name for the issue type.
 * @property {string} notes Notes about the issue type.
 * @property {string} parent The unique identifier of the parent issue type. If there is no parent has the value "0"
 * @property {string} standing Either "active" or "inactive", the standing of the issue type.
 * @property {string} budget Either "yes" or "no", whether issues under this type are billable.
 * @property {string} ordering A number describing the type's ordering on the deployment.
 * @property {string} default_class_id The unique identifier of the default issue class for this type of issue. Default is null.
 * @property {string} has_custom_id Either "1" or "0", whether the issue type uses custom ids.
 */
// ResolutionTypeObj
/**
 * @typedef ResolutionTypeObj
 * @property {string} id A unique identifier for the issue resolution.
 * @property {string} title A name for the issue resolution.
 * @property {string} parent The unique identifier of the parent resolution, it there is no parent this has value "0".
 * @property {string} description A generic description of the resolution, may be changed for a given issue.
 * @property {string} report A fixed description of the resolution.
 * @property {string} standing Either "active" or "inactive", the standing of the resolution.
 */
// IssueClassObj
/**
 * @typedef IssueClassObj
 * @property {string} id A unique description for the class.
 * @property {string} title A name for the class.
 * @property {string} description A description of the class.
 * @property {string} parent The unique identifier of the parent class, if there is no parent this has value "0".
 * @property {string} standing Either "active" or "inactive", the standing of the class.
 */
// RequestObj
/**
 * @typedef RequestObj
 * @property {string} id A unique identifier for the request.
 * @property {string} title A name for the request.
 * @property {string} body The body of the request.
 * @property {string} standing The standing of the request ,may be either "pending", "open", "converted", or "closed".
 * @property {string} source Either "email" or null, whether the source of the request was an external email.
 * @property {string} lead_id A unique identifier for the sender, if they are a lead. If a request comes from an unknown sender they will be marked as a "lead".
 * @property {string} thread_id The unique identifier of the activity thread the request is associated with.
 * @property {string} date_created The date the request was created.
 * @property {string} date_modified The date the request was last updated.
 * @property {string} type_id The unique identifier of the request type.
 * @property {RequestTypeObj} type The request type.
 * @property {string} priority_id The unique identifier of the request priority.
 * @property {PriorityObj} request_priority The request priority.
 * @property {string} claimer_id The unique identifier of the staff who has claimed the request.
 * @property {StaffObj} claimer The staff member who has claimed the request.
 * @property {string} affiliation_id The unique identifier of the affiliation associated with the request.
 * @property {AffiliationObj} affiliation The affiliation associated with the request.
 * @property {string} conversion_id The unique identifier of the object that the request was converted to
 * @property {string} conversion_type The object type of the object that the request was converted to
 */
// RequestTypeObj
/**
 * @typedef RequestTypeObj
 * @property {string} id A unique identifier for the request type.
 * @property {string} title A name for the request type.
 * @property {string} standing The standing of the request type, either "active" or "inactive".
 */
// RequestThreadsObj
/**
 * @typedef RequestThreadsObj
 * @property {RequestThreadObj[]} requests An array of request threads
 * @property {object[]} linked_objects An array of objects linked to the requests in the "requests" array
 */
// RequestThreadObj
/**
 * @typedef RequestThreadObj
 * @property {string} thread_id The unique activity_id of the original request.
 * @property {string} id The id of the request.
 * @property {string} title As in the request object.
 * @property {string} body As in the request object.
 * @property {string} standing As in the request object.
 * @property {number} number_of_activities The number of activities in the thread.
 * @property {string} date_created as in the request object.
 * @property {string} date_last_responded The date of the latest response to the request (from either the client or a staff member).
 * @property {string} date_last_external_interaction the date of the last interaction on the request by a client.
 * @property {TypeObj} claimer An object describing the claimer of the request, this object contains a "type" field, describing the type of object, and an "id" field giving its identifier.
 * @property {RequestTypeObj} type The request type of the request.
 * @property {TypeObj[]} senders An array of senders of the original request, each defined by a "type" an an "id".
 * @property {AffiliationObj} affiliation As in the request object.
 */
// TypeObj
/**
 * @typedef TypeObj
 * @property {string} type A type for the object.
 * @property {string} id A unique identifier for the object.
 */
// NameObj
/**
 * @typedef NameObj
 * @property {string} name A name for the object.
 * @property {string} id A unique identifier for the object.
 */
// StaffObj
/**
 * @typedef StaffObj
 * @property {string} id A unique identifier for the staff member.
 * @property {string} firstname The staff member's first name.
 * @property {string} surname The staff member's surname.
 * @property {string} standing Either "active", "inactive", or "lockout", the standing of the staff member.
 * @property {string} financial_level Either "none", "time", or "all", the staff member's financial permission level.
 * @property {string} title A title for the member, for example "Mr", "Ms".
 * @property {string} email The staff member's email address.
 * @property {string} mobile The staff member's mobile number.
 * @property {string} phone The staff member's phone number.
 * @property {string} fax The staff member's fax number.
 * @property {string} position The staff member's position in the company.
 * @property {string} username The staff member's username on the deployment.
 * @property {string} timezone The staff member's timezone.
 * @property {InteractObj} Activity interact object. Only returned when /activities/{activity_id}/interacts is called.
 */
// TaskObj
/**
 * @typedef TaskObj
 * @property {string} id A unique identifier for the task.
 * @property {string} title A name for the task.
 * @property {string} description A description of the task.
 * @property {string} billable The total billable time logged against the task, in seconds.
 * @property {string} nonbillable The total nonbillable time logged against the task, in seconds
 * @property {string} logged The total time logged against the task, in seconds.
 * @property {string} budgeted The total time budgeted, or estimated, for the task, in seconds
 * @property {string} remaining The amount of budgeted time left, in seconds.
 * @property {string} staff_bookmarked Whether the current user has bookmarked the task in the deployment.
 * @property {string} date_created The date the task was created.
 * @property {string} date_started The date the task is is scheduled to start.
 * @property {string} date_commenced The date the task was started; when its standing was progressed to "started".
 * @property {string} date_accepted The date the task was accepted.
 * @property {string} date_due The date the task is due to be completed.
 * @property {string} date_completed The date the task was completed.
 * @property {string} date_modified The date the task was last modified.
 * @property {string} against_type The type of object the task is against.
 * @property {string} against_id The unique identifier of the object the task is against.
 * @property {string} against The API URI of the object the task is against. That is "against_type/against_id".
 * @property {string} creator_type The type of object that created the task.
 * @property {string} creator_id The unique identifier of the object that made the task.
 * @property {string} creator The API URI of the object that made the task. That is "creator_type"/"creator_id".
 * @property {StaffObj} assignee The staff member assigned to the task.
 * @property {TaskTypeObj} task_type The task type of the task.
 * @property {StatusObj} task_status The status of the task.
 * @property {string} standing The standing of the task, this is contained in the status object.
 * @property {StaffObj} manager The staff member assigned to manager the task.
 * @property {ContactObj} contact The contact associated with the against object, if any.
 * @property {AffiliationObj} affiliation The affiliation associated with the against object, if any.
 * @property {CompanyObj} company The company object the task is against, if any.
 * @property {IssueObj} issue The issue object the task is against, if any.
 * @property {JobObj} task_job The job object the task is against, if any.
 * @property {MilestoneObj} milestone The milestone object the task is against, if any.
 * @property {BudgetObj} task_object_budget The object budget linked to the task, if any.
 * @property {ScheduleObj} task_object_schedule The object schedule linked to the task.
 * @property {string} task_object_schedule_id The id of the object schedule linked to the task.
 * @property {string} rate_id The unique identifier of the rate object of the task.
 * @property {string} rate_charged The rate charged for billable work within this task. This is part of the rate object.
 * @property {string} ordering An integer representing the task's order on the against object, only if the task is against a job or milestone
 */
// TaskTypeObj
/**
 * @typedef TaskTypeObj
 * @property {string} id A unique identifier for the task type.
 * @property {string} title A title for the task type.
 * @property {string} standing Either "active" or "inactive", the standing of the task type.
 * @property {string} ordering An integer representing the task type's order on the deployment.
 */
// RateObj
/**
 * @typedef RateObj
 * @property {string} id A unique identifier for the rate.
 * @property {string} title A name for the rate.
 * @property {string} charged The hourly rate for this rate.
 * @property {string} standing Either "active" or "inactive", the standing of the rate.
 * @property {string} object A list of objects this rate is applicable to.
 */
// BudgetObj
/**
 * @typedef BudgetObj
 * @property {string} id A unique identifier for the object budget.
 * @property {string} against_type The type of object the object budget is against.
 * @property {string} against_id The unique identifier of the object the object budget is against.
 * @property {string} object The API URI of the object the object budget is against. This is "{against_type}/{against_id}"
 * @property {string} is_billable Either "yes" or "no", whether time logged against the object is billable.
 * @property {string} service_time_estimate The estimated total time for services against the object, in seconds.
 * @property {stringstring} service_time The total time logged for services against the object, in seconds.
 * @property {string} service_time_subtotal_estimate The estimated total time for services against the object and its children, in seconds.
 * @property {string} service_price_estimate An estimate for the total price of services against the object.
 * @property {string} service_price The total price of services against the object.
 * @property {string} service_price_subtotal_estimate An estimate for the total price of services against the object and all of its children.
 * @property {string} service_price_subtotal The total price of services against the object and all of its children.
 * @property {string} expense_price The total prices of expenses for the object.
 * @property {string} material_cost The total cost of materials for the object.
 * @property {string} material_cost_subtotal the total cost of materials for the object and all its children.
 * @property {string} material_price The total price of materials for the object.
 * @property {string} material_price_subtotal The total price of materials for the object and all its children.
 * @property {string} billable The total billable time logged against the object, in seconds.
 * @property {string} billable_subtotal The total billable time logged against the object and all its children, in seconds.
 * @property {string} nonbillable The total nonbillable time logged against the object, in seconds.
 * @property {string} nonbillable_subtotal The total nonbillable time logged against the object and all its children, in seconds.
 * @property {string} logged The total time logged against the object, in seconds. That is, the sum of billable and nonbillable.
 * @property {string} logged_subtotal The total time logged against the object and all its children, in seconds.
 * @property {string} charged The total cost charged against the object.
 * @property {string} charged_subtotal The total cost charged against the object, and all its children.
 * @property {string} remaining_subtotal If object_table is tasks the remaining budget for the task, otherwise the sum of the remaining subtotal of all the object's children's.
 */
// ScheduleObj
/**
 * @typedef ScheduleObj
 * @property {stringstring} id A unique identifier for the object schedule.
 * @property {string} against_id The unique identifier of the object the schedule is against.
 * @property {string} against_type The type of object the schedule is against.
 * @property {string} date_planned_start The planned start date.
 * @property {string} date_planned_due The planned due date.
 * @property {string} date_predicted_start The predicted start date computed by Accelo based on current progress, the dates of any dependencies and planned durations.
 * @property {string} date_predicted_end The predicted start date computed by Accelo based on current progress, the dates of any dependencies and planned durations.
 * @property {string} date_commenced The actual commenced date.
 * @property {string} date_completed The actual completed date.
 * @property {string} date_user_estimated_start The date the assignee has scheduled to start the work.
 * @property {string} date_user_estimated_due The date the assignee has scheduled to complete the work.
 * @property {string} date_targeted_start The date the assignee becomes responsible for the work, based on current progress, planned dates, and the planned durations.
 * @property {string} date_targeted_due The date the assignee becomes responsible for the work, based on current progress, planned dates, and the planned durations.
 * @property {string} date_fixed_start The fixed start date.
 * @property {string} date_fixed_due The fixed deadline for the due date.
 */
// CountObj
/**
 * @typedef CountObj
 * @property {string} count Integer count of objects
 */
// ProfileFieldObj
/**
 * @typedef ProfileFieldObj
 * @property {string} id A unique identifier for the profile field.
 * @property {string} field_name A name for the profile field.
 * @property {select} field_type The type of the profile field. This can be "text", "integer", "decimal", "date", "date_time", "currency", " lookup", "structure", "select", "multi_select", or "hyperlink".
 * @property {string} parent_id The unique identifier of the parent profile field. If there is no parent this has a value of "0".
 * @property {string} link_type The type of object this profile field is against. For example "contact".
 * @property {string} required Either "yes" or "no", whether this profile field is required for the object it is against.
 * @property {string} restrictions Who is able to edit the value of this field. May be one of "all", "edit", "process", "admin". For example, if set to "process", only users with "process" permission for custom fields will be able to edit this field. See the support documentation for information on setting permissions.
 * @property {string} exported Either "yes" or "no", whether this profile field will be included when you export the against object.
 * @property {string} lookup_type When field_type is "lookup", this will contain the lookup type, e.g. "company".
 * @property {string[]} options When field_type is either "select" or "multi_select" this will contain the possible values.
 * @property {string} confidential Either "yes" or "no", whether this is a confidential profile field. These are profile fields viewable only within confidential relationships, see the support documentation for more information.
 * @property {string} description A description of the profile field.
 */ 
// ProfileValueObj
/**
 * @typedef ProfileValueObj
 * @property {string} id A unique identifier for the profile field value.
 * @property {string} field_type The profile field type for this value, see the profile field object for possible values.
 * @property {string} field_name The name for the profile field.
 * @property {string} value_type For fields of type lookup this is the type of the lookup object. For example "company", "contact". Otherwise it is null.
 * @property {string|string[]} value The value of the profile field. The type will change according to the field_type, for example if the field type is "date" this will be a unix ts. If it's a "multi_select" this will be all values joined by a comma. e.g, "one, two" for ["one", "two"]
 * @property {string[]} values When the field type is "multi_select", this will contain an array of the selected values. e.g, ["one", "two"]
 * @property {string} date_modified The date this profile field value was last modified.
 * @property {StaffObj} modified_by The staff member who last modified this profile field value.
 * @property {string} field_id The unique identifier of the profile field this value is for.
 * @property {string} link_type The object the profile value was created against.
 * @property {string} link_id The unique identifier of the object the profile value is against.
 */ 
