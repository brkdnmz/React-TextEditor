import Grid from "@mui/material/Grid";
import React, {useContext} from "react";
import MainContext from "../MainContext";
import Typography from "@mui/material/Typography";
import styles from "./Gutter.module.css";
import {isBetween} from "../utils/Editor_utils";

function Gutter({xs, bgcolor}) {
  const {fontSize, lineCount, focusedLines} = useContext(MainContext);

  return (
    <Grid container item xs={xs} className={styles.gutter} bgcolor={bgcolor}>
      <Typography
        component={"div"}
        fontSize={fontSize}
        fontFamily={"monospace"}
        textAlign={"end"}
        lineHeight={1.5}
      >
        {[...Array(lineCount)].map((_, lineNumber) => (
          <div
            key={lineNumber + 1}
            className={
              isBetween(lineNumber, ...focusedLines)
                ? styles.focused
                : styles.lineNumber
            }
          >
            {lineNumber + 1}
          </div>
        ))}
      </Typography>
    </Grid>
  );
}

export default Gutter;
