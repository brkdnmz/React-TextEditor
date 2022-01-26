import Grid from "@mui/material/Grid";
import { useEffect, useRef, useState } from "react";
import MainContext from "../MainContext";
import Paper from "@mui/material/Paper";
import EditorHeader from "./EditorHeader";
import Gutter from "./Gutter";
import $ from "jquery";
import styles from "./Editor.module.css";
import { createEmptyLine, isEmpty, textLength } from "../utils/Editor_utils";

function Editor() {
  const [fontSize, setFontSize] = useState(24);
  const [paperElevation, setPaperElevation] = useState(1);
  const [lineCount, setLineCount] = useState(1);
  const [focusedLines, setFocusedLines] = useState([]);
  const [borderColor, setBorderColor] = useState("#eee");
  const [cursorPos, setCursorPos] = useState(0);

  const editorRef = useRef({ current: null });

  const increaseFont = () => {
    setFontSize((fontSize) => Math.min(100, fontSize + 4));
  };

  const decreaseFont = () => {
    setFontSize((fontSize) => Math.max(12, fontSize - 4));
  };

  const incrementCursorPos = () => {
    setCursorPos((cursorPos) => cursorPos + 1);
  };

  const deccrementCursorPos = () => {
    setCursorPos((cursorPos) => Math.max(0, cursorPos - 1));
  };

  const incrementLineCount = () => {
    setLineCount((lineCount) => lineCount + 1);
  };

  const decrementLineCount = () => {
    setLineCount((lineCount) => Math.max(0, lineCount - 1));
  };

  const handleClick = () => {
    const range = getSelection().getRangeAt(0);

    let curNode = range.startContainer;
    if (!isEmpty(curNode)) curNode = curNode.parentNode;
    let newPos = range.startOffset + (curNode.previousSibling !== null);

    while (1) {
      curNode = curNode.previousSibling;

      if (!curNode) break;

      if (!isEmpty(curNode)) newPos += textLength(curNode);
      if (curNode.previousSibling) newPos++;
    }
    console.log(newPos);
    setCursorPos(() => newPos);
  };

  const handleKeyDown = (e) => {
    if (e.ctrlKey) return;

    e.preventDefault();

    const editor = editorRef.current;
    const range = getSelection().getRangeAt(0);
    let cursorNode = range.startContainer;

    if (e.key === "Enter") {
      if (range.collapsed) {
        if (!isEmpty(cursorNode)) {
          cursorNode = cursorNode.parentNode;
        }

        if (
          isEmpty(cursorNode) ||
          range.startOffset === textLength(cursorNode)
        ) {
          editor.insertBefore(createEmptyLine(), cursorNode.nextSibling);
        } else {
          let leftPart = document.createElement("div");
          leftPart.textContent = cursorNode.textContent.slice(
            0,
            range.startOffset
          );

          let rightPart = document.createElement("div");
          rightPart.textContent = cursorNode.textContent.slice(
            range.startOffset
          );

          editor.insertBefore(leftPart, cursorNode);
          editor.insertBefore(rightPart, cursorNode);

          cursorNode.remove();
        }

        incrementCursorPos();
        incrementLineCount();
      }
    } else if (e.key === "Backspace") {
      if (range.collapsed) {
        if (!isEmpty(cursorNode)) {
          cursorNode.textContent =
            cursorNode.textContent.slice(0, range.startOffset - 1) +
            cursorNode.textContent.slice(range.startOffset);

          if (!cursorNode.textContent) {
            cursorNode.parentNode.innerHTML = "<br>";
          }
        } else if (cursorNode.previousSibling) {
          cursorNode.remove();
          decrementLineCount();
        }

        deccrementCursorPos();
      }
    } else if (e.key === "Delete") {
      /* TODO */
    } else if (
      (47 < e.which && e.which < 58) ||
      (64 < e.which && e.which < 91)
    ) {
      if (!isEmpty(cursorNode)) {
        cursorNode.textContent =
          cursorNode.textContent.slice(0, range.startOffset) +
          e.key +
          cursorNode.textContent.slice(range.startOffset);
      } else {
        cursorNode.textContent = e.key;
      }

      incrementCursorPos();
    } else if (e.key === "ArrowLeft") {
      deccrementCursorPos();
    } else if (e.key === "ArrowRight") {
      if (cursorPos <= textLength(editor) + lineCount - 1) {
        incrementCursorPos();
      }
    }
  };

  /**
   * Initialize the editor with an empty line
   */
  useEffect(() => {
    if (!editorRef.current) return;

    $(editorRef.current).html("<div><br></div>");
  }, []);

  /**
   * Update the cursor position
   */
  useEffect(() => {
    if (!editorRef.current) return;

    let root = editorRef.current;
    let targetNode = null;
    let offset = cursorPos;

    for (const child of root.childNodes) {
      if (isEmpty(child)) {
        if (offset === 0) {
          targetNode = child;
          break;
        }

        offset--;
        if (offset === 0 && !child.nextSibling) {
          targetNode = child;
        }
      } else {
        if (offset <= textLength(child)) {
          targetNode = child.firstChild;
          break;
        }
        offset -= textLength(child) + 1;
      }
    }

    const sel = getSelection();

    if (!sel.rangeCount) return;

    const range = sel.getRangeAt(0);
    range.setStart(targetNode, offset);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  }, [cursorPos]);

  /*useEffect(() => {
    const updateFocusedLines = (e) => {
      if (document.activeElement !== editorRef.current) return;

      const sel = getSelection();
      const range = sel.getRangeAt(0);
      let len = 0;

      if (range.startContainer === range.endContainer) {
        len = range.endOffset - range.startOffset;
        return;
      }

      let curNode = range.startContainer;
      const lastNode = range.endContainer;

      while (curNode !== lastNode) {
        len += textLength(curNode);
        if (curNode === range.startContainer) len -= range.startOffset;
        curNode = nextLeafNode(curNode);
      }
      len += range.endOffset;
    };

    $(document).on("selectionchange", (e) => updateFocusedLines(e));

    return () => {
      $(document).off("selectionchange");
    };
  }, []);*/

  useEffect(() => {
    if (!editorRef.current) return;

    const handleHover = () => {
      if ($(editorRef.current).is(":focus")) return;
      setBorderColor("#ccc");
    };

    const handleUnHover = () => {
      if ($(editorRef.current).is(":focus")) return;
      setBorderColor("#eee");
    };

    const handleFocus = () => {
      setBorderColor("#aaa");
      setPaperElevation(10);
    };

    const handleBlur = () => {
      setBorderColor("#eee");
      setPaperElevation(1);
      setFocusedLines([]);
    };

    const elem = editorRef.current;

    $(elem).hover(
      () => handleHover(),
      () => handleUnHover()
    );

    $(elem).focus(() => handleFocus());

    $(elem).blur(() => handleBlur());

    return () => {
      $(elem).off("mouseenter mouseleave focus blur");
    };
  }, []);

  useEffect(() => {
    if (!editorRef.current) return;

    const elem = editorRef.current;

    elem.onwheel = (e) => {
      if (!e.ctrlKey) return;

      e.preventDefault();

      if (e.deltaY > 0) {
        decreaseFont();
      } else {
        increaseFont();
      }
    };

    return () => {
      elem.onwheel = null;
    };
  }, []);

  const data = {
    fontSize,
    setFontSize,
    increaseFont,
    decreaseFont,
    lineCount,
    focusedLines,
  };

  return (
    <MainContext.Provider value={data}>
      <Grid container>
        <EditorHeader />
      </Grid>
      <Paper
        sx={{
          borderTopLeftRadius: 0,
          maxWidth: "100%",
        }}
        elevation={paperElevation}
      >
        <Grid container>
          <Grid
            container
            item
            xs
            sx={{
              minHeight: "150px",
              maxHeight: "500px",
              overflow: "auto",
              margin: "5px",
            }}
          >
            <Gutter xs={"auto"} bgcolor={borderColor} />
            <Grid
              display={"inline-block"}
              item
              xs
              contentEditable
              className={styles.editorBody}
              fontFamily={"monospace"}
              borderColor={borderColor}
              ref={editorRef}
              fontSize={fontSize}
              onKeyDown={(e) => handleKeyDown(e)}
              onClick={() => handleClick()}
            />
          </Grid>
        </Grid>
      </Paper>
    </MainContext.Provider>
  );
}

export default Editor;
