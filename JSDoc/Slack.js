// MessageReturnObj
/**
 * @typedef MessageReturnObj
 * @property {boolean} ok
 * @property {string} channel
 * @property {string} ts
 * @property {string} text
 * @property {MessageType} message
 * @property {string} error
 */
// MessageType
/**
 * @typedef MessageType
 * @property {string} text
 * @property {string} username
 * @property {string} bot_id
 * @property {AttachmentsType[]} attachments
 * @property {BlocksType[]} blocks
 * @property {string} type
 * @property {string} subtype
 * @property {string} ts
 */
// AttachmentsType
/**
 * @typedef AttachmentsType
 * @property {string} text
 * @property {number} id
 * @property {string} fallback
 */
// MessageDeleteObj
/**
 * @typedef MessageDeleteObj
 * @property {boolean} ok
 * @property {string} channel
 * @property {string} ts
 * @property {string} error
 */
// BlocksType
/**
 * @typedef BlocksType
 * @property {string} type
 * @property {TextType} text
 * @property {TextType[]} fields
 * @property {AccessoryType} accessory
 * @property {ElementType[]} elements
 * @property {TitleType} title
 * @property {string} image_url
 * @property {string} alt_text
 * @property {boolean} dispatch_action
 * @property {ElementType} element
 * @property {TextType} label
 */
// TextType
/**
 * @typedef TextType
 * @property {string} type
 * @property {string} text
 * @property {boolean} emoji
 */
// AccessoryType
/**
 * @typedef AccessoryType
 * @property {string} type
 * @property {string} initial_time
 * @property {AccessoryPlaceholderType} placeholder
 * @property {OptionsType[]} options
 * @property {string} action_id
 */
// AccessoryPlaceholderType
/**
 * @typedef AccessoryPlaceholderType
 * @property {string} type
 * @property {string} text
 * @property {boolean} emoji
 */
// OptionsType
/**
 * @typedef OptionsType
 * @property {TextType} text
 * @property {TextType} description
 * @property {string} value
 */
// ElementType
/**
 * @typedef ElementType
 * @property {string} type
 * @property {string} initial_time
 * @property {string} initial_conversation
 * @property {string} initial_user
 * @property {string} initial_channel
 * @property {string} initial_date
 * @property {TextType} placeholder
 * @property {string} action_id
 * @property {FilterType} filter
 * @property {string} image_url
 * @property {string} alt_text
 * @property {boolean} emoji
 * @property {DispatchActionConfigType} dispatch_action_config
 * @property {boolean} multiline
 */
// DispatchActionConfigType
/**
 * @typedef DispatchActionConfigType
 * @property {string[]} trigger_actions_on
 */
// FilterType
/**
 * @typedef FilterType
 * @property {string[]} include
 */
// ViewReturnObj
/**
 * @typedef ViewReturnObj
 * @property {boolean} ok
 * @property {ViewType} view
 * @property {string} error
 * @property {Response_metadataType} response_metadata
 */
// Response_metadataType
/**
 * @typedef Response_metadataType
 * @property {string[]} messages
 * @property {string} next_cursor
 */
// ViewType
/**
 * @typedef ViewType
 * @property {string} id
 * @property {string} team_id
 * @property {string} type
 * @property {any} [close]
 * @property {any} [submit]
 * @property {object[]} blocks
 * @property {string} private_metadata
 * @property {string} callback_id
 * @property {ViewStateType} state
 * @property {string} hash
 * @property {boolean} clear_on_close
 * @property {boolean} notify_on_close
 * @property {string} root_view_id
 * @property {any} [previous_view_id]
 * @property {string} app_id
 * @property {string} external_id
 * @property {string} bot_id
 */
// ViewStateType
/**
 * @typedef ViewStateType
 * @property {any[]} values
 */
// AuthType
/**
 * @typedef AuthType
 * @property {boolean} ok
 * @property {string} access_token
 * @property {string} token_type
 * @property {string} scope
 * @property {string} bot_user_id
 * @property {string} app_id
 * @property {number} expires_in
 * @property {string} refresh_token
 * @property {TeamType} team
 * @property {TeamType} enterprise
 * @property {Authed_userType} authed_user
 * @property {boolean} is_enterprise_install
 */
