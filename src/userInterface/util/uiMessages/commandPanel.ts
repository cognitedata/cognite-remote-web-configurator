interface Messages {
    title: string;
    content: string;
    success: string;
    error: string;
    invalidFile: string;
}

// Hardcoded string

export const saveConfig: Messages = {
    title: 'Cretate New Json Config',
    content: 'Do you want to cretate new Json Config?',
    success: 'Data saved successfully!',
    error: 'Save Cancelled!',
    invalidFile: 'Save Cancelled! Please add a file name'
};

export const updateConfig: Messages = {
    title: 'Update File',
    content: 'Do you want to update file with new changes?',
    success: 'Data updated successfully!',
    error: 'Save Cancelled!',
    invalidFile: 'Update failed!'
};

export const deleteConfig: Messages = {
    title: 'Delete Config',
    content: 'Are you sure you want to permanently delete this config?',
    success: 'Json Config deleted successfully!',
    error: 'Delete Cancelled!',
    invalidFile: 'Delete Cancelled! Please select a file'
};