const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const {Storage} = require('@google-cloud/storage');
const os = require('os');
const projectId = admin.instanceId().app.options.projectId
const path = require('path');

exports.onFileChange =functions.storage.object().onFinalize(event => {
    const key=Date.now();
    const bucket = event.bucket;
    const contentType = event.contentType;
    const filepath = event.selfLink;
    const storage = new Storage({
        projectId: projectId,
      });
    const file = event.name;
    if(path.basename(filepath).startsWith('renamed-')){
        console.log('We have already renamed the file path');
    }else{
        const destBucket = storage.bucket(bucket);
        const tempFilePath = path.join(os.tmpdir(),path.basename(filepath));
        const metadata = {contentType:contentType};
        return destBucket.file(file).download({
        destination:tempFilePath
    }).then(()=>{
        const newName = 'renamed-'+key+ path.basename(filepath);
        destBucket.upload(tempFilePath,{
            destination:newName,
            metdata:metadata
        });
        destBucket.delete(filepath);
        return newName;
    });
    }
    
});
