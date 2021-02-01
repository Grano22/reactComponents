import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './uploadControl.css';

export const UploadFilesTypes = {
    "text":[ "txt", "rtf" ],
    "images":[ "png", "jpeg", "jpg", "webp", "gif", "svg" ],
    "vectorImages":[ "svg" ],
    "bitmapImages":[ "png", "jpg", "jpeg", "webp", "gif" ],
    "animations":[ "gif" ],
    "videos":[ "mp4", "mpeg4", "webm" ],
    "sounds":[ "mp3", "ogg", "wav", "aac", "weba" ],
    "archives":[ "7z", "rar", "zip", "tar" ],
    "presentations":[ "ppt", "pptx" ],
    "data":[ "json", "xml", "yml", "csv", "bson" ],
    "htmlFormats":[ "html", "htm" ],
    "fonts":[ "otf", "woff", "woff2", "ttf" ],
    "documents":[ "pdf", "docx", "doc", "odt" ],
    "commonDocuments":[ "pdf", "docx", "odt" ],
    "calcsheets":[ "xls", "xlsx" ]
}

class DirectoriesCollection {

}

class FilesCollection {
    all = [];
    dropped = [];
    input = [];

    get last() { return this.all[this.all.length - 1]; }
    get first() { return this.all[0]; }

    from(anyCollection, type="input", clearPrevious=false) {
        if(clearPrevious) this.clearAll();
        for(let i = 0, f;f = anyCollection[i];i++) {
            if(f.type && f.size%4096 != 0) {
                this.add(f, type);
            }
        }
    }

    addResource(ind, res) {
        if(typeof this.all[ind]!="undefined") {
            this.all[ind].resource = res;
            //this[this.all[ind].receivedFrom][ind].resource = res;
            for(let exTyped of this[this.all[ind].receivedFrom]) if(exTyped==this.all[ind]) { exTyped.resource = res; break; }
        } else console.error("Unknown index "+ind+" in files collection using addResource");
    }

    clearAll() { this.all = []; this.dropped = []; this.input = []; }

    remove(ind) {
        try {
            if(typeof this.all[ind]=="undefined") return null;
            let type = this.all[ind].receivedFrom;
            if(typeof this[type][ind]=="undefined") return null;
            this[type].splice(ind, 1);
            this.all.splice(ind, 1);
        } catch(exc) {
            console.error(exc);
        }
    }

    get(ind, type="any") {
        switch(type) {
            case "input":
                return this.input[ind];
            case "dropped":
                return this.dropped[ind];
            default:
            case "any":
                return this.all[ind];
        }
    }

    add(fileEntry, type="input") {
        if(!(fileEntry instanceof File)) { console.error("Cannot add non-file instance to FilesCollection"); return false; }
        fileEntry.receivedFrom = type;
        this.all.push(fileEntry);
        if(type=="input") this.input.push(fileEntry); else this.dropped.push(fileEntry);
        return true;
    }
}

/**
 * UploadFormControl to upload dran'n'drop files in react by Grano22
 */
export default class UploadFormControl extends Component {
    config = {
        className:"formUploadControl",
        multiple:false,
        previewFiles:true,
        accepts:[],
        lang:"en",
        onlyFiles:true,
        preventWindowDropping:true,
        acceptsMode:0 //0 - includes, 1 - excludes
    }
    dropContainer = React.createRef();
    filePreviewContainer = null;
    //lastStateSnapshot = null;
    contents = {
        beforeUpload:{
            header:{
                en:"File upload",
                pl:"Wysyłanie pliku"
            },
            headerMultiple:{
                en:"Upload some files",
                pl:"Wyślij pliki"
            },
            des:{
                en:"Drop file to send",
                pl:"Upuść pliki aby przesłać"
            },
            desMultiple:{
                en:"Drop files to send",
                pl:"Upuść pliki aby przesłać"
            },
            alt:{
                en:"or select file manually",
                pl:"albo wybierz plik manualnie"
            },
            altMultiple:{
                en:"or select files manually",
                pl:"albo wybierz pliki manualnie"
            }
        },
        duringUpload:{

        },
        uploadedMultiple:{
            des:{
                en:"Drop or select other file to change",
                pl:"Upuść lub wybierz inny plik do zastąpienia"
            }
        },
        uploadedOnce:{
            des:{
                en:"Drop or select another file to upload",
                pl:"Upuść lub wybierz kolejny plik do przesłania"
            }
        },
        duringDrag:{
            des:{
                en:"Drop file to upload",
                pl:"Upuść plik, aby wysłać"
            },
            desMultiple:{
                en:"Drop file to add",
                pl:"Upuść plik aby dodać"
            }
        },
        common:{
            fileSize:{
                en:"File size",
                pl:"Rozmiar pliku"
            },
            fileType:{
                en:"File type",
                pl:"Typ pliku"
            },
            fileName:{
                en:"File name",
                pl:"Nazwa pliku"
            },
            fileLastModified:{
                en:"Last modified",
                pl:"Ostatnio zmodyfikowany"
            },
            filePreviewNotAvailable:{
                en:"File preview is not available",
                pl:"Podgląd pliku niedostepny"
            },
            fileLack:{
                en:"None file is selected to preview",
                pl:"Brak wybranego pliku do podglądu"
            }
        }
    };
    //User Events
    onUploadStart = null;
    onUploadProgress = null;
    onAnyReceive = null;
    onFileReceive = null;
    onInputFileReceive = null;
    onDroppedFileReceive = null;
    onDroppedDirectoryReceived = null;
    onAllFileReceive = null;
    onUploadError = null;

