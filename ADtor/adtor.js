console.log("Author: AD");

let savedSel;
let selecX, selecY;
function getSelectionCoords(win) {
  // console.log(win);
  win = window || win;
  var doc = win //.document;
  var sel = doc.selection, range, rects, rect;
  var x = 0, y = 0;
  if (sel) {
    if (sel.type != "Control") {
      range = sel.createRange();
      range.collapse(true);
      x = range.boundingLeft;
      y = range.boundingTop;
    }
  } else if (win.getSelection) {
    sel = win.getSelection();
    if (sel.rangeCount) {
      range = sel.getRangeAt(0).cloneRange();
      if (range.getClientRects) {
        range.collapse(true);
        rects = range.getClientRects();
        if (rects.length > 0) {
          rect = rects[0];
          x = rect.left;
          y = rect.top;
        }
      }
      // Fall back to inserting a temporary element
      if (x == 0 && y == 0) {
        var span = doc.createElement("span");
        if (span.getClientRects) {
          // Ensure span has dimensions and position by
          // adding a zero-width space character
          span.appendChild( doc.createTextNode("\u200b") );
          range.insertNode(span);
          rect = span.getClientRects()[0];
          x = rect.left;
          y = rect.top;
          var spanParent = span.parentNode;
          spanParent.removeChild(span);

          // Glue any broken text nodes back together
          spanParent.normalize();
        }
      }
    }
  }

  return { x: x, y: y };
}

saveData = () => {
  localStorage.setItem('adtorDatum', adtor.editor.innerHTML);
  localStorage.setItem('adtorTitle', title.value);
  // console.log("saveData", adtor.editor.innerHTML, title.value);
}

saveHTML = (data, filename,type) => {
  let htmlContent = "<!DOCTYPE html>"+
                    "<html>"+
                    "<head>"+
                    "<meta charset='utf-8'>"+
                    "<title>"+filename+"</title>"+
                    "<link rel='stylesheet' href='https://dahalad.github.io/ADtor/newDoc.css'>"+
                    // "<link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css'>"+
                    "<link href='https://fonts.googleapis.com/css?family=Slabo+27px' rel='stylesheet'>"+
                    "</head>"+
                    "<body>"+
                    "<div class='title'>"+filename+"</div><hr>"+
                    "<div>"+data+"</div>"+
                    "</body>"+
                    "</html>";

  let file = new Blob([htmlContent], {type:type});
  let a = document.createElement('a');
  let url = URL.createObjectURL(file);
  a.href = url;
  a.download = filename.html;
  document.body.appendChild(a);
  a.click();
  setTimeout(function(){
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },0);
}


getImage = () => {
  // adtor.imageInput.click();
  // adtor.imageInput.oninput = () => {
    // let files = adtor.imageInput.files;
    let imgurl = prompt("Enter Image URL");
    if (imgurl != null) {

    // let img  = document.createElement('img');
    // img.src = imgurl;
    // console.log(img.src);
    // // img.maxWidth = '500px';
    // img.style.height = '50px';
    // // img.onload  = function(){
    // //   window.URL.revokeObjectURL(this.src)
    // // }
    // adtor.editor.appendChild(img);
    document.execCommand('insertImage', false, imgurl);
  }
}


