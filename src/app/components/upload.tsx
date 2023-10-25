"use client"
import Uppy from '@uppy/core';
// import Tus from "@uppy/tus";
import XHRUpload, { XHRUploadOptions } from '@uppy/xhr-upload';
import { Dashboard } from '@uppy/react';
// import StatusBar from '@uppy/status-bar';
// import RemoteSources from '@uppy/remote-sources';
// import Webcam from '@uppy/webcam';
import Compressor from '@uppy/compressor';
import GoogleDrive, { GoogleDriveOptions } from '@uppy/google-drive';
import Dropbox, { DropboxOptions } from '@uppy/dropbox';
import { Fragment, useEffect } from 'react';
// import { v4 as uuid } from 'uuid';

import '@uppy/core/dist/style.min.css';
import '@uppy/dashboard/dist/style.min.css';
// import '@uppy/status-bar/dist/style.min.css';
// import '@uppy/progress-bar/dist/style.min.css';
// import ProgressBar from '@uppy/progress-bar';
const token  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYzNTkwYmUzN2YzZWVlZmZlOTQxZWNlZCIsInR5cGUiOiJDbGllbnQiLCJzY29wZSI6W10sImlhdCI6MTY5ODAwMDU1MSwiZXhwIjoxNjk4MDExMzUxfQ.pqKQJk000JOfd8DvsOTnTGRkLW54h28hsZzf10Y9xyc'
// let uploadUUID = uuid();

const uppy = new Uppy({
    autoProceed: false,
    debug: true,
    restrictions: {
        minNumberOfFiles: 1,
        allowedFileTypes: ['video/*', 'image/*'],
    },
    meta: { title: 'title', name: 'name', cameraModel: '642687c0cfc1a73848a58f68', otherCameraModel: '' },
    id: 'uppyAerial',
    // allowMultipleUploads: false,
    allowMultipleUploadBatches: false,
});
const xhrOptions: XHRUploadOptions = {
    endpoint: `${process.env.NEXT_PUBLIC_BASE_URL}/dataTokens/upload`,
    bundle: true,
    fieldName: 'files',
    formData: true,
    id: 'XHRUpload',
    method: 'POST',
    headers: {
        authorization: `Bearer ${token}`,
    },
};
uppy.use(XHRUpload, xhrOptions);
uppy.use(Compressor);
const driveOpts: GoogleDriveOptions = {
    companionUrl: 'https://companion.uppy.io/',
};
uppy.use(GoogleDrive, driveOpts)
const dropboxOpts: DropboxOptions = {
    companionUrl: 'https://companion.uppy.io/',
};
uppy.use(Dropbox, dropboxOpts);

// uppy.use(Webcam);
// uppy.use(RemoteSources, {
//     companionUrl: 'https://companion.uppy.io/',
//     // sources: ['GoogleDrive'],
// });

// uppy.use(Tus, {
//     endpoint: `${process.env.NEXT_PUBLIC_BASE_URL}/storage/upload`,
//     // headers: {
//     //   authorization: `Bearer ${token}`,
//     // },
//     chunkSize: 6 * 1024 * 1024,
//     // allowedMetaFields: ['bucketName', 'objectName', 'contentType', 'cacheControl'],
// });

uppy.on('file-added', (file: any) => {
    console.log('-----file added-------');
    console.log({ file });
    file.meta = {
        ...file.meta,
        bucketName: 'navigate-dev',
        objectName: `${file.name}`,
        contentType: file.type,
    }
});
uppy.on('upload', (data) => {
    // data object consists of `id` with upload ID and `fileIDs` array
    // with file IDs in current upload
    // data: { id, fileIDs }
    console.log(`Starting upload ${data.id} for files ${data.fileIDs}`);
});

uppy.on('complete', (res: any) => {
    console.log('----------upload complete---------', { res });
    for (let succ = 0; succ < res.successful.length; succ++) {
        console.log(res.successful[succ].uploadURL);
    }
    // uploadUUID = uuid();
});

uppy.on('upload-error', (file: any, error: Error) => console.log(error));
uppy.on('error', (err: Error) => console.log(err));
uppy.on('progress', (progress: number) => console.log({ progress }));
// todo: handle more events

console.log('-------UploadArea: Outside component---------');
export default function UploadArea(props: any) {
    console.log('-------UploadArea: Inside component---------');
    
    // useEffect(() => {
        // return () => uppy.close();
    // }, []);

    return (
        <Fragment>
            <Dashboard
                uppy={uppy}
                plugins={['DragDrop', 'GoogleDrive', 'Dropbox']}
                showProgressDetails={true}
                suppressHydrationWarning={true}
                doneButtonHandler={() => {
                    uppy.cancelAll();
                    // TODO: show upload more modal here.
                }}
                proudlyDisplayPoweredByUppy={false}
                locale={{
                    strings: {
                        dropPasteFiles: 'Choose a file or drag it here or %{browse}',
                        // browseFiles: 'Or select a file here'
                        //   dropHereOr: 'فایلها را اینجا رها کنید یا بچسبانید یا %{browse}',
                        //   browse: 'بارگذاری',
                        //   dropHint: 'Drop your files here',
                        //   dropPaste: 'Drop files here, paste or %{browse}', 
                        //   dropPasteImport: 'Drop files here, paste, %{browse} or import from:', 
                    }
                }}
                title={"NVG8 Uploader"}
                content="This is default content."
                id="aerial_dashboard"
                placeholder="Placeholder"
            />
        </Fragment>
    );
}