    constructor(props) {
        super(props);
        this.state = {
            controlState:0, //0 - beforeUpload, 1 - duringUpload, 2 - uploadedOnce, 3 - uploadedMultiple
            fileContext: null,
            files:new FilesCollection()
        };
        if("describe" in props) { this.contents = Object.assign(this.contents, props["describe"]); }
        if(typeof props.onUploadError=="function") this.onUploadError = props.onUploadError.bind(this);
        if(typeof props.onUploadStart=="function") this.onUploadStart = props.onUploadStart.bind(this);
        if(typeof props.onFileReceive=="function") this.onFileReceive = props.onFileReceive.bind(this);
        if(typeof props.onAllFileReceive=="function") this.onAllFileReceive = props.onAllFileReceive.bind(this);
        for(let prop in props) { if(typeof props[prop]=="undefined" || typeof this.config[prop]=="undefined") continue; if(typeof this.config[prop]===typeof props[prop]) this.config[prop] = props[prop]; else { console.error(`Unknown property ${prop} in UploadFormControl, it original type is ${typeof this.config[prop]}`); } }
    }

    get id() {
        let coll = document.getElementsByClassName(this.config.className);
        return "UploadFormControl_" + coll.length;
    }

    componentDidMount() {
        this.handleDragEnter = this.handleDragEnter.bind(this);
        this.handleDragLeave = this.handleDragLeave.bind(this);
        this.handleDragOver = this.handleDragOver.bind(this);
        this.handleDrop = this.handleDrop.bind(this);
        let pointRef = this.dropContainer || this.dropContainer.current;
        
        pointRef.addEventListener('dragenter', this.handleDragEnter);
        pointRef.addEventListener('dragleave', this.handleDragLeave);
        pointRef.addEventListener('dragover', this.handleDragOver);
        pointRef.addEventListener('drop', this.handleDrop);
        if(this.config.preventWindowDropping) { 
            if(window.ondrop!=null) window.ondrop = function(ev) { ev = ev || event; ev.preventDefault(); }
            if(window.ondragover!=null) window.ondragover = function(ev) { ev = ev || event; ev.preventDefault(); }
        }
    }

    componentWillUnmount() {
        pointRef.removeEventListener('dragenter', this.handleDragEnter);
        pointRef.removeEventListener('dragleave', this.handleDragLeave);
        pointRef.removeEventListener('dragover', this.handleDragOver);
        pointRef.removeEventListener('drop', (this.config.multiple ? this.handleDropMultiple : this.handleDropOnce));
    }

    containsFiles(ev) {
        return ev.dataTransfer.types.includes("Files") || ev.dataTransfer.files.length>0 || ev.files.length>0;
    }

    //Handlers files drag'n'drop
    handleDragEnter(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        
    }

    handleDragLeave(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        this.removeOverFromContIfExist();
    }

    handleDragOver(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        this.addOverlayToContainer(this.config.multiple ? this.renderDuringDragMultiple(this.config.lang) : this.renderDuringDragOnce(this.config.lang));
    }

    handleDrop(ev) {
        this.onUploadStart(performance.now());
        this.removeOverFromContIfExist();
        if(this.config.multiple) {
            this.handleDropMultiple(ev);
        } else {
            this.handleDropOnce(ev);
        }
    }

