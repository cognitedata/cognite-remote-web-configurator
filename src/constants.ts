export const APP_NAME = "Cognite Remote Configurator";
export const LOGIN_HEADER = "Enter Your Project Name";
export const LOGIN_CDF_ENVIRONMENT_OPT_TEXT = "cdfEnvironment";
export const LOGIN_API_KEY_TEXT = "apiKey";
export const DEV_MODE = false;
export const USE_LOCAL_FILES_AND_NO_LOGIN = false;
export const STRING_PLACEHOLDER = "$$";

// String Constants
export const LOCALIZATION = {
    RETRIEVE_CONFIGS_FAIL: 'Unable to retrieve json configs! {{error}}',
    UNTITLED: "Untitled",
    INCONSISTENT_VALUE: 'Inconsistent value. Remove and insert it again to fill missing fields',

    // Save command
    SAVE_TITLE: 'Create New Json Config',
    SAVE_CONTENT: 'Do you want to create new Json Config?',
    SAVE_SUCCESS: 'Data saved successfully!',
    SAVE_ERROR: 'Save Cancelled! {{error}}',
    SAVE_INVALID_FILE: 'Save Cancelled! Please add a file name',

    // Upload command
    UPLOAD_TITLE: 'Update File',
    UPLOAD_CONTENT: 'Do you want to update file with new changes?',
    UPLOAD_SUCCESS: 'Data updated successfully!',
    UPLOAD_ERROR: 'Save Cancelled! {{error}}',
    UPLOAD_INVALID_FILE: 'Update failed!',

    // Delete command
    DELETE_TITLE: 'Delete Config',
    DELETE_CONTENT: 'Are you sure you want to permanently delete this config?',
    DELETE_SUCCESS: 'Json Config deleted successfully!',
    DELETE_ERROR: 'Delete Cancelled! {{error}}',
    DELETE_INVALID_FILE: 'Delete Cancelled! Please select a file',

    // Refresh Command
    REFRESH_TITLE: 'Refresh Config',
    REFRESH_CONTENT: 'Refreshing will fetch the latest version of this config from server',
    REFRESH_SUCCESS: 'Json Config updated successfully!',
    REFRESH_ERROR: 'Refresh Cancelled! {{error}}',

    // switch config
    SWITCH_TITLE:'Switch Config?',
    SWITCH_CONTENT:'You have some unsaved changes. Are you sure you want to switch without saving?',

    // Remove item menu option
    REMOVE_ENABLED: 'Remove this field',
    REMOVE_DISABLED: 'Cannot Remove.',
    REMOVE_INVALID_PATH: 'Remove this field. This field contains an invalid path',
    REMOVE_MANDATORY: 'Cannot Remove. This field is mandatory',
    REMOVE_MINIMUM_LENGTH: 'Cannot Remove. Array has a minimum length',

    // Validation
    REQUIRED_FIELDS_NOT_AVAIL: "Required fields: $$ not available in object",
    REQUIRED_FIELD_NOT_AVAIL: "Required field: $$ not available!",
    DISCRIM_INVALID_TYPE: "Required field: $$ does not have a valid type!",
    NOT_VALID_KEY: "key: $$, is not a valid key!",
    MAX_ARR_ELEMENTS_EXCEEDED: "Number of array elements cannot exceed $$ !",
    INVALID_MAX_ARR_ELEMENTS: "Invalid maxElement configuration for $$ !",
    MIN_ARR_ELEMENTS_NOT_FOUND: "Number of array elements cannot be lower than $$ !",
    INVALID_MIN_ARR_ELEMENTS: "Invalid minElement configuration for $$ !",
    VAL_NOT_BE_EMPTY: "Value cannot be empty!",
    VAL_NOT_OF_POSSIBLE_VALS: "Value not one of the possible values!",
    VAL_NOT_NUMBER: "Value is not a number!",
    VAL_CANNOT_BE_LESS: "Value cannot be less than $$!",
    VAL_CANNOT_BE_GREATER: "Value cannot be greater than $$!",
    VAL_CANNOT_BE_BOOLEAN: "Value cannot be boolean!",
    VAL_CANNOT_BE_NUMBER: "Value cannot be number!",
    VAL_CANNOT_BE_STRING: "Value cannot be string!",
    VAL_NOT_BOOLEAN: "Value is not a boolean!",
    VAL_NOT_STRING: "Value is not a string!",
    STRING_LENGTH_EXCEEDED: "String length cannot exceed $$ characters!",
    STRING_VIOLATES_PATTERN: "String does not provide a match for pattern: $$!",
    ARR_ELEMENT_VIOLATES_UNIQUENESS: "item: $$ violates array uniqueness constraint!"
}
