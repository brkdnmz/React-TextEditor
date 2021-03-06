import React, { useContext } from "react";
import Grid from "@mui/material/Grid";
import StylingButton from "./StylingButton";
import { FaBold } from "@react-icons/all-files/fa/FaBold";
import { FaItalic } from "@react-icons/all-files/fa/FaItalic";
import FontSizeDisplay from "./FontSizeDisplay";
import MainContext from "../MainContext";

function EditorHeader() {
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