// TeamType
/**
 * @typedef TeamType
 * @property {string} name
 * @property {string} id
 */
// Authed_userType
/**
 * @typedef Authed_userType
 * @property {string} id
 * @property {string} scope
 * @property {string} access_token
 * @property {number} expires_in
 * @property {string} refresh_token
 * @property {string} token_type
 */
// RequestParams
/**
 * @typedef RequestParams
 * @property {string} method Request method
 * @property {object} headers Request headers
 * @property {object} [payload] Request payload
 */
// RepliesReturnObj
/**
 * @typedef RepliesReturnObj
 * @property {RepliesType[]} messages
 * @property {boolean} has_more
 * @property {boolean} ok
 * @property {Response_metadataType} response_metadata
 */
// RepliesType
/**
 * @typedef RepliesType
 * @property {string} type
 * @property {string} user
 * @property {string} text
 * @property {string} thread_ts
 * @property {number} reply_count
 * @property {boolean} subscribed
 * @property {string} last_read
 * @property {number} unread_count
 * @property {string} ts
 * @property {string} parent_user_id
 */
// BasicReturnObj
/**
 * @typedef BasicReturnObj
 * @property {boolean} ok
 * @property {string} error
 */
// UsersReturnObj
/**
 * @typedef UsersReturnObj
 * @property {boolean} ok
 * @property {UserType[]} members
 * @property {number} cache_ts
 * @property {Response_metadataType} response_metadata
 */
// UserReturnObj
/**
 * @typedef UserReturnObj
 * @property {boolean} ok
 * @property {UserType} user
 * @property {string} error
 */
// UserType
/**
 * @typedef UserType
 * @property {string} id
 * @property {string} team_id
 * @property {string} name
 * @property {boolean} deleted
 * @property {string} color
 * @property {string} real_name
 * @property {string} tz
 * @property {string} tz_label
 * @property {number} tz_offset
 * @property {UserProfileType} profile
 * @property {boolean} is_admin
 * @property {boolean} is_owner
 * @property {boolean} is_primary_owner
 * @property {boolean} is_restricted
 * @property {boolean} is_ultra_restricted
 * @property {boolean} is_bot
 * @property {number} updated
 * @property {boolean} is_app_user
 * @property {boolean} has_2fa
 */
// UserProfileType
/**
 * @typedef UserProfileType
 * @property {string} avatar_hash
 * @property {string} status_text
 * @property {string} status_emoji
 * @property {string} real_name
 * @property {string} display_name
 * @property {string} real_name_normalized
 * @property {string} display_name_normalized
 * @property {string} email
 * @property {string} image_24
 * @property {string} image_32
 * @property {string} image_48
 * @property {string} image_72
 * @property {string} image_192
 * @property {string} image_512
 * @property {string} team
 */
// ChannelReturnObj
/**
* @typedef ChannelReturnObj
* @property {boolean} ok
* @property {ChannelType} channel
* @property {string} warning
* @property {Response_metadataType} response_metadata
*/
// ChannelType
/**
* @typedef ChannelType
* @property {string} id
* @property {string} name
* @property {boolean} is_channel
* @property {boolean} is_group
* @property {boolean} is_im
* @property {number} created
* @property {string} creator
* @property {boolean} is_archived
* @property {boolean} is_general
* @property {number} unlinked
* @property {string} name_normalized
* @property {boolean} is_shared
* @property {boolean} is_ext_shared
* @property {boolean} is_org_shared
* @property {any[]} pending_shared
* @property {boolean} is_pending_ext_shared
* @property {boolean} is_member
* @property {boolean} is_private
* @property {boolean} is_mpim
* @property {ChannelTopicType} topic
* @property {ChannelPurposeType} purpose
* @property {any[]} previous_names
*/
// ChannelTopicType
/**
* @typedef ChannelTopicType
* @property {string} value
* @property {string} creator
* @property {number} last_set
*/
// ChannelPurposeType
/**
* @typedef ChannelPurposeType
* @property {string} value
* @property {string} creator
* @property {number} last_set
*/
