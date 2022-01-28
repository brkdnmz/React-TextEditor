import Grid from "@mui/material/Grid";
import { useEffect, useRef, useState } from "react";
import MainContext from "../MainContext";
import Paper from "@mui/material/Paper";
import EditorHeader from "./EditorHeader";
import Gutter from "./Gutter";
import $ from "jquery";
import styles from "./Editor.module.css";
import { createEmptyLine, isEmpty, textLength } from "../utils/Editor_utils";
import { wait } from "@testing-library/user-event/dist/utils";

function Editor() {
  const [fontSize, setFontSize] = useState(24);
  const [paperElevation, setPaperElevation] = useState(1);
  const [lineCount, setLineCount] = useState(1);
  const [focusedLines, setFocusedLines] = useState([]);
  const [borderColor, setBorderColor] = useState("#eee");

  const editorRef = useRef({ current: null });

  const increaseFont = () => {
    setFontSize((fontSize) => Math.min(100, fontSize + 4));
  };

  const decreaseFont = () => {
    setFontSize((fontSize) => Math.max(12, fontSize - 4));
  };

  const updateCursorPos = (newCursorInfo) => {
    const editor = editorRef.current;
    const range = getSelection().getRangeAt(0);
    let targetLine = editor.childNodes[newCursorInfo.lineIndex];

    if (!isEmpty(targetLine.firstChild)) {
      targetLine = targetLine.firstChild;
    }

    range.setStart(targetLine, newCursorInfo.startOffset);
    range.setEnd(targetLine, newCursorInfo.startOffset);
  };

  const incrementLineCount = () => {
    setLineCount((lineCount) => lineCount + 1);
  };

  const decrementLineCount = () => {
    setLineCount((lineCount) => Math.max(0, lineCount - 1));
  };

  const handleKeyDown = (e) => {
    if (e.ctrlKey) return;

    e.preventDefault();

    const editor = editorRef.current;
    const range = getSelection().getRangeAt(0);

    let cursorNode = range.startContainer;
    let newCursorInfo = {
      lineIndex: Array.from(editor.childNodes).indexOf(
        isEmpty(cursorNode) ? cursorNode : cursorNode.parentNode
      ),
      startOffset: range.startOffset,
      endOffset: range.endOffset,
    };

    if (e.key === "Enter") {
      if (range.collapsed) {
        newCursorInfo.lineIndex++;
        newCursorInfo.startOffset = 0;

        if (!cursorNode.firstChild) {
          cursorNode = cursorNode.parentNode;
        }

        let leftPart = document.createElement("div");
        leftPart.textContent = cursorNode.textContent.slice(
          0,
          range.startOffset
        );

        let rightPart = document.createElement("div");
        rightPart.textContent = cursorNode.textContent.slice(range.startOffset);

        if (isEmpty(leftPart)) leftPart = createEmptyLine();
        if (isEmpty(rightPart)) rightPart = createEmptyLine();

        editor.insertBefore(leftPart, cursorNode);
        editor.insertBefore(rightPart, cursorNode);

        cursorNode.remove();

        incrementLineCount();
      }
    } else if (e.key === "Backspace") {
      if (range.collapsed) {
        if (range.startOffset) {
          newCursorInfo.startOffset--;

          cursorNode.textContent =
            cursorNode.textContent.slice(0, range.startOffset - 1) +
            cursorNode.textContent.slice(range.startOffset);

          if (!cursorNode.textContent) {
            cursorNode.parentNode.innerHTML = "<br>";
          }
        } else {
          if (!isEmpty(cursorNode)) cursorNode = cursorNode.parentNode;

          if (cursorNode.previousSibling) {
            newCursorInfo.lineIndex--;
            newCursorInfo.startOffset = textLength(cursorNode.previousSibling);

            const combinedNode = createEmptyLine();

            if (!isEmpty(cursorNode) || !isEmpty(cursorNode.previousSibling)) {
              combinedNode.textContent =
                cursorNode.previousSibling.textContent + cursorNode.textContent;
            }

            cursorNode.previousSibling.remove();
            editor.insertBefore(combinedNode, cursorNode);
            cursorNode.remove();

            decrementLineCount();
          }
        }
      }
    } else if (
      (47 < e.which && e.which < 58) ||
      (64 < e.which && e.which < 91) ||
      e.key === " "
    ) {
      newCursorInfo.startOffset++;

      if (!isEmpty(cursorNode)) {
        cursorNode.textContent =
          cursorNode.textContent.slice(0, range.startOffset) +
          e.key +
          cursorNode.textContent.slice(range.startOffset);
      } else {
        cursorNode.textContent = e.key;
      }
    } else if (e.key === "ArrowLeft") {
      if (!isEmpty(cursorNode)) cursorNode = cursorNode.parentNode;

      if (range.startOffset) {
        newCursorInfo.startOffset--;
      } else if (cursorNode.previousSibling) {
        newCursorInfo.lineIndex--;
        newCursorInfo.startOffset = textLength(cursorNode.previousSibling);
      }
    } else if (e.key === "ArrowRight") {
      if (!isEmpty(cursorNode)) cursorNode = cursorNode.parentNode;

      if (range.startOffset !== cursorNode.textContent.length) {
        newCursorInfo.startOffset++;
      } else if (cursorNode.nextSibling) {
        newCursorInfo.lineIndex++;
        newCursorInfo.startOffset = 0;
      }
    }
    updateCursorPos(newCursorInfo);
  };

  /**
   * Initialize the editor with an empty line
   */
  useEffect(() => {
    if (!editorRef.current) return;

    $(editorRef.current).html("<div><br></div>");
  }, []);

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
            />
          </Grid>
        </Grid>
      </Paper>
    </MainContext.Provider>
  );
}

export default Editor;
