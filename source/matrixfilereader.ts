//interface FileReader {
//    readAsMatrix(blob: Blob): void;
//}

//if (!FileReader.prototype.readAsMatrix) {
//    FileReader.prototype.readAsMatrix = (blob: Blob) => {
//        var matrix = new Matrix();
//        var reader = new FileReader();
//        //(<FileReader>this).dispatchEvent();
//    };
//}

class BlobStream {
    private indexInSlice = 0;
    private slice = new ArrayBuffer(0);
    private sliceIndex: number;
    private sliceSize = 10240;//10 MiB, the size of the resulting slice
    private left: number;
    constructor(private blob: Blob) {
        this.left = blob.size;
    }

    //read(length = this.blob.size) {

    //}

    private readNextSlice(onload: () => any) {
        if (this.sliceIndex === undefined)
            this.sliceIndex = 0;
        else
            this.sliceIndex++;
        var start = this.sliceIndex * this.sliceSize;
        if (this.left == 0)
            throw new Error("No left input stream");
        else {
            var reader = new FileReader();
            reader.onload = (ev: ProgressEvent) => {
                this.slice = <ArrayBuffer>(<FileReader>ev.target).result;
                this.left -= blobSlice.size;
                this.indexInSlice = 0;
            };
            var blobSlice: Blob;
            if (this.left < this.sliceSize)
                blobSlice = this.blob.slice(start, start + this.left);
            else
                blobSlice = this.blob.slice(start, start + this.sliceSize);
            reader.readAsArrayBuffer(blobSlice);
        }
    }

    readLine(oncomplete: (result: string) => any) {//currently only supports ASCII
        var result = '';
        var view = new Uint8Array(this.slice);
        var i: number;
        var asyncFunction = () => {
            for (i = this.indexInSlice; i < this.slice.byteLength; i++) {
                if (view[i] === 0x0A)
                    break;
            }
            if (view[i] !== 0x0A) {
                result += String.fromCharCode.apply(null, view.subarray(this.indexInSlice));
                this.readNextSlice(() => {
                    i = 0;
                    window.setImmediate(asyncFunction);
                });
            }
            else if (this.left == 0)
                oncomplete(null);
            else {
                result += String.fromCharCode.apply(null, view.subarray(this.indexInSlice, i));
                this.indexInSlice = i + 1;
                oncomplete(result);
            }
        };
        asyncFunction();
    }
}