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
    left: number;
    constructor(public blob: Blob) {
        this.left = blob.size;
    }

    //read(length = this.blob.size) {

    //}

    private readNextSlice(oncomplete: () => any) {
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
                oncomplete();
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
        var asyncFunction = () => {
            var i = Array.prototype.indexOf.call(view, 0x0A, this.indexInSlice);
            if (i == -1) {
                if (this.left) {
                    result += String.fromCharCode.apply(null, view.subarray(this.indexInSlice));
                    this.readNextSlice(() => {
                        i = 0;
                        view = new Uint8Array(this.slice);
                        window.setImmediate(asyncFunction);
                    });
                }
                else
                    oncomplete(null);
            }
            else {
                result += String.fromCharCode.apply(null, view.subarray(this.indexInSlice, i));
                this.indexInSlice = i + 1;
                oncomplete(result);
            }
        };
        asyncFunction();
    }
}

class Matrix2DStream extends BlobStream {
    constructor(blob: Blob, public dimension = -1) {
        super(blob);
    }

    readRow(delimiter: string, oncomplete: (row: number[]) => any) {
        var asyncFunction = () => {
            super.readLine((line: string) => {
                var splitted = line.split(delimiter)
                    .map(function (s) { return parseFloat(s); });
                var valid = splitted.every(function (s) { return !isNaN(s) });
                if (valid) {
                    if (this.dimension == -1 || splitted.length == this.dimension) {
                        this.dimension = splitted.length;
                        oncomplete(splitted);
                    }
                    else
                        throw new Error("???");
                }
                else
                    window.setImmediate(asyncFunction);
            });
        }
        asyncFunction();
    }
}