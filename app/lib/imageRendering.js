// Image Library
// @author Simon Buckingham
// @date   29th April, 2017
// This uses a combination of techniques to:
// (i) create bitmaps from SVG vector files using the com.geraudbourdin.svgview native cross-platform module
// (ii) create a tinted image.
// NB Note athat there is a weird effect that on iOS using Ti.UI.createMaskedImage it creates blobs that are vertically flipped and so we use a transform = Ti.UI.create2DMatrix().scale(1, -1)
//    to flip the image back again.

//REQUIRES
var SVGView = require('com.geraudbourdin.svgview');

//VARS

//CONSTANTS
//NB Ti.Filesystem.applicationCacheDirectory is a semi-permanent directory which retains files on app exit,
//but the OS may clear if it needs the space (on Android the max size is 25MB)
//If more permanent storage is need use Ti.Filesystem.applicationDataDirectory - files persist until the user uninstalls the app
var FILESYSTEM_CACHE_DIRECTORY = Ti.Filesystem.applicationDataDirectory; //Ti.Filesystem.applicationCacheDirectory/Ti.Filesystem.applicationDataDirectory;
var SAVED_IMAGE_FILE_EXTENSION = '.png';

//EXPORTS
exports.getiOSTintedImage = getiOSTintedImage;

//iOS only
//@_filePath           String  - absolute file path
//@_width              Int     - width in dp pixels
//@_height             Int     - height in dp pixels
//@_tint               String  - tint colour as a string eg '#FF0000'
function getiOSTintedImage(_filePath, _width, _height, _tint)
{
	var file = Ti.Filesystem.getFile(_filePath);
	//just do a safety check on the file existence first
	if (!file.exists())
	{
		Ti.API.error('ImageLibrary getiOSTintedImageFilePath: file does not exist with filePath = ', _filePath);
		return _filePath;
	}

	var imageScaleFactor = Ti.Platform.displayCaps.logicalDensityFactor;
	var maskedImageOptions = {
		width: _width * imageScaleFactor,
		height: _height * imageScaleFactor,
		image: _filePath, //CAN ONLY USE STRING IN MASKED IMAGE!!!!!
		tint: _tint,
		mode: Ti.UI.iOS.BLEND_MODE_SOURCE_IN
	};
	var tintedImage = Ti.UI.createMaskedImage(maskedImageOptions).toImage();
	switch (_returnType)
	{
		case 'filePath':
			//create new file and delete old file
			var newFile = getApplicationCacheFile(_name, _tint);
			newFile.write(tintedImage);
			//delete original SVG image file as we don't need it anymore. If we are reusing the original
			//to enable multiple tints of the same source file we would not delete it here.
			file.deleteFile();
			return newFile.exists() ? newFile.getNativePath() : null;
			break;

		case 'blob':
			//delete original image file to tidy up - but see above if we want to reuse files
			file.deleteFile();
			return tintedImage;
			break;
	}
}
