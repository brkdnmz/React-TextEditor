import React, { useContext } from "react";
import Grid from "@mui/material/Grid";
import StylingButton from "./StylingButton";
import { FaBold, FaItalic } from "react-icons/fa";
import FontSizeDisplay from "./FontSizeDisplay";
import MainContext from "../MainContext";

function EditorHeader(props) {
  const { fontSize, increaseFont, decreaseFont } = useContext(MainContext);
  return (
    <>
      <Grid item xs={"auto"} alignSelf={"end"}>
        <StylingButton>
          <FaBold fontSize={30} />
        </StylingButton>
      </Grid>
      <Grid item xs={"auto"} alignSelf={"end"}>
        <StylingButton>
          <FaItalic fontSize={30} />
        </StylingButton>
      </Grid>
      <Grid container item xs alignItems={"end"}>
        <FontSizeDisplay
          fontSize={fontSize}
          onFontIncrease={increaseFont}
          onFontDecrease={decreaseFont}
        />
      </Grid>
    </>
  );
}

export default EditorHeader;
