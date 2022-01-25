import Grid from "@mui/material/Grid";
import React, { useContext } from "react";
import MainContext from "../MainContext";
import Typography from "@mui/material/Typography";
import styles from "./Gutter.module.css";

function Gutter({ xs, bgcolor }) {
  const { fontSize, lineCount, focusedLines } = useContext(MainContext);
  const lines = [...Array(lineCount)].map((_, i) => (
    <div key={i} className={styles.lineNumber}>
      {i + 1}
    </div>
  ));
  for (const focusedLine of focusedLines) {
    lines[focusedLine - 1] = React.cloneElement(lines[focusedLine - 1], {
      style: {
        backgroundColor: "rgba(0, 255, 0, 0.7)",
        color: "white",
      },
    });
  }

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