    handleDropMultiple(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        let self = this;
        if(this.containsFiles(ev)) { //ev.dataTransfer.items && ev.dataTransfer.items.length > 0
            this.setState({controlState: 1, files:this.state.files});
            let totalFilesBefore = this.state.files.all.length, filesFromList = ev.dataTransfer.files || ev.files;
            for(let i = 0, f;f = filesFromList[i];i++) {
                if(!f.type && f.size%4096 == 0) {
                    
                } else {
                    if(this.config.accepts.length==0 || ((this.config.acceptsMode && !this.config.accepts.includes(f.type)) || (!this.config.acceptsMode && this.config.accepts.includes(f.type)))) {
                        this.state.files.add(f, "dropped");
                    if(this.config.previewFiles) {
                        let fr = new FileReader();
                        fr.onload = function(evt) {
                            f.resource = evt.target.result || fr.result;
                            self.state.files.addResource(totalFilesBefore + i, f.resource);
                            self.filePreviewContainer.innerHTML = self.prepareResourceOutputHTML(f.resource, f.type);
                            if(typeof self.onFileReceive=="function") self.onFileReceive(f, performance.now());
                            if(i==(self.state.files.all.length - 1) && typeof self.onAllFileReceive=="function") self.onAllFileReceive(self.state.files.all, performance.now());
                        }
                        fr.onerror = function(evt) {
                            console.error(evt);
                        }
                        fr.onprogress = function(evt) {

                        }
                        fr.readAsDataURL(f);
                    } else {
                        if(typeof self.onFileReceive=="function") self.onFileReceive(f, performance.now());
                        if(typeof self.onAllFileReceive=="function") self.onAllFileReceive(self.state.files.all, performance.now());
                    } }
                    
                }
            }
            this.fileContext = this.state.files.last || null;
            this.setState({controlState: 3, files:this.state.files});
        }
    }

    handleDropOnce(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        let self = this;
        if(this.containsFiles(ev)) {
            this.state.files.clearAll();
            this.setState({controlState: 1, files:this.state.files});
            let f = ev.dataTransfer.files[0] || ev.files[0];
            if(!f.type && f.size%4096 == 0) {
                    
            } else {
                if(this.config.accepts.length==0 || ((this.config.acceptsMode && !this.config.accepts.includes(f.type)) || (!this.config.acceptsMode && this.config.accepts.includes(f.type)))) {
                    self.state.files.add(f, "dropped");
                if(this.config.previewFiles) {
                    let fr = new FileReader();
                    fr.onload = function(evt) {
                        f.resource = evt.target.result || fr.result;
                        self.state.files.addResource(0, f.resource);
                        self.filePreviewContainer.innerHTML = self.prepareResourceOutputHTML(f.resource, f.type);
                        if(typeof self.onFileReceive=="function") self.onFileReceive(f, performance.now());
                        if(typeof self.onAllFileReceive=="function") self.onAllFileReceive(self.state.files.all, performance.now());
                    }
                    fr.onerror = function(evt) {
                        console.error(evt);
                    }
                    fr.onprogress = function(evt) {

                    }
                    fr.readAsDataURL(f);
                } else {
                    if(typeof this.onFileReceive=="function") this.onFileReceive(f, performance.now());
                    if(typeof self.onAllFileReceive=="function") self.onAllFileReceive(self.state.files.all, performance.now());
                } }
                
            }
            this.fileContext = this.state.files.get(0) || null;
            this.setState({controlState: 2, files:this.state.files});
        }
    }

    //Handle files changes
    handleFileChange(ev) {
        this.onUploadStart(performance.now());
        let self = this, elTg = ev.currentTarget, f = elTg.files[0];
        this.state.files.clearAll();
        this.state.files.add(f, "input");
        if(this.config.previewFiles) {
            let fr = new FileReader();
            fr.onload = function(evt) {
                f.resource = evt.target.result || fr.result;
                self.state.files.addResource(0, f.resource);
                self.filePreviewContainer.innerHTML = self.prepareResourceOutputHTML(f.resource, f.type);
                if(typeof self.onFileReceive=="function") self.onFileReceive(f);
                if(typeof self.onAllFileReceive=="function") self.onAllFileReceive(self.state.files.all);
            }
            fr.onerror = function(evt) {
                console.error(evt);
            }
            fr.onprogress = function(evt) {

            }
            fr.readAsDataURL(f);
        } else {
            if(typeof this.onFileReceive=="function") this.onFileReceive(f);
            if(typeof self.onAllFileReceive=="function") self.onAllFileReceive(self.state.files.all);
        }
        this.fileContext = this.state.files.get(0) || null;
        this.setState({controlState:2, files:this.state.files});
    }

