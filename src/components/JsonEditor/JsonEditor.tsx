import React from 'react';
import './JsonEditor.module.scss'
import ReactJson from 'react-json-view';
import mauiA from '../../config/MauiA.json';


export const JsonEditor: React.FC<any> = () => {
    return (
        <div className="json-view">
            <ReactJson src={mauiA} />
        </div>
    );
}