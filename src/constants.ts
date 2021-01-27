import { MergeModes } from "./userInterface/util/enums/MergeModes";
export const APP_NAME = "Cognite Remote Configurator";
export const LOGIN_HEADER = "Enter Your Project Name";
export const LOGIN_CDF_ENVIRONMENT_OPT_TEXT = "cdfEnvironment";
export const LOGIN_API_KEY_TEXT = "apiKey";
export const DEV_MODE = false;
export const USE_LOCAL_FILES_AND_NO_LOGIN = false;
export const STRING_PLACEHOLDER = "$$";

// String Constants
export const LOCALIZATION = {
    RETRIEVE_CONFIGS_FAIL: 'Unable to retrieve configurations! {{error}}',
    UNTITLED: "Untitled",
    INCONSISTENT_VALUE: 'Inconsistent value. Remove and insert it again to fill missing fields',

    // Diff command
    DIFF_SUCCESS: 'Changes Accepted',
    DIFF_CANCEL: 'Cancelled',

    // Save command
    SAVE_TITLE: 'Create New Configuration',
    SAVE_CONTENT: 'Do you want to save the new configuration?',
    SAVE_SUCCESS: 'Configuration saved successfully!',
    SAVE_ERROR: 'Save Cancelled! {{error}}',
    SAVE_INVALID_FILE: 'Save Cancelled! Please add header -> name field',

    SAVE_WITH_ERRORS_TITLE: 'Create New Configuration',
    SAVE_WITH_ERRORS_CONTENT: 'Configuration contains errors! Are you sure you want to save this configuration?',
    SAVE_WITHOUT_NAME_CONTENT: 'Configuration doesn\'t contains a name! Are you sure you want to save this configuration without a name?',

    // Update command
    UPDATE_TITLE: 'Update Configuration',
    UPDATE_CONTENT: 'Do you want to update the configuration with new changes?',
    UPDATE_SUCCESS: 'Configuration updated successfully!',
    UPDATE_ERROR: 'Update Cancelled! {{error}}',
    UPDATE_INVALID_FILE: 'Update failed!',

    UPDATE_WITH_ERRORS_TITLE: 'Update Configuration',
    UPDATE_WITH_ERRORS_CONTENT: 'Configuration contains errors! Are you sure you want to update with new changes?',
    UPDATE_WITHOUT_NAME_CONTENT: 'Configuration doesn\'t contains a name! Are you sure you want to update this configuration without a name?',

    UPLOAD_WITH_ERRORS_TITLE: 'Update Configuration',
    UPLOAD_WITH_ERRORS_CONTENT: 'Configuration contains errors! Are you sure you want to update with new changes?',

    // Delete command
    DELETE_TITLE: 'Delete Configuration',
    DELETE_CONTENT: 'Are you sure you want to permanently delete this configuration?',
    DELETE_SUCCESS: 'Configuration deleted successfully!',
    DELETE_ERROR: 'Delete Cancelled! {{error}}',
    DELETE_INVALID_FILE: 'Delete Cancelled! Please select a configuration',

    // Refresh Command
    REFRESH_TITLE: 'Refresh Configuration',
    REFRESH_CONTENT: 'Refreshing will fetch the latest version of this configuration from the server',
    REFRESH_SUCCESS: 'Configuration updated successfully!',
    REFRESH_ERROR: 'Refresh Cancelled! {{error}}',

    // switch config
    SWITCH_TITLE: 'Switch Config?',
    SWITCH_CONTENT: 'You have some unsaved changes. Are you sure you want to switch without saving?',

    // Remove item menu option
    REMOVE_ENABLED: 'Remove this field',
    REMOVE_DISABLED: 'Cannot Remove.',
    REMOVE_INVALID_PATH: 'Remove this field. This field contains an invalid path',
    REMOVE_MANDATORY: 'Cannot Remove. This field is mandatory',
    REMOVE_MINIMUM_LENGTH: 'Cannot Remove. Array has a minimum length',

    // File uploader
    FILE_UPLOAD_OK: 'File Uploaded Successfully',
    FILE_UPLOAD_FAILED: 'File Upload Failed',
    SWITCHED_TO_DEFAULT: 'Switched to default Open Api Schema',
    INVALID_SCHEMA: 'Invalid schema file',

    // Validation
    REQUIRED_FIELDS_NOT_AVAIL: "Required fields: $$ not available in object",
    REQUIRED_FIELD_NOT_AVAIL: "Required field: $$ not available!",
    DISCRIM_INVALID_TYPE: "Required field: $$ does not have a valid type!",
    NOT_VALID_KEY: "key: $$, is not a valid key!",
    MAX_ARR_ELEMENTS_EXCEEDED: "Number of array elements cannot exceed $$ !",
    INVALID_MAX_ARR_ELEMENTS: "Invalid maxElement configuration for $$ !",
    MIN_ARR_ELEMENTS_NOT_FOUND: "Number of array elements cannot be lower than $$ !",
    INVALID_MIN_ARR_ELEMENTS: "Invalid minElement configuration for $$ !",
    INVALID_MAX_NO_KEY_PAIRS: "Number of key value pairs cannot exceed $$!",
    INVALID_MIN_NO_KEY_PAIRS: "Number of key value pairs should exceed $$!",
    VAL_NOT_BE_EMPTY: "Value cannot be empty!",
    VAL_NOT_OF_POSSIBLE_VALS: "Value not one of the possible values!",
    VAL_NOT_NUMBER: "Value is not a number!",
    VAL_CANNOT_BE_LESS: "Value cannot be less than $$!",
    VAL_CANNOT_BE_GREATER: "Value cannot be greater than $$!",
    VAL_CANNOT_BE_BOOLEAN: "Value cannot be boolean!",
    VAL_CANNOT_BE_NUMBER: "Value cannot be number!",
    VAL_CANNOT_BE_STRING: "Value cannot be string!",
    VAL_CANNOT_BE_NULL: "Value cannot be null!",
    VAL_NOT_BOOLEAN: "Value is not a boolean!",
    VAL_NOT_STRING: "Value is not a string!",
    VAL_NOT_OBJECT: "Value is not an Object!",
    VAL_NOT_ARR: "Value is not an Array!",
    STRING_LENGTH_EXCEEDED: "String length cannot exceed $$ characters!",
    STRING_VIOLATES_PATTERN: "String does not provide a match for pattern: $$!",
    ARR_ELEMENT_VIOLATES_UNIQUENESS: "item: $$ violates array uniqueness constraint!"
}

export const MergeText = {
    [MergeModes.diff]: {
        btnLeft: 'Accept Original',
        btnRight: 'Accept Edits',
        txtLeft: 'Original',
        txtRight: 'Edited',
    },
    [MergeModes.reload]: {
        btnLeft: 'Accept Server Version',
        btnRight: 'Accept Local Version',
        txtLeft: 'Server Version',
        txtRight: 'Local Version',
    },
    [MergeModes.save]: {
        btnLeft: 'Accept Server Version and Save',
        btnRight: 'Accept Local Version and Save',
        txtLeft: 'Server Version',
        txtRight: 'Local Version',
    }
}