    handleFileAddition(ev) {
        this.onUploadStart(performance.now());
        let self = this, elTg = ev.currentTarget, totalFilesBefore = this.state.files.all.length;
        for(let i = 0, f;f = elTg.files[i];i++) {
            this.state.files.add(f, "input");
            if(this.config.previewFiles) {
                let fr = new FileReader();
                fr.onload = function(evt) {
                    f.resource = evt.target.result || fr.result;
                    self.state.files.addResource(totalFilesBefore + i, f.resource);
                    self.filePreviewContainer.innerHTML = self.prepareResourceOutputHTML(f.resource, f.type);
                    if(typeof self.onFileReceive=="function") self.onFileReceive(f);
                    if(i==(self.state.files.all.length - 1) && typeof self.onAllFileReceive=="function") self.onAllFileReceive(self.state.files.all);
                }
                fr.onerror = function(evt) {
                    console.error(evt);
                }
                fr.onprogress = function(evt) {
    
                }
                fr.readAsDataURL(f);
            } else {
                if(typeof this.onFileReceive=="function") this.onFileReceive(f);
                if(typeof self.onAllFileReceive=="function") self.onAllFileReceive(self.state.files.all);
            }
        }
        this.fileContext = this.state.files.last || null;
        this.setState({controlState:3, files:this.state.files});
    }

    clearContext() {
        this.files = new FilesCollection();
        this.fileContext = null;
        this.setState({controlState:0});
    }

    /**
     * List entries of files as React Component
     */
    listFiles() {
        let self = this;
        return this.state.files.all.map((fc, fi)=>(<li className={"fileEntry"+(this.fileContext==fc ? " active" : "")} key={fi} data-index={fi} onClick={ev=>{
            ev.stopPropagation();
            self.fileContext = fc;
            self.filePreviewContainer.innerHTML = self.prepareResourceOutputHTML(fc.resource, fc.type);
            self.setState({});
        }}><span className="fileIndex">{fi}</span><span>{fc.name}</span><span className="fileOptions"><span className="deleteFileEntryButton" onClick={ev=>{
            ev.stopPropagation();
            self.state.files.remove(fi);
            if(self.state.files.all.length<=0) self.setState({controlState:0, files:self.state.files}); else { self.fileContext = self.state.files.last;
            self.setState({files:self.state.files}); }
        }}>&times;</span></span></li>));
    }

    renderDuringDragMultiple(currLang) {
        return this.contents.duringDrag.desMultiple[currLang];
    }

    renderDuringDragOnce(currLang) {
        return this.contents.duringDrag.des[currLang];
    }

    renderUploadedMultiple(currlang) {
        let self = this;
        return (<><div className="fileDescription">
            {this.fileContext!=null ? (<>
                <div ref={el=>this.filePreviewContainer = el} id={this.id+"_preview"} className="filePreview">Preview loading...</div>
                <strong>{this.contents.common.fileName[currlang]}</strong>: {this.fileContext.name}<br/>
                <strong>{this.contents.common.fileType[currlang]}</strong>: {this.fileContext.type}<br/>
                <strong>{this.contents.common.fileSize[currlang]}</strong>: {this.fileContext.size}<br/>
                <strong>{this.contents.common.fileLastModified[currlang]}</strong>: {this.fileContext.lastModifiedDate.toISOString().slice(0, 19).replace('T', ' ')}
            </>) : this.contents.common.fileLack[currlang]}
        </div><ul className="filesEntries">{this.listFiles()}</ul><input type="file" onChange={ev=>self.handleFileAddition(ev)} multiple/><br/>{this.contents.uploadedMultiple.des[currlang]}</>);
    }

    renderUploadedOnce(currlang, fileContext) {
        let self = this;
        return (<><div className="fileDescription">
            {this.fileContext!=null ? (<>
                <div ref={el=>this.filePreviewContainer = el} id={this.id+"_preview"} className="filePreview">Preview loading...</div>
                <strong>{this.contents.common.fileName[currlang]}</strong>: {this.fileContext.name}<br/>
                <strong>{this.contents.common.fileType[currlang]}</strong>: {this.fileContext.type}<br/>
                <strong>{this.contents.common.fileSize[currlang]}</strong>: {this.fileContext.size}<br/>
                <strong>{this.contents.common.fileLastModified[currlang]}</strong>: {this.fileContext.lastModifiedDate.toISOString().slice(0, 19).replace('T', ' ')}
            </>) : this.contents.common.fileLack[currlang]}
        </div><div className="fileOptions"><span className="fileUploadControlCloseButton" onClick={ev=>{
            self.state.files.clearAll();
            self.setState({ controlState:0, files:self.state.files });
        }}>&times;</span><br/>{this.contents.uploadedOnce.des[currlang]}</div><input type="file" onChange={ev=>self.handleFileChange(ev)}/></>);
    }

