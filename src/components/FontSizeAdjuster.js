import Grid from "@mui/material/Grid";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";

function FontSizeAdjuster(props) {
  return (
    <Grid
      item
      display={"inline-flex"}
      flexDirection={"column"}
      alignItems={"center"}
      sx={{ cursor: "pointer" }}
    >
      <Grid display={"inline-flex"}>
        <MdKeyboardArrowUp
          color={"#fff"}
          fontSize={"21px"}
          onMouseEnter={(e) => props.handleIncreaseMouseEnter(e)}
          onMouseLeave={(e) => props.handleIncreaseMouseLeave(e)}
          onMouseDown={(e) => props.handleIncreaseMouseDown(e)}
          onMouseUp={(e) => props.handleIncreaseMouseUp(e)}
        />
      </Grid>
      <Grid display={"inline-flex"}>
        <MdKeyboardArrowDown
          color={"#fff"}
          fontSize={"21px"}
          onMouseEnter={(e) => props.handleDecreaseMouseEnter(e)}
          onMouseLeave={(e) => props.handleDecreaseMouseLeave(e)}
          onMouseDown={(e) => props.handleDecreaseMouseDown(e)}
          onMouseUp={(e) => props.handleDecreaseMouseUp(e)}
        />
      </Grid>
    </Grid>
  );
}

export default FontSizeAdjuster;
