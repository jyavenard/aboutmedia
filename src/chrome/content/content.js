
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

function addList(parent) {
  let list = content.document.createElement("ul");
  if (parent) {
    parent.appendChild(list);
  }
  return list;
}

function addItem(list, string) {
  let i = content.document.createElement("li");
  i.innerText = string;
  list.appendChild(i);
  return i;
}

function MediaDetails(media) {
  let top = addList(null);
  let list = addList(addItem(top, content.document.location));

  for (var j=0; j < media.length; ++j) {
    addItem(list, media[j].currentSrc);
    addItem(list, "currentTime: " + media[j].currentTime + " readyState: " + media[j].readyState);
    if (media[j].error) {
      let s = " error: " + media[j].error.code;
      if ((typeof media[j].error.message === 'string' || media[j].error.message instanceof String)
          && media[j].error.message.length > 0) {
        s += " (" + media[j].error.message + ")";
      }
      addItem(list, s);
    }

    let quality = media[j].getVideoPlaybackQuality();
    let ratio = "--"
    if (quality.totalVideoFrames > 0) {
      ratio = 100 - Math.round(100 * quality.droppedVideoFrames / quality.totalVideoFrames);
      ratio += "%";
    }
    addItem(list, "Quality: " + ratio +
                  " (total:" + quality.totalVideoFrames +
                  " dropped:" + quality.droppedVideoFrames +
                  " corrupted:" + quality.corruptedVideoFrames + ")");

    let s = "Buffered ranges: [";
    for (var l=0; l < media[j].buffered.length; ++l) {
      s += "(" + media[j].buffered.start(l) + ", " + media[j].buffered.end(l) + ")";
    }
    s += "]";
    addItem(list, s);

    var ms = media[j].mozMediaSourceObject;
    if (ms) {
      for (var k=0; k < ms.sourceBuffers.length; ++k) {
        var sb = ms.sourceBuffers[k];
        let s = `SourceBuffer[${k}]: `;
        for (var l=0; l < sb.buffered.length; ++l) {
          s += `(${sb.buffered.start(l)}, ${sb.buffered.end(l)})`;
        }
        addItem(list, s);
      }
    }

    let debugData = media[j].mozDebugReaderData;
    if (debugData) {
      let subList = addList(addItem(list, "Internal Data:"));
      for(let x of debugData.split("\n")) {
        addItem(subList, x);
      }
    }
  }

  sendAsyncMessage("aboutmedia-videodetails", { details: top.outerHTML });
}

var media = content.document.getElementsByTagName("video");
if (media.length > 0) {
  MediaDetails(media);
}