window.onload = () => {
  let body = document.getElementById('bdy');
  body.style.background = '#f2f2f2';
  let title = document.getElementById('title');
  let undoButton = document.getElementById('undo');
  let redoButton = document.getElementById('redo');
  undoButton.setAttribute('onmousedown', "event.preventDefault();");
  undoButton.onclick = () => { document.execCommand('undo', false, null) };
  redoButton.setAttribute('onmousedown', "event.preventDefault();");
  redoButton.onclick = () => { document.execCommand('redo', false, null) };
  let saveFileButton = document.getElementById('filesave');
  saveFileButton.setAttribute('onmousedown', "event.preventDefault();");
  saveFileButton.onclick = () => { saveHTML(adtor.editor.innerHTML, title.value, 'html') };
  // body.style.position = 'relative';

  class ADtor {
    constructor() {
      this.editor = document.createElement('div');
      this.editor.style.height = '370px';
      this.editor.style.overflowX = 'hidden';
      this.editor.style.overflowY = 'scroll';
      this.editor.setAttribute('class', 'story');
      this.editor.style.width = "100%";
      this.editor.style.border = "solid #f2f2f2 1px";
      this.editor.style.borderRadius = '3px';
      body.appendChild(this.editor);
      this.editor.contentEditable = true;
      // this.editor.focus();
    }
  }


  class Toolbar {
    constructor(adtor) {
      this.container = adtor.editor;
      this.toolbar = document.createElement('div');
      this.toolbar.setAttribute('class', 'toolbar-wrap');
      this.toolbar.style.position = 'absolute';
      this.toolbar.style.display = 'none';

      this.boldButton = document.createElement('button');
      this.boldButton.setAttribute('class', 'toolbar-buttons');
      this.boldButton.setAttribute('name', 'bold');
      this.boldButton.setAttribute('onmousedown', "event.preventDefault();");
      this.boldButton.onclick = () => { this.command('bold') };
      this.boldButton.innerHTML = "<strong>B</strong>";
      this.toolbar.appendChild(this.boldButton);

      this.italicButton = document.createElement('button');
      this.italicButton.setAttribute('class', 'toolbar-buttons');
      this.italicButton.setAttribute('name', 'italic');
      this.italicButton.setAttribute('onmousedown', "event.preventDefault();");
      this.italicButton.onclick = () => { this.command('italic') };
      this.italicButton.innerHTML = "<i>i</i>";
      this.toolbar.appendChild(this.italicButton);

      this.linkButtonSet = false;
      this.linkButton = document.createElement('button');
      this.linkButton.setAttribute('class', 'toolbar-buttons');
      this.linkButton.setAttribute('name', 'link');
      this.linkButton.setAttribute('onmousedown', "event.preventDefault();");
      this.linkButton.onclick = () => { this.linker() };
      this.linkButton.innerHTML = "a";
      this.toolbar.appendChild(this.linkButton);

      this.fsize = 3;
      this.bigTextButton = document.createElement('button');
      this.bigTextButton.setAttribute('class', 'toolbar-buttons');
      this.bigTextButton.setAttribute('name', 'bigtext');
      this.bigTextButton.setAttribute('onmousedown', "event.preventDefault();");
      this.bigTextButton.onclick = () => { this.commandFont('big') };
      this.bigTextButton.innerHTML = "T";
      this.toolbar.appendChild(this.bigTextButton);

      this.getInput = document.createElement('prompt');
      this.getInput.style.position = 'absolute';
      this.getInput.style.top = '0px';
      this.getInput.style.left = '0px';
      this.getInput.style.display = 'none';
      this.getInput.style.width = '265px';
      this.getInput.style.height = '18px';
      this.getInput.style.borderRadius = '5px';
      this.getInput.style.border = 'none';
      this.getInput.style.outline = 'none';
      this.getInput.style.background = '#000000';
      this.getInput.style.color = '#f2f2f2';
      this.getInput.style.padding = '8px 5px';
      this.getInput.contentEditable = true;
      this.getInput.setAttribute('class', 'prompter');
      this.getInput.setAttribute('onkeydown', "event.preventDefault();");
      this.getInput.onkeydown = (evt) => { this.getUrl(evt) };
      this.getInput.setAttribute('placeholder', 'url: ');
      this.toolbar.appendChild(this.getInput);

      this.smallTextButton = document.createElement('button');
      this.smallTextButton.setAttribute('class', 'toolbar-buttons');
      this.smallTextButton.setAttribute('name', 'smalltext');
      this.smallTextButton.setAttribute('onmousedown', "event.preventDefault();");
      this.smallTextButton.onclick = () => { this.commandFont('small') };
      this.smallTextButton.innerHTML = 't';
      this.toolbar.appendChild(this.smallTextButton);

      this.codeButton = document.createElement('button');
      this.codeButton.setAttribute('class', 'toolbar-buttons');
      this.codeButton.setAttribute('name', 'code');
      this.codeButton.setAttribute('onmousedown', "event.preventDefault();");
      this.codeButton.onclick = () => { this.commandWithArg('code') };
      this.codeButton.innerHTML = '<>';
      this.toolbar.appendChild(this.codeButton);

      this.quoteButton = document.createElement('button');
      this.quoteButton.setAttribute('class', 'toolbar-buttons');
      this.quoteButton.setAttribute('name', 'quote');
      this.quoteButton.setAttribute('onmousedown', "event.preventDefault();");
      this.quoteButton.onclick = () => {this.commandWithArg('blockquote')};
      this.quoteButton.innerHTML = "\"";
      this.toolbar.appendChild(this.quoteButton);

      body.appendChild(this.toolbar);

    }

    linker() {
      let success;
      if (!this.linkButtonSet) {
        savedSel = this.saveSelection();
        this.getInput.style.display = 'block';
        this.getInput.focus();
      }else {
        try {
          success = document.execCommand('unlink', false, null);
        } catch (e) {
          console.log(e);
        }
        if (success) {
          this.linkButtonSet = false;
        }
      }
    }

    getUrl(evnt) {
      if (evnt.keyCode == 13) {
        let success;
        evnt.preventDefault();
        let url = this.getInput.innerText;
        console.log(url);
        this.getInput.style.display = 'none';
        this.restoreSelection(savedSel);
        if (url != '') {
          try {
            success = document.execCommand('createLink', fadfklsdalse, url);
          } catch (e) {
            console.log(e);
          }
          if (success) {
            this.getInput.innerHTML = "";
            this.linkButtonSet = true;
          }
        }
      }else if (evnt.keyCode == 27) {
        evnt.preventDefault();
        this.getInput.style.display = 'none';
        this.getInput.innerHTML = "";
      }
    }

    saveSelection() {
      if (window.getSelection) {
        let sel = window.getSelection();
        if (sel.getRangeAt && sel.rangeCount) {
          return sel.getRangeAt(0);
        }
      } else if (document.selection && document.selection.createRange) {
        return document.selection.createRange();
      }
      return null;
    }

    restoreSelection(range) {
      if (range) {
        if (window.getSelection) {
          let sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
        } else if (document.selection && range.select) {
          range.select();
        }
      }
    }

    command(action) {
      let success;
      console.log(typeof action, action);
      try {
        success = document.execCommand(action, false, null);
      } catch (error) {
        console.log(error);
      }
    }

    commandFont(action) {
      let success;
      if (action === 'big') {
        if (this.fsize<7) {
          this.fsize++;
        }
      }else {
        if (this.fsize>1) {
          this.fsize--;
        }
      }
      try {
        success = document.execCommand('fontSize', false, this.fsize);
      } catch (e) {
        console.log(e);
      }
      // console.log(success);
    }

    // commandCode(action) {
    //   let success;
    //   let selecteData = window.getSelection();
    //   // let sel = window.getSelection();
    //   let parser = selecteData.anchorNode;
    //   let isSurroundedByCode = false;
    //   let codeNode;
    //   while (parser != this.container && parser != null) {
    //     // console.log(parser);
    //     parser = parser.parentNode;
    //     if (parser.nodeName == "CODE") {
    //       isSurroundedByCode = true;
    //       codeNode = parser;
    //       break;
    //     }
    //   }
    //   console.log(isSurroundedByCode);
    //   if (isSurroundedByCode) {
    //     try {
    //       codeNode.outerHTML = codeNode.innerHTML;
    //     } catch (e) {
    //       console.log(e);
    //     }
    //   }else {
    //     let content = selecteData.toString();
    //     try {
    //       let nextSegment = selecteData.focusNode.parentNode.nextSibling;
    //       console.log(nextSegment);
    //       let range = document.createRange();
    //       range.setStart(nextSegment, 0);
    //       range.setEnd(nextSegment, 0 );
    //       range.collapse(false);
    //       selecteData.removeAllRanges();
    //       selecteData.addRange(range);
    //
    //       success = document.execCommand('insertHTML', false, '&nbsp;&nbsp;&nbsp;&nbsp;<code>'+content+'</code>&nbsp;&nbsp;&nbsp;&nbsp;')
    //     } catch (e) {
    //       console.log(e);
    //     }
    //     if (success) {
    //       let nextSegment;
    //         nextSegment = selecteData.focusNode.nextSibling;
    //         if (nextSegment == null) {
    //           nextSegment = document.createTextNode("\u200b\u200b");
    //           selecteData.focusNode.parentNode.appendChild(nextSegment);
    //           // console.log("catch success");
    //         }
    //
    //       console.log(nextSegment);
    //       let range = document.createRange();
    //       range.setStart(nextSegment, 0);
    //       range.setEnd(nextSegment, 0 );
    //       range.collapse(false);
    //       selecteData.removeAllRanges();
    //       selecteData.addRange(range);
    //
    //
    //     }
    //   }
    // }

    commandWithArg(arg) {
      let success;
      let selecteData = window.getSelection();
      let parser = selecteData.anchorNode;
      let isSurroundedByBlockquote = false;
      let blockquoteNode;
      while (parser != this.container && parser != null) {
        parser = parser.parentNode;
        if (parser.nodeName == arg.toUpperCase()) {
          isSurroundedByBlockquote = true;
          blockquoteNode = parser;
          break;
        }
      }
      // console.log(isSurroundedByBlockquote);
      if (isSurroundedByBlockquote) {
        try {
          let nextSegment = selecteData.focusNode.parentNode.nextSibling;
          console.log(selecteData.focusNode, selecteData.focusNode.parentNode,nextSegment);
          let range = document.createRange();
          range.setStart(nextSegment, 0);
          range.setEnd(nextSegment, 0 );
          range.collapse(false);
          selecteData.removeAllRanges();
          selecteData.addRange(range);
          blockquoteNode.outerHTML = blockquoteNode.innerHTML;
        } catch (e) {
          console.log(e);
        }
      }else {
        let content = selecteData.toString();
        try {
          success = document.execCommand('insertHTML', false, '&nbsp;&nbsp;&nbsp;&nbsp;<'+arg+'>'+content+'</'+arg+'>&nbsp;&nbsp;&nbsp;&nbsp;')
        } catch (e) {
          console.log(e);
        }
          console.log(success);
          // console.log(selecteData.focusNode, selecteData.focusNode.nextSibling);
          if (success) {
            let nextSegment;
              nextSegment = selecteData.focusNode.nextSibling;
              if (nextSegment == null) {
                nextSegment = document.createTextNode("\u200b\u200b");
                selecteData.focusNode.parentNode.appendChild(nextSegment);
                // console.log("catch success");
              }
            console.log(selecteData.focusNode, selecteData.focusNode.parentNode,nextSegment);
            let range = document.createRange();
            range.setStart(nextSegment, 0);
            range.setEnd(nextSegment, 0 );
            range.collapse(false);
            selecteData.removeAllRanges();
            selecteData.addRange(range);


            if (navigator.appCodeName == "Mozilla") {
              console.log("firefox");
              //remove all br tags
              let brs = adtor.editor.getElementsByTagName("br");
              for (var i = 0; i < brs.length; i++) { brs[i].parentNode.removeChild(brs[i]); }

            }
          }

        }
      }
    }

  displayToolbar = () => {
    if (document.getSelection().toString() != '') {
      // if (window.getSelection().toString() != '') {
      let coords = getSelectionCoords(adtor.editor);
      // console.log(coords.x, coords.y);
      // console.log(coords.x, window.innerWidth);
      if (coords.x+335 > window.innerWidth) {
        coords.x = window.innerWidth-400;
        // console.log(coords.x);
      }
      toolbar.toolbar.style.left = coords.x+'px';
      toolbar.toolbar.style.top = coords.y-45+'px';
      toolbar.toolbar.style.display = 'block';
      // }
    }else {
      toolbar.toolbar.style.display = 'none';
    }
  }

  // document.execCommand("insertBrOnReturn", false, false);
  adtor = new ADtor();
  toolbar = new Toolbar(adtor);


  // console.log(localStorage.getItem('adtorDatum'));
  if (localStorage.getItem('adtorDatum')) {
    adtor.editor.innerHTML = localStorage.getItem('adtorDatum');
  }
  if (localStorage.getItem('adtorTitle')) {
    title.value = localStorage.getItem('adtorTitle')
  }

  adtor.editor.focus();
  let startSel = document.getSelection();
  let startRange = document.createRange();
  let lastItem = adtor.editor.childNodes[adtor.editor.childNodes.length-1];
  // console.log(lastItem, lastItem.length-1);
  if (lastItem.nodeName === 'DIV') {
    console.log(lastItem.childNodes[lastItem.childNodes.length-1], lastItem.childNodes[lastItem.childNodes.length-1].length-1);
    startRange.setStart(lastItem.childNodes[lastItem.childNodes.length-1], lastItem.childNodes[lastItem.childNodes.length-1].length-1);
    startRange.setEnd(lastItem.childNodes[lastItem.childNodes.length-1], lastItem.childNodes[lastItem.childNodes.length-1].length-1);
  }else {
    startRange.setStart(lastItem, lastItem.length-1);
    startRange.setEnd(lastItem, lastItem.length-1);
  }
  startRange.collapse(false);
  startSel.removeAllRanges();
  startSel.addRange(startRange);

  adtor.editor.onselectstart = () => {

    ['keyup', 'mouseup'].forEach((evt)=>{ adtor.editor.addEventListener(evt, displayToolbar) });


    ['keyup', 'mouseup'].forEach((evt)=>{adtor.editor.removeEventListener(evt, ()=>{console.log("keyuo removed")})});
  }
}
