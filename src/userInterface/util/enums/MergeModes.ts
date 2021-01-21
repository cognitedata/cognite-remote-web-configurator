export const MergeModes: Map<string, unknown> = new Map([
    ['diff', {
        btnLeft: 'Accept Original',
        btnRight: 'Accept Edits',
        txtLeft: 'Original',
        txtRight: 'Edited',
    }],
    ['refresh', {
        btnLeft: 'Accept Server Version',
        btnRight: 'Accept Local Version',
        txtLeft: 'Server Version',
        txtRight: 'Local Version',
    }],
    ['save', {
        btnLeft: 'Accept Server Version and Save',
        btnRight: 'Accept Local Version and Save',
        txtLeft: 'Server Version',
        txtRight: 'Local Version',
    }]
]);