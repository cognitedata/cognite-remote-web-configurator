export const APP_NAME = "Cognite Remote Configurator";
export const LOGIN_HEADER = "Enter Your Project Name";
export const LOGIN_CDF_ENVIRONMENT_OPT_TEXT = "cdfEnvironment";
export const DEV_MODE = false;

// String Constants
export const LOCALIZATION = {
    RETRIEVE_CONFIGS_FAIL: 'Unable to retrieve json configs! {{error}}',
    UNTITLED: "Untitled",
    INCONSISTANT_VALUE: 'Inconsistant value. Remove and insert it again to fill missing fields',

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

    // Remove item menu option
    REMOVE_ENABLED: 'Remove this field',
    REMOVE_DISABLED: 'Cannot Remove.',
    REMOVE_INVALID_PATH: 'Remove this field. This field contains an invalid path',
    REMOVE_MANDATORY: 'Cannot Remove. This field is mandatory',
    REMOVE_MINIMUM_LENGTH: 'Cannot Remove. Array has a minimum length',

}
