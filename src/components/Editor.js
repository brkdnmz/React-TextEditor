import Grid from "@mui/material/Grid";
import { useEffect, useRef, useState } from "react";
import MainContext from "../MainContext";
import Paper from "@mui/material/Paper";
import EditorHeader from "./EditorHeader";
import Gutter from "./Gutter";
import $ from "jquery";
import styles from "./Editor.module.css";
import { nextLeafNode } from "../utils/Editor_utils";

function Editor() {
  const [fontSize, setFontSize] = useState(24);
  const [inputText, setInputText] = useState("");
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

  const handleKeyDown = (e) => {
    if (e.ctrlKey) return;
    setInputText($(editorRef.current).html());
    if (e.key === "Enter") {
      /* TODO */
    }
    if (e.key === "Backspace") {
      setCursorPos((cursorPos) => Math.max(0, cursorPos - 1));
    } else if (e.key !== "Delete") {
      setCursorPos((cursorPos) => cursorPos + 1);
    }
  };

  useEffect(() => {
    if (!editorRef.current) return;
    $(editorRef.current).html(inputText);
  }, [inputText]);

  useEffect(() => {
    if (!editorRef.current) return;

    let curNode = editorRef.current;
    let leftLength = inputText.length;

    console.log("cursor:", cursorPos);

    while (curNode.firstChild) {
      for (const child of curNode.childNodes) {
        if (leftLength <= child.textContent.length) {
          curNode = child;
          break;
        }
        leftLength -= child.textContent.length;
      }
    }

    $(editorRef.current).focus();
    const sel = getSelection();
    const range = sel.getRangeAt(0);
    const offset = leftLength <= curNode.textContent.length ? leftLength : 0;
    console.log(offset);
    range.setStart(curNode, offset);
    sel.removeAllRanges();
    sel.addRange(range);
  }, [cursorPos, inputText]);

  useEffect(() => {
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
        len += curNode.textContent.length;
        if (curNode === range.startContainer) len -= range.startOffset;
        curNode = nextLeafNode(curNode);
      }
      len += range.endOffset;
    };

    $(document).on("selectionchange", (e) => updateFocusedLines(e));

    return () => {
      $(document).off("selectionchange");
    };
  }, []);

  useEffect(() => {
    if (!editorRef.current) return;
    // $(editorRef.current).html(
    //   "x<strong>abc</strong>y<strong><em>asdsaas</em></strong>asdsa"
    // );
  }, []);

  useEffect(() => {
    if (!editorRef.current) return;
    let elem = editorRef.current;
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

    let elem = editorRef.current;

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
