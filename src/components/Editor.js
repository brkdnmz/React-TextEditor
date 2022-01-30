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
  const [cursorInfo, setCursorInfo] = useState({ curLine: 1, curCol: 1 });

  const editorRef = useRef({ current: null });
  const editorContainerRef = useRef({ current: null });

  const increaseFont = useCallback(() => {
    setFontSize((fontSize) => Math.min(100, fontSize + 4));
  }, []);

  const decreaseFont = useCallback(() => {
    setFontSize((fontSize) => Math.max(12, fontSize - 4));
  }, []);

  const getCursorInfo = useCallback(() => {
    const editor = editorRef.current;
    const range = getSelection().getRangeAt(0);
    return {
      curLine:
        Array.from(editor.childNodes).indexOf(
          isText(range.startContainer)
            ? range.startContainer.parentNode
            : range.startContainer
        ) + 1,
      curCol: range.startOffset + 1,
    };
  }, []);

  const updateCursorInfo = useCallback(() => {
    setCursorInfo(() => getCursorInfo());
  }, [getCursorInfo]);

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

  const updateCursorPos = useCallback(
    (newCursorInfo) => {
      const editor = editorRef.current;
      const range = getSelection().getRangeAt(0);
      let targetLine = editor.childNodes[newCursorInfo.lineIndex];

      if (isText(targetLine.firstChild)) {
        targetLine = targetLine.firstChild;
      }

      range.setStart(targetLine, newCursorInfo.offset);
      range.setEnd(targetLine, newCursorInfo.offset);

      updateScroll();
      setCursorInfo(() => ({
        curLine: newCursorInfo.lineIndex + 1,
        curCol: newCursorInfo.offset + 1,
      }));
    },
    [updateScroll]
  );

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
      lineIndex: getLineIndex(combinedLine),
      offset: startOffset,
    };

    updateCursorPos(newCursorInfo);
  }, [getLineIndex, updateCursorPos]);

  const handleClick = () => {
    updateScroll();
  };

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

      let newCursorInfo = {
        lineIndex: getLineIndex(
          !isText(cursorNode) ? cursorNode : cursorNode.parentNode
        ),
        offset: range.startOffset,
      };

      /* Valid character */
      if (e.key.length === 1) {
        newCursorInfo.offset++;

        if (!isEmpty(cursorNode)) {
          cursorNode.textContent =
            cursorNode.textContent.slice(0, range.startOffset) +
            e.key +
            cursorNode.textContent.slice(range.startOffset);
        } else {
          cursorNode.textContent = e.key;
        }
      } else if (e.key === "Backspace") {
        if (!selected) {
          if (range.startOffset) {
            newCursorInfo.offset--;

            cursorNode.textContent =
              cursorNode.textContent.slice(0, range.startOffset - 1) +
              cursorNode.textContent.slice(range.startOffset);

            if (!cursorNode.textContent) {
              cursorNode.parentNode.innerHTML = "<br>";
            }
          } else {
            if (isText(cursorNode)) cursorNode = cursorNode.parentNode;

            if (cursorNode.previousSibling) {
              newCursorInfo.lineIndex--;
              newCursorInfo.offset = textLength(cursorNode.previousSibling);

              const combinedNode = createEmptyLine();

              if (
                !isEmpty(cursorNode) ||
                !isEmpty(cursorNode.previousSibling)
              ) {
                combinedNode.textContent =
                  cursorNode.previousSibling.textContent +
                  cursorNode.textContent;
              }

              cursorNode.previousSibling.remove();
              editor.insertBefore(combinedNode, cursorNode);
              cursorNode.remove();
            }
          }
        }
      } else if (e.key === "Enter") {
        newCursorInfo.lineIndex++;
        newCursorInfo.offset = 0;

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
            newCursorInfo.offset--;
          } else if (cursorNode.previousSibling) {
            newCursorInfo.lineIndex--;
            newCursorInfo.offset = textLength(cursorNode.previousSibling);
          }
        }
      } else if (e.key === "ArrowRight") {
        if (isText(cursorNode)) cursorNode = cursorNode.parentNode;

        if (!selected) {
          if (range.startOffset !== cursorNode.textContent.length) {
            newCursorInfo.offset++;
          } else if (cursorNode.nextSibling) {
            newCursorInfo.lineIndex++;
            newCursorInfo.offset = 0;
          }
        } else {
          newCursorInfo = {
            lineIndex: getLineIndex(
              !isText(range.endContainer)
                ? range.endContainer
                : range.endContainer.parentNode
            ),
            offset: range.endOffset,
          };
        }
      }

      updateCursorPos(newCursorInfo);
      updateLineCount();
    },
    [eraseSelectedRange, getLineIndex, updateCursorPos, updateLineCount]
  );

  /**
   * Initialize the editor with an empty line
   */
  useEffect(() => {
    let editor = editorRef.current;
    editor.innerHTML = "<div><br></div>";
    editor.style.display = "inline";
  }, []);

  /**
   * Initialize onSelectionChange
   */
  useEffect(() => {
    const editor = editorRef.current;

    $(document).on("selectionchange", () => {
      if (!getSelection().rangeCount) return;

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

      setFocusedLines(() => [first, last]);

      updateCursorInfo();
    });

    return () => {
      $(editor).off("selectionchange");
    };
  }, [getLineIndex, updateCursorInfo]);

  useEffect(() => {
    const lines = editorRef.current.childNodes;
    lines.forEach((line, i) => {
      if (focusedLines[0] <= i && i <= focusedLines[1]) {
        line.classList.add(styles.focused);
      } else {
        line.classList.remove(styles.focused);
      }
    });
  }, [focusedLines]);

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
      setFocusedLines([]);
    };

    const editor = editorRef.current;

    $(editor).hover(handleHover, handleUnHover);
    $(editor).focus(handleFocus);
    $(editor).blur(handleBlur);

    return () => {
      $(editor).off("mouseenter mouseleave focus blur");
    };
  }, []);

  useEffect(() => {
    const editor = editorRef.current;
    const wheelHandler = (e) => {
      if (!e.ctrlKey) return;

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
    cursorInfo,
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
              onClick={handleClick}
            />
          </Grid>
        </Grid>
      </Paper>
      <EditorFooter />
    </MainContext.Provider>
  );
}

export default Editor;
