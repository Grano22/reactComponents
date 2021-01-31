# React Components by Grano22

## List of components:
* uploadControl - File upload form control

### uploadControl
**Props**:  
    **Configuration Props**:  
        multiple: boolean - upload multiple file or one only  
        previewFiles: boolean - use fileReader to get and pass resource (with file preview in element)  
        accepts: Array<string> - array of accepted formats to upload 
        lang: string - language of contents in element  
        preventWindowDropping: boolean - set prevent event from default browser behaviour  
        onlyFiles: boolean - capture only files (if not will receive dragged media)  
        acceptsMode: number - 0 means accept prop will set including formats, otherwise 1 will set excluding formats  
        className: string - class name prefix for element  
Usage:
```javascript
<UploadFormControl multiple={false} onUploadStart={()=>{
    //Make for example variable to disable submit button before files successfully = initialised (with resource)
}} onFileReceive={fc=>{
    console.log("fileContext", fc);
    //Now you can prepare your formData easy
    let yourForm = document.forms['yourForm'] || document.yourForm || document.getElementById("yourForm") || document.createElement("form");
    let fd = new FormData(yourForm);
    fd.append("myAwesomeFile", fc);
}} onAllFileReceive={fcol=>{
    console.log("fileCollection", fcol);
    //Do some actions for file collectin after all uploads!
}}/>
```