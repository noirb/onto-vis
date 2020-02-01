/*
    Misc. Utility functions
*/

// convert a ros::Time to float value
function timestamp2float( time )
{
    var result = time.secs;
    result += time.nsecs * 0.000000001;
    return result;
}

// applies or removes visual styles to the given element to show that it's loading something
function showLoading( elem, show )
{
    if (show)
        elem.addClass('loading').addClass('disabled');
    else
        elem.removeClass('loading').removeClass('disabled');

    return elem;
}

function base64toBlob(b64Data, contentType, sliceSize) {
  contentType = contentType || '';
  sliceSize = sliceSize || 512;

  var byteCharacters = atob(b64Data);
  var byteArrays = [];

  for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    var slice = byteCharacters.slice(offset, offset + sliceSize);

    var byteNumbers = new Array(slice.length);
    for (var i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    var byteArray = new Uint8Array(byteNumbers);

    byteArrays.push(byteArray);
  }

  var blob = new Blob(byteArrays, {type: contentType});
  return blob;
}