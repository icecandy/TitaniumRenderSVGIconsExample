// @author        Simon Buckingham
// @date          27 September 2017
// @description   Example Titanium project to render a tinted icon image from a source SVG file using 2 methods:
//                Method 1. tinting the SVG image with the "tintColor" property and
//                Method 2: on Android only, editing the source SVG text file
// @credits       Icon calendar_icon.svg designed by Simpleicon Business https://www.flaticon.com/packs/simpleicon-business from www.flaticon.com

//REQUIRES
var ImageLibrary = require('imageLibrary');

//CONSTANTS
var SVG_FILE_PATH = '/images/svg/calendar_icon.svg',
    WIDTH = HEIGHT = 100,
    TINTS = ['#FF0000', '#00FF00', '#0000FF'];

//METHOD 1 - rendering an SVG image and then tinting it
var svgImage = ImageLibrary.getSVGImage(SVG_FILE_PATH, WIDTH, HEIGHT);

//render 2 versions of the icon in 2 different tint colours - just to prove that the tinting is working!
for (var i = 1; i <= 2; i++) {

    //reference the ImageViews
    var iconView = $['icon' + i];

    //set their width & height - the source bitmaps will be 1x/2x/3x etc larger, dependent on the device screen density
    iconView.width = WIDTH;
    iconView.height = HEIGHT;

    //add image blob to the image view
    iconView.image = svgImage;

    //tint the images
    iconView.tintColor = TINTS[i - 1];
}

//METHOD 2 - changing the tint values in the SVG text file, then rendering the newly created SVG file - ONLY WORKS ON ANDROID
if (OS_ANDROID) {

    var svgTintedFile = ImageLibrary.getSVGTintedFile('.' + SVG_FILE_PATH, TINTS[2]);
    if (svgTintedFile) {
        console.log('svgTintedFile.nativePath = ' + svgTintedFile.nativePath);
        var svgTintedImage = ImageLibrary.getSVGImage(svgTintedFile.nativePath, WIDTH, HEIGHT);

        $.icon3.width = WIDTH;
        $.icon3.height = HEIGHT;
        $.icon3.image = svgTintedImage;
    }
}

$.win.open();
