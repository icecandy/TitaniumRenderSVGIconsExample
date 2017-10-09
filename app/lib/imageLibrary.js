// Image Library
// @author Simon Buckingham
// @date   29th September, 2017
// This uses a combination of techniques to:
// (i) create bitmaps from SVG vector files using the com.geraudbourdin.svgview native cross-platform module
// (ii) create a tinted image.
// Note: there is a weird effect that on iOS using Ti.UI.createMaskedImage it creates blobs that are vertically flipped and
// so we need to use a transform = Ti.UI.create2DMatrix().scale(1, -1) to flip the image back again.
// Copyright (c) 2017 Simon Buckingham. All Rights Reserved.
// Please see the LICENSE file included with this distribution for details.

//REQUIRES
var SVGView = require('com.geraudbourdin.svgview');

//CONSTANTS
//Note: Ti.Filesystem.applicationCacheDirectory is a semi-permanent directory which retains files on app exit,
//but the OS may clear if it needs the space (on Android the max size is 25MB)
//If more permanent storage is needed use Ti.Filesystem.applicationDataDirectory - files persist until the user uninstalls the app
var FILESYSTEM_CACHE_DIRECTORY = Ti.Filesystem.applicationDataDirectory,
    SAVED_IMAGE_FILE_PREFIX = Ti.App.id; //some unique string identifier eg 'com.icecandy.imagelibrarydev'

//EXPORTS
exports.getSVGImage = getSVGImage;
exports.getSVGTintedFile = getSVGTintedFile;

function getSVGImage(_relativeFilePath, _width, _height) {

    //scale the size of the bitmap according to the pixel density of the device eg 2x, 3x etc:
    //this is one of the great things about using a single, resolution-independent SVG image as we can scale for
    //different device screen densities and don't have to store all the density variations as bitmaps
    var imageScaleFactor = Ti.Platform.displayCaps.logicalDensityFactor;
    var svgOptions = {
        image: _relativeFilePath,
        width: _width * imageScaleFactor,
        height: _height * imageScaleFactor
    };

    return SVGView.createView(svgOptions).toImage();
}

function getSVGTintedFile(_relativeFilePath, _tint) {
    var file = Ti.Filesystem.getFile(_relativeFilePath);
    if (!file.exists()) {
        Ti.API.error('ImageLibrary getSVGTintedFile: source file does not exist, _relativeFilePath = ' + _relativeFilePath);
        return null;
    }
    var blob = file.read();
    var source = blob.text;
    source = source.replace(/#FFFFFF/ig, _tint);
    blob = Ti.createBuffer({value: source}).toBlob();

    //create new file in cache - we can't overwrite the original file as the app Resources directory is read-only
    var nameCode = file.name;
    file = getApplicationCacheFile(nameCode, 'svg');
    file.write(blob);

    return file;
}

//iOS only
//@_filePath           String  - absolute file path
//@_width              Int     - width in dp pixels
//@_height             Int     - height in dp pixels
//@_tint               String  - tint colour as a string eg '#FF0000'
function getiOSTintedImage(_filePath, _width, _height, _tint) {

    var imageScaleFactor = Ti.Platform.displayCaps.logicalDensityFactor;
    var maskedImageOptions = {
        width: _width * imageScaleFactor,
        height: _height * imageScaleFactor,
        image: _filePath, //IT IS ONLY POSSIBLE TO USE A STRING FILEPATH IN MASKED IMAGE (NOT A BLOB OR Ti.FILE) !!!!!
        tint: _tint,
        mode: Ti.UI.iOS.BLEND_MODE_SOURCE_IN
    };
    var tintedImage = Ti.UI.createMaskedImage(maskedImageOptions).toImage();

    return tintedImage;
}

//@_nameCode         String  - string to uniquely define the filename
//@_fileExtension    String  - file extension of file either a png bitmap image ('png') or an svg file ('svg')
function getApplicationCacheFile(_nameCode, _fileExtension) {

    var fileName = SAVED_IMAGE_FILE_PREFIX + '_' + _nameCode + '.' + _fileExtension;
    return Ti.Filesystem.getFile(FILESYSTEM_CACHE_DIRECTORY, fileName);
}
