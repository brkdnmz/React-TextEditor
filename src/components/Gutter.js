import Grid from "@mui/material/Grid";
import React, { useContext, useEffect, useRef, useState } from "react";
import MainContext from "../MainContext";
import Typography from "@mui/material/Typography";
import styles from "./Gutter.module.css";

function Gutter({ xs, bgcolor }) {
  const { fontSize, lineCount, focusedLines } = useContext(MainContext);
  const [lines, setLines] = useState([]);

  useEffect(() => {
    setLines(() =>
      [...Array(lineCount)].map((_, i) => (
        <div key={i} className={styles.lineNumber}>
          {i + 1}
        </div>
      ))
    );
  }, [lineCount]);

  useEffect(() => {
    setLines((lines) =>
      lines.map((line, i) => {
        if (focusedLines[0] <= i && i <= focusedLines[1]) {
          line = React.cloneElement(line, {
            style: {
              background: "lightgray",
            },
          });
        } else {
          line = (
            <div key={i} className={styles.lineNumber}>
              {i + 1}
            </div>
          );
        }
        return line;
      })
    );
  }, [focusedLines]);

  return (
    <Grid container item xs={xs} className={styles.gutter} bgcolor={bgcolor}>
      <Typography
        component={"div"}
        fontSize={fontSize}
        fontFamily={"monospace"}
        textAlign={"end"}
        lineHeight={1.5}
      >
        {lines}
      </Typography>
    </Grid>
  );
}

export default Gutter;
