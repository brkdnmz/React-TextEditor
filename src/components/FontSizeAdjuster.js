import Grid from "@mui/material/Grid";
import { MdKeyboardArrowDown } from "@react-icons/all-files/md/MdKeyboardArrowDown";
import { MdKeyboardArrowUp } from "@react-icons/all-files/md/MdKeyboardArrowUp";

function FontSizeAdjuster(props) {
  return (
    <Grid
      item
      display={"inline-flex"}
      flexDirection={"column"}
      alignItems={"center"}
      sx={{ cursor: "pointer" }}
    >
      <Grid
        display={"inline-flex"}
        onMouseEnter={(e) => props.handleIncreaseMouseEnter(e)}
        onMouseLeave={(e) => props.handleIncreaseMouseLeave(e)}
        onMouseDown={(e) => props.handleIncreaseMouseDown(e)}
        onMouseUp={(e) => props.handleIncreaseMouseUp(e)}
      >
        <MdKeyboardArrowUp color={"#fff"} fontSize={"21px"} />
      </Grid>
      <Grid
        display={"inline-flex"}
        onMouseEnter={(e) => props.handleDecreaseMouseEnter(e)}
        onMouseLeave={(e) => props.handleDecreaseMouseLeave(e)}
        onMouseDown={(e) => props.handleDecreaseMouseDown(e)}
        onMouseUp={(e) => props.handleDecreaseMouseUp(e)}
      >
        <MdKeyboardArrowDown color={"#fff"} fontSize={"21px"} />
      </Grid>
    </Grid>
  );
}

export default FontSizeAdjuster;
