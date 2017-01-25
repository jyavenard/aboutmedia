
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

  for (let v of media) {
    addItem(list, v.currentSrc);
    addItem(list, "currentTime: " + v.currentTime + " readyState: " + v.readyState);
    if (v.error) {
      let s = " error: " + v.error.code;
      if ((typeof v.error.message === 'string' || v.error.message instanceof String)
          && v.error.message.length > 0) {
        s += " (" + v.error.message + ")";
      }
      addItem(list, s);
    }

    let quality = v.getVideoPlaybackQuality();
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
    for (var l=0; l < v.buffered.length; ++l) {
      s += "(" + v.buffered.start(l) + ", " + v.buffered.end(l) + ")";
    }
    s += "]";
    addItem(list, s);

    var ms = v.mozMediaSourceObject;
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

    function postData(str) {
      let subList = addList(addItem(list, "Internal Data:"));
      for(let x of str.split("\n")) {
        addItem(subList, x);
      }
      sendAsyncMessage("aboutmedia-videodetails", { details: top.outerHTML });
    }

    if ("mozRequestDebugInfo" in v) {
      v.mozRequestDebugInfo().then(postData);
    } else {
      // backward compatibility.
      postData(v.mozDebugReaderData);
    }
  }
}

var media = content.document.getElementsByTagName("video");
if (media.length > 0) {
  MediaDetails(media);
}
