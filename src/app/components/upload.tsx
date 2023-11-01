"use client"
import Uppy, { UppyFile, UppyOptions } from '@uppy/core';
import Tus, { TusOptions } from "@uppy/tus";
// import XHRUpload, { XHRUploadOptions } from '@uppy/xhr-upload';
import { Dashboard } from '@uppy/react';
// import StatusBar from '@uppy/status-bar';
// import RemoteSources from '@uppy/remote-sources';
// import Webcam from '@uppy/webcam';
import GoogleDrive, { GoogleDriveOptions } from '@uppy/google-drive';
import Dropbox, { DropboxOptions } from '@uppy/dropbox';
import { Fragment, useEffect } from 'react';
// import { randomUUID } from 'crypto';
// import { v4 as uuid } from 'uuid';

import '@uppy/core/dist/style.min.css';
import '@uppy/dashboard/dist/style.min.css';

let token  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYzNTkwYmUzN2YzZWVlZmZlOTQxZWNlZCIsInR5cGUiOiJDbGllbnQiLCJzY29wZSI6W10sImlhdCI6MTY5ODg1MTU4MSwiZXhwIjoxNjk4ODYyMzgxfQ.umjeQHbCcWydjEFjROaalsLsjyI4i6riAJKvFU2Il0I'
// let uploadUUID = uuid();
const companionUrl = `${process.env.NEXT_COMPANION_BASE_URL}/companion`
// `${process.env.NEXT_COMPANION_BASE_URL}`
// `${process.env.NEXT_PUBLIC_BASE_URL}/api/storage/uppy-companion`
const TUS_ENDPOINT = `${process.env.NEXT_PUBLIC_BASE_URL}/storage/upload`;

const uppy = new Uppy({
    autoProceed: false,
    debug: true,
    restrictions: {
        minNumberOfFiles: 1,
        allowedFileTypes: ['video/*', 'image/*'],
    },
    meta: {
        title: 'title',
        name: 'name',
        //cameraModel: '642687c0cfc1a73848a58f68', otherCameraModel: ''
    },
    id: 'uppyAerial',
    allowMultipleUploads: true,
    allowMultipleUploadBatches: true,
} as UppyOptions);

const driveOpts: GoogleDriveOptions = { 
    companionUrl,
    // companionAllowedHosts: ['http://companion.uppy.io', 'http://localhost:3000', 'http://localhost:3001']
};
uppy.use(GoogleDrive, driveOpts);

const dropboxOpts: DropboxOptions = {
    companionUrl,
    // companionAllowedHosts: ['https://companion.uppy.io', 'http://companion.uppy.io', 'http://localhost:3000', 'http://localhost:3001']
};
uppy.use(Dropbox, dropboxOpts);

uppy.use(Tus, {
    endpoint: `${TUS_ENDPOINT}`,
    chunkSize: 6 * 1024 * 1024,
    // allowedMetaFields: ['title', 'name', 'contentType', 'cacheControl'],
    async onBeforeRequest(req: any) {
        const auth_token = await getAuthToken();
        req.setHeader('Authorization', `Bearer ${auth_token}`);
        // TODO: add body.
    },
    onShouldRetry(err: any, retryAttempt, options, next) {
        if (err?.originalResponse?.getStatus() !== 401) {
            return true;
        }
        return next(err);
    },
    async onAfterResponse(req, res) {
        if (res.getStatus() === 401) {
            await refreshAuthToken();
        }
    },
} as TusOptions);
// uppy.use(Webcam);
// uppy.use(RemoteSources, {
//     companionUrl: 'https://companion.uppy.io/',
//     // sources: ['GoogleDrive'],
// });

// const xhrOptions: XHRUploadOptions = {
//     endpoint: `${process.env.NEXT_PUBLIC_BASE_URL}/dataTokens/upload`,
//     bundle: true,
//     fieldName: 'files',
//     formData: true,
//     id: 'XHRUpload',
//     method: 'POST',
//     headers: {
//         authorization: `Bearer ${token}`,
//     },
// };
// uppy.use(XHRUpload, xhrOptions);

uppy.on('file-added', (file: any) => {
    console.log('-----file added-------');
    file.meta = {
        ...file.meta,
        bucketName: 'navigate-dev',
        objectName: `${file.name}`,
        contentType: file.type,
        title: 'title',
        name: 'name'
    };
    console.log({ file });
});
uppy.on('upload', (data) => {
    // data object consists of `id` with upload ID and `fileIDs` array
    // with file IDs in current upload
    // data: { id, fileIDs }
    console.log(`Starting upload ${data.id} for files ${data.fileIDs}`);
});

uppy.on('complete', (result) => {
    if (result.failed.length === 0) {
      console.log('Upload successful 😀')
    } else {
      console.warn('Upload failed 😞')
    }
    console.log('successful files:', result.successful)
    console.log('failed files:', result.failed)
    // uploadUUID = uuid();
});

// uppy.on('upload-error', (file: any, error: Error) => console.log(error));
// uppy.on('error', (err: Error) => console.log(err));
uppy.on('progress', (progress: number) => console.log({ progress }));
// todo: handle more events

// helper methods
const getAuthToken = async () => token;
const refreshAuthToken = async () => {
    const loginBaseURL = `${process.env.NEXT_PUBLIC_BASE_URL}/web2/auth/signin`;
    try {
        const response = await fetch(loginBaseURL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: JSON.stringify({
            email: 'raza988@gmail.com',
            password: '12345678'
          }),
        });

        if (response.ok) {
          const result = await response.json();
          token = result.data.auth_token;
          console.log('------auth-token update-----');
        } else {
          throw new Error('Request failed');
        }
    } catch (err) {
        console.error(err);
    }
    // fetch login api
    // token = response.data.auth_token
};
// end helper methods
console.log('-------UploadArea: Outside component---------');
export default function UploadArea(props: any) {
    console.log('-------UploadArea: Rendered---------');
    
    useEffect(() => {
        return () => uppy.close({ reason: 'unmount' })
    }, []);

    return (
        <Fragment>
            <Dashboard
                uppy={uppy}
                plugins={['DragDrop', 'GoogleDrive', 'Dropbox']}
                showProgressDetails={true}
                // showPauseResumeButtons={true}
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