    renderDuringUpload() {
        return (<div className="filePreloadAnimation"></div>);
    }

    renderBeforeUpload(currlang) {
        let self = this;
        return this.config.multiple ? (<>
            <h3>{self.contents.beforeUpload.headerMultiple[currlang]}</h3>
            <p>{self.contents.beforeUpload.desMultiple[currlang]}</p> {self.contents.beforeUpload.altMultiple[currlang]}<br/>
            <input type="file" onChange={ev=>self.handleFileAddition(ev)} multiple/>
        </>) : (<>
            <h3>{self.contents.beforeUpload.header[currlang]}</h3>
            <p>{self.contents.beforeUpload.desMultiple[currlang]}</p> {self.contents.beforeUpload.alt[currlang]}<br/>
            <input type="file" onChange={ev=>self.handleFileChange(ev)}/>
        </>);
    }

    prepareResourceOutput(data, mimeType) {
        let mimeDetect = mimeType.indexOf("/");
        if(mimeDetect>=0) mimeDetect = mimeType.substring(0, mimeDetect); else mimeDetect = mimeType;
        switch(mimeDetect) {
            case "image":
                return <img src={data}/>;
            case "video":
                return <video controls><source src={data} type={mimeType}/></video>;
            default:
                return <output>{data}</output>;
        }
    }

    prepareResourceOutputHTML(data, mimeType) {
        let mimeDetect = mimeType.indexOf("/");
        if(mimeDetect>=0) mimeDetect = mimeType.substring(0, mimeDetect); else mimeDetect = mimeType;
        switch(mimeDetect) {
            case "image":
                return `<img src="${data}"/>`;
            case "video":
                return `<video controls><source src="${data}" type="${mimeType}"/></video>`;
            default:
                return `<output>${data}</output>`;
        }
    }

    prepareResourceOutputNativeElement(data, mimeType) {
        let mimeDetect = mimeType.indexOf("/");
        if(mimeDetect>=0) mimeDetect = mimeType.substring(0, mimeDetect); else mimeDetect = mimeType;
        let baseEl = null;
        switch(mimeDetect) {
            case "image":
                baseEl = document.createElement("img");
                baseEl.src = data;
            break;
            case "video":
                baseEl = document.createElement("video");
                    let baseSrc = document.createElement("source");
                    baseSrc.src = data;
                    baseSrc.type = mimeType;
                baseEl.appendChild(baseSrc);
            break;
            default:
                baseEl = document.createElement("output");
                baseEl.textContent = data;
        }
        return baseEl;
    }

    addOverlayToContainer(tgJSXEl) {
        let tgCont = this.dropContainer.current || this.dropContainer;
        if(typeof tgCont.children[1]!="undefined") return false;
        tgCont.children[0].style.display = "none";
        let overlayContainer = document.createElement("div");
        overlayContainer.className = this.config.className+"_overlayContainer";
        overlayContainer.style.pointerEvents = "none";
            if(typeof tgJSXEl=="string") overlayContainer.appendChild(document.createTextNode(tgJSXEl)); else if(React.isValidElement(tgJSXEl)) ReactDom.render(tgJSXEl, overlayContainer); else console.error("Unknown node");
        tgCont.appendChild(overlayContainer);
        return true;
    }

    removeOverlayFromContainer() {
        let tgCont = this.dropContainer.current || this.dropContainer;
        tgCont.children[0].removeAttribute("style");
        tgCont.children[1].remove();
    }

    removeOverFromContIfExist() {
        let tgCont = this.dropContainer.current || this.dropContainer;
        if(typeof tgCont.children[1]!="undefined") this.removeOverlayFromContainer();
    }

    render() {
        let self = this, subContent = (<></>);
        switch(this.state.controlState) {
            case 3:
                subContent = this.renderUploadedMultiple(this.config.lang);
            break;
            case 2:
                subContent = this.renderUploadedOnce(this.config.lang);
            break;
            case 1:
                subContent = this.renderDuringUpload(this.config.lang);
            break;
            default:
            case 0:
                subContent = this.renderBeforeUpload(this.config.lang);
        }
        return (<div ref={el=>this.dropContainer = el} className={"formUploadControl"+(this.multiple ? " formUploadControlMultiple" : "")}><div className="inControl">{subContent}</div></div>);
    }    
}