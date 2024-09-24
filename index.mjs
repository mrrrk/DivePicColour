import { getColorFilterMatrix } from "./colourCorrection.mjs";


const dropZone = document.getElementById("drop-zone");
const fileInput = document.createElement('input');
fileInput.type = "file";
//const canvas = document.createElement("canvas");


const sourcePreviewCanvas = document.getElementById("source-preview-canvas");
const targetPreviewCanvas = document.getElementById("target-preview-canvas");

// TODO - https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/File_drag_and_drop

fileInput.onchange = e => { 
    // TODO - multiple files...???
    const file = e.target.files[0]; 
    if (!file) return;

    loadSourceImage(file);

}

dropZone.onclick = () => {
    fileInput?.click();
}

const loadSourceImage = (file) => {
    if (!String(file?.type).startsWith("image")) {
        alert("Sorry, Not an image");
        console.log("TYPE = ", file?.type);
        return;
    }

    const sourceImage = document.createElement("img");
    const targetCanvas = document.createElement("canvas");

    sourceImage.onload = () => {

        const width = sourceImage.width;
        const height = sourceImage.height;

        targetCanvas.width = width;
        targetCanvas.height = height;
        const targetContext = targetCanvas.getContext("2d");
        targetContext.drawImage(sourceImage, 0, 0);
    
        //console.log(`canvas h=${height} w=${width}`);
    
        const sourceData = targetContext.getImageData(0, 0, width, height);
    
        const filterMatrix = getColorFilterMatrix(sourceData.data, width, height);
        console.log("matrix = ", filterMatrix);

        // apply the filter
        const targetData = targetContext.createImageData(width, height);
        for (let i = 0; i < sourceData.data.length; i += 4) {
            targetData.data[i] =     Math.min(255, Math.max(0, sourceData.data[i]     * filterMatrix[0] + sourceData.data[i + 1] * filterMatrix[1] + sourceData.data[i + 2] * filterMatrix[2] + filterMatrix[4] * 255)) // Red
            targetData.data[i + 1] = Math.min(255, Math.max(0, sourceData.data[i + 1] * filterMatrix[6] + filterMatrix[9] * 255)) // Green
            targetData.data[i + 2] = Math.min(255, Math.max(0, sourceData.data[i + 2] * filterMatrix[12] + filterMatrix[14] * 255)) // Blue
            targetData.data[i + 3] = 255; // Alpha channel
        }
        // for (let i = 0; i < imgData.data.length; i += 4) {
        //     newData.data[i] = imgData.data[i] * 2; // R
        //     newData.data[i + 1] = imgData.data[i + 1]; // G
        //     newData.data[i + 2] = imgData.data[i + 2]; // B
        //     newData.data[i + 3] = 255; // A
        // }  
        targetContext.putImageData(targetData, 0, 0);

        // show preview
        const psCtx = sourcePreviewCanvas.getContext("2d");
        const ptCtx = targetPreviewCanvas.getContext("2d");
        const previewWidth = width / 5;
        const previewHeight = height / 5;       
        sourcePreviewCanvas.width = previewWidth;
        sourcePreviewCanvas.height = previewHeight;
        targetPreviewCanvas.width = previewWidth;
        targetPreviewCanvas.height = previewHeight;
        psCtx.drawImage(sourceImage, 0,0 ,width, height, 0,0, previewWidth, previewHeight);
        ptCtx.drawImage(targetCanvas, 0,0 ,width, height, 0,0, previewWidth, previewHeight);
    };

    const fr = new FileReader();
    fr.onload = () => {
        sourceImage.src = fr.result;
    }
    fr.readAsDataURL(file);
}

