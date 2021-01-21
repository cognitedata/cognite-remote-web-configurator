export enum MergeModes {
    diff = 'diff',
    reload = 'reload',
    save = 'save'
}

export interface MergeText {
    btnLeft: string;
    btnRight: string;
    txtLeft: string;
    txtRight: string;
}

export const MergeModesMap: Map<string, MergeText> = new Map([
    ['diff', {
        btnLeft: 'Accept Original',
        btnRight: 'Accept Edits',
        txtLeft: 'Original',
        txtRight: 'Edited',
    }],
    ['reload', {
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
