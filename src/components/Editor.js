import Grid from "@mui/material/Grid";
import { useCallback, useEffect, useRef, useState } from "react";
import MainContext from "../MainContext";
import Paper from "@mui/material/Paper";
import EditorHeader from "./EditorHeader";
import Gutter from "./Gutter";
import $ from "jquery";
import styles from "./Editor.module.css";
import {
  createEmptyLine,
  isBetween,
  isEmpty,
  isText,
  textLength,
} from "../utils/Editor_utils";
import EditorFooter from "./EditorFooter";

function Editor() {
  const [fontSize, setFontSize] = useState(24);
  const [paperElevation, setPaperElevation] = useState(1);
  const [lineCount, setLineCount] = useState(1);
  const [focusedLines, setFocusedLines] = useState([0, -1]);
  const [borderColor, setBorderColor] = useState("#eee");
  const [cursorPos, setCursorPos] = useState({ line: 0, column: 0 });

  const editorRef = useRef({ current: null });
  const editorContainerRef = useRef({ current: null });

  const increaseFont = useCallback(() => {
    setFontSize((fontSize) => Math.min(100, fontSize + 4));
  }, []);

  const decreaseFont = useCallback(() => {
    setFontSize((fontSize) => Math.max(12, fontSize - 4));
  }, []);

  const getLineIndex = useCallback((line) => {
    return Array.from(editorRef.current.childNodes).indexOf(line);
  }, []);

  const getCurLineIndex = useCallback(() => {
    const sel = getSelection();
    let firstLine = sel.anchorNode;
    let lastLine = sel.focusNode;

    if (isText(firstLine)) firstLine = firstLine.parentNode;
    if (isText(lastLine)) lastLine = lastLine.parentNode;

    if (getLineIndex(firstLine) < getLineIndex(lastLine))
      return getLineIndex(lastLine);
    return getLineIndex(lastLine);
  }, [getLineIndex]);

  const updateCursorPos = useCallback((newCursorPos) => {
    const editor = editorRef.current;
    const range = getSelection().getRangeAt(0);
    let targetLine = editor.childNodes[newCursorPos.line];
    if (isText(targetLine.firstChild)) {
      targetLine = targetLine.firstChild;
    }

    range.setStart(targetLine, newCursorPos.column);
    range.collapse(true);

    setCursorPos(() => newCursorPos);
  }, []);

  const updateScroll = useCallback(() => {
    const editor = editorRef.current;
    const editorContainer = editorContainerRef.current;
    const range = getSelection().getRangeAt(0);
    const lineHeight = fontSize * 1.5;

    const minScrollTop = getCurLineIndex() * lineHeight;
    const maxScrollTop =
      (getCurLineIndex() + 1) * lineHeight +
      ($(editor).outerHeight(true) - $(editor).height()) - // border + padding + margin
      $(editorContainer).height();

    editorContainer.scrollTop = Math.min(
      editorContainer.scrollTop,
      minScrollTop
    );
    editorContainer.scrollTop = Math.max(
      editorContainer.scrollTop,
      maxScrollTop
    );

    let minScrollLeft = 0;
    let maxScrollLeft = 0;

    if (isText(range.startContainer)) {
      minScrollLeft =
        (range.startOffset / textLength(range.startContainer)) *
        $(range.startContainer.parentNode).width();
      maxScrollLeft =
        (range.startOffset / textLength(range.startContainer)) *
        $(range.startContainer.parentNode).width();
      maxScrollLeft -= $(editor).width();
    }

    editor.scrollLeft = Math.min(editor.scrollLeft, minScrollLeft);
    editor.scrollLeft = Math.max(editor.scrollLeft, maxScrollLeft);
  }, [fontSize, getCurLineIndex]);

  const updateFocusedLines = useCallback((start, end) => {
    const lines = editorRef.current.childNodes;
    setFocusedLines((prevFocusedLines) => {
      for (
        let i = Math.min(start, prevFocusedLines[0]);
        i <= Math.min(lines.length - 1, Math.max(end, prevFocusedLines[1]));
        i++
      ) {
        if (!isBetween(i, start, end))
          lines[i].classList.remove(styles.focused);
        else lines[i].classList.add(styles.focused);
      }
      return [start, end];
    });
  }, []);

  const updateLineCount = useCallback(() => {
    setLineCount(() => editorRef.current.childNodes.length);
  }, []);

  const eraseSelectedRange = useCallback(() => {
    const range = getSelection().getRangeAt(0);
    let startLine = range.startContainer;
    let endLine = range.endContainer;
    let startOffset = range.startOffset;
    let endOffset = range.endOffset;

    if (isText(startLine)) startLine = startLine.parentNode;
    if (isText(endLine)) endLine = endLine.parentNode;

    // In "Range", startContainer always comes before endContainer

    if (startLine === endLine) {
      startLine.textContent =
        startLine.textContent.slice(0, startOffset) +
        startLine.textContent.slice(endOffset);
    } else {
      startLine.textContent = startLine.textContent.slice(0, startOffset);
      endLine.textContent = endLine.textContent.slice(endOffset);

      let curLine = startLine.nextSibling;
      while (curLine !== endLine) {
        const nextLine = curLine.nextSibling;
        curLine.remove();
        curLine = nextLine;
      }
    }

    if (!startLine.textContent) startLine.innerHTML = "<br>";
    if (!endLine.textContent) endLine.innerHTML = "<br>";

    const combinedLine = createEmptyLine();
    if (!isEmpty(startLine) || !isEmpty(endLine)) {
      combinedLine.textContent = startLine.textContent;
      if (startLine !== endLine)
        combinedLine.textContent += endLine.textContent;
    }

    editorRef.current.insertBefore(combinedLine, startLine);
    startLine.remove();
    if (startLine !== endLine) endLine.remove();

    const newCursorInfo = {
      line: getLineIndex(combinedLine),
      column: startOffset,
    };

    updateCursorPos(newCursorInfo);
  }, [getLineIndex, updateCursorPos]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.ctrlKey) return;
      e.preventDefault();

      const editor = editorRef.current;
      let range = getSelection().getRangeAt(0);
      const selected = !range.collapsed;

      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight" && selected) {
        eraseSelectedRange();
        range = getSelection().getRangeAt(0);
      }

      let cursorNode = range.startContainer; // if the range is collapsed, the cursor is in the startContainer

      let newCursorPos = {
        line: getLineIndex(
          !isText(cursorNode) ? cursorNode : cursorNode.parentNode
        ),
        column: range.startOffset,
      };

      /* Valid character */
      if (e.key.length === 1) {
        newCursorPos.column++;

        if (!isEmpty(cursorNode)) {
          cursorNode.textContent =
            cursorNode.textContent.slice(0, range.startOffset) +
            e.key +
            cursorNode.textContent.slice(range.startOffset);
        } else {
          cursorNode.textContent = e.key;
        }
      } else if (e.key === "Backspace" && !selected) {
        if (range.startOffset) {
          newCursorPos.column--;

          cursorNode.textContent =
            cursorNode.textContent.slice(0, range.startOffset - 1) +
            cursorNode.textContent.slice(range.startOffset);

          if (!cursorNode.textContent) {
            cursorNode.parentNode.innerHTML = "<br>";
          }
        } else {
          if (isText(cursorNode)) cursorNode = cursorNode.parentNode;

          if (cursorNode.previousSibling) {
            newCursorPos.line--;
            newCursorPos.column = textLength(cursorNode.previousSibling);

            const combinedNode = createEmptyLine();

            if (!isEmpty(cursorNode) || !isEmpty(cursorNode.previousSibling)) {
              combinedNode.textContent =
                cursorNode.previousSibling.textContent + cursorNode.textContent;
            }

            cursorNode.previousSibling.remove();
            editor.insertBefore(combinedNode, cursorNode);
            cursorNode.remove();
          }
        }
      } else if (e.key === "Enter") {
        newCursorPos.line++;
        newCursorPos.column = 0;

        if (isText(cursorNode)) cursorNode = cursorNode.parentNode;

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
      } else if (e.key === "ArrowLeft") {
        if (isText(cursorNode)) cursorNode = cursorNode.parentNode;

        if (!selected) {
          if (range.startOffset) {
            newCursorPos.column--;
          } else if (cursorNode.previousSibling) {
            newCursorPos.line--;
            newCursorPos.column = textLength(cursorNode.previousSibling);
          }
        }
      } else if (e.key === "ArrowRight") {
        if (isText(cursorNode)) cursorNode = cursorNode.parentNode;

        if (!selected) {
          if (range.startOffset !== cursorNode.textContent.length) {
            newCursorPos.column++;
          } else if (cursorNode.nextSibling) {
            newCursorPos.line++;
            newCursorPos.column = 0;
          }
        } else {
          newCursorPos = {
            line: getLineIndex(
              !isText(range.endContainer)
                ? range.endContainer
                : range.endContainer.parentNode
            ),
            column: range.endOffset,
          };
        }
      }

      updateCursorPos(newCursorPos);
      updateLineCount();
    },
    [eraseSelectedRange, getLineIndex, updateCursorPos, updateLineCount]
  );

  const handleSelectionChange = useCallback(() => {
    if (!getSelection().rangeCount) return;

    const editor = editorRef.current;
    const range = getSelection().getRangeAt(0);
    let firstLine = range.startContainer;
    let lastLine = range.endContainer;

    if (!editor.contains(firstLine) || !editor.contains(lastLine)) return;

    if (isText(firstLine)) firstLine = firstLine.parentNode;
    if (isText(lastLine)) lastLine = lastLine.parentNode;

    let first = getLineIndex(firstLine);
    let last = getLineIndex(lastLine);
    if (first > last) {
      [first, last] = [last, first];
    }

    updateFocusedLines(first, last);
    if (range.collapsed) {
      updateCursorPos({
        line: getCurLineIndex(),
        column: range.startOffset,
      });
    }
    updateScroll();
  }, [
    getCurLineIndex,
    getLineIndex,
    updateCursorPos,
    updateFocusedLines,
    updateScroll,
  ]);

  /**
   * Initialize the editor with an empty line
   */
  useEffect(() => {
    let editor = editorRef.current;
    editor.innerHTML = "<div><br></div>";
  }, []);

  /**
   * Initialize onSelectionChange
   */
  useEffect(() => {
    $(document).on("selectionchange", handleSelectionChange);

    return () => {
      $(document).off("selectionchange");
    };
  }, [handleSelectionChange]);

  useEffect(() => {
    const handleHover = () => {
      if ($(editorRef.current).is(":focus")) return;
      setBorderColor("#ccc");
      setPaperElevation(3);
    };

    const handleUnHover = () => {
      if ($(editorRef.current).is(":focus")) return;
      setBorderColor("#eee");
      setPaperElevation(1);
    };

    const handleFocus = () => {
      setBorderColor("#aaa");
      setPaperElevation(10);
    };

    const handleBlur = () => {
      setBorderColor("#eee");
      setPaperElevation(1);
      updateFocusedLines(0, -1);
    };

    const editor = editorRef.current;

    $(editor).hover(handleHover, handleUnHover);
    $(editor).focus(handleFocus);
    $(editor).blur(handleBlur);

    return () => {
      $(editor).off("mouseenter mouseleave focus blur");
    };
  }, [updateFocusedLines]);

  useEffect(() => {
    const editor = editorRef.current;
    const wheelHandler = (e) => {
      if (!e.originalEvent.ctrlKey) return;

      e.preventDefault();

      if (e.originalEvent.deltaY > 0) {
        decreaseFont();
      } else {
        increaseFont();
      }
    };
    $(editor).on("mousewheel", wheelHandler);

    return () => {
      $(editor).off("mousewheel");
    };
  }, [decreaseFont, increaseFont]);

  const data = {
    fontSize,
    setFontSize,
    increaseFont,
    decreaseFont,
    lineCount,
    focusedLines,
    cursorInfo: cursorPos,
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
            className={styles.editorContainer}
            ref={editorContainerRef}
          >
            <Gutter xs={"auto"} bgcolor={borderColor} />
            <Grid
              item
              xs
              contentEditable
              spellCheck={false}
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
      <EditorFooter />
    </MainContext.Provider>
  );
}

export default Editor;
