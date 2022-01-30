import Grid from "@mui/material/Grid";
import React, { useContext, useEffect, useState } from "react";
import MainContext from "../MainContext";
import Typography from "@mui/material/Typography";
import styles from "./Gutter.module.css";

function Gutter({ xs, bgcolor }) {
  const { fontSize, lineCount, focusedLines } = useContext(MainContext);
  const [lineNumbers, setLineNumbers] = useState([]);

  useEffect(() => {
    setLineNumbers(() =>
      [...Array(lineCount)].map((_, i) => (
        <div key={i} className={styles.lineNumber}>
          {i + 1}
        </div>
      ))
    );
  }, [lineCount]);

  useEffect(() => {
    setLineNumbers((lineNumbers) =>
      lineNumbers.map((lineNumber, i) => {
        if (focusedLines[0] <= i && i <= focusedLines[1]) {
          lineNumber = React.cloneElement(lineNumber, {
            style: {
              background: "lightgray",
            },
          });
        } else {
          lineNumber = (
            <div key={i} className={styles.lineNumber}>
              {i + 1}
            </div>
          );
        }
        return lineNumber;
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
        {lineNumbers}
      </Typography>
    </Grid>
  );
}

export default Gutter;
