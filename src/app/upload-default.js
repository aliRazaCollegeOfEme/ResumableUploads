// import Uppy from '@uppy/core';
// import Dashboard from '@uppy/dashboard';
// import XHR from '@uppy/xhr-upload';

// import '@uppy/core/dist/style.min.css';
// import '@uppy/dashboard/dist/style.min.css';

// new Uppy()
//     .use(Dashboard, {
//         inline: true, 
//         target: '#uploader',
//         showProgressDetails: true,
//         proudlyDisplayPoweredByUppy: false
//     })
//     .use(XHR, {
//         endpoint: `${process.env.NEXT_PUBLIC_BASE_URL}/dataTokens/tusUpload/`,
//         bundle: true,
//         fieldName: 'files',
//         formData: true,
//         id: 'XHRUpload',
//         method: 'POST'
//     });