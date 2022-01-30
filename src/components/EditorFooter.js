import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { useContext } from "react";
import MainContext from "../MainContext";

function EditorFooter() {
  const { cursorInfo } = useContext(MainContext);
  return (
    <Grid container justifyContent={"end"}>
      <Grid item paddingRight={1}>
        <Typography variant={"body1"} color={"white"}>
          <em>
            Line: {cursorInfo.curLine} Column: {cursorInfo.curCol}
          </em>
        </Typography>
      </Grid>
    </Grid>
  );
}

export default EditorFooter;
