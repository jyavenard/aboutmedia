
function EscapeHTML(string) {
  var entityMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': '&quot;',
    "'": '&#39;',
    "/": '&#x2F;'
  };
  return String(string).replace(/[&<>"'\/]/g, function (s) {
    return entityMap[s];
  });
}

function MediaDetails(media) {
  var text = "";
  var found = false;

  if (media.length > 0) {
    if (found) {
      text += "\n";
    }
    found = true;
    text += EscapeHTML(content.document.location) + "\n";
  }

  for (var j=0; j < media.length; ++j) {
    text += "\t" + EscapeHTML(media[j].currentSrc) + "\n";
    text += "\t" + "currentTime: " + media[j].currentTime + " readyState: " + media[j].readyState;
    if (media[j].error) {
      text += " error: " + media[j].error.code;
      if ((typeof media[j].error.message === 'string' || media[j].error.message instanceof String)
          && media[j].error.message.length > 0) {
        text += " (" + media[j].error.message + ")";
      }
    }
    text += "\n";

    let quality = media[j].getVideoPlaybackQuality();
    let ratio = "--"
    if (quality.totalVideoFrames > 0) {
      ratio = 100 - Math.round(100 * quality.droppedVideoFrames / quality.totalVideoFrames);
      ratio += "%";
    }
    text += "\tQuality: " + ratio;
    text += " (total:" + quality.totalVideoFrames;
    text += " dropped:" + quality.droppedVideoFrames;
    text += " corrupted:" + quality.corruptedVideoFrames + ")\n";

    text += "\tBuffered ranges: [";
    for (var l=0; l < media[j].buffered.length; ++l) {
      text += "(" + media[j].buffered.start(l) + ", " + media[j].buffered.end(l) + ")";
    }
    text += "]\n";

    var ms = media[j].mozMediaSourceObject;
    if (ms) {
      for (var k=0; k < ms.sourceBuffers.length; ++k) {
        var sb = ms.sourceBuffers[k];
        text += "\t\tSourceBuffer " + k + "\n";
        for (var l=0; l < sb.buffered.length; ++l) {
          text += "\t\t\tstart=" + sb.buffered.start(l) + " end=" + sb.buffered.end(l) + "\n";
        }
      }
      text += "\tInternal Data:\n";
      var debugLines = ms.mozDebugReaderData.split("\n");
      for(var m=0; m < debugLines.length; ++m) {
        text += "\t" + debugLines[m] + "\n";
      }
    } else if (media[j].mozDebugReaderData) {
      text += "\tInternal Data:\n";
      var debugLines = media[j].mozDebugReaderData.split("\n");
      for(var m=0; m < debugLines.length; ++m) {
        text += "\t" + debugLines[m] + "\n";
      }
    }
    if (j < media.length - 1) {
      text += "\n";
    }
  }
  return text;
}

var media = content.document.getElementsByTagName("video");
if (media.length > 0) {
  let text = MediaDetails(media);
  sendAsyncMessage("aboutmedia-videodetails", { details: text });
}
