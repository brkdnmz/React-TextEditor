import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import { useContext, useState } from "react";
import MainContext from "../MainContext";
import FontSizeAdjuster from "./FontSizeAdjuster";
import { BsFillQuestionCircleFill, BsMouse } from "react-icons/bs";
import Tooltip from "@mui/material/Tooltip";
import Zoom from "@mui/material/Zoom";
import { CgArrowsVAlt } from "react-icons/cg";

function FontSizeDisplay({ fontSize, onFontIncrease, onFontDecrease }) {
  const { setFontSize } = useContext(MainContext);
  const [timerId, setTimerId] = useState(0);
  const [intervalId, setIntervalId] = useState(0);
  const holdTimeout = 400;
  const holdInterval = 50;

  const handleIncreaseMouseEnter = (e) => {
    e.preventDefault();
    e.target.style.color = "rgb(0,255,0)";
  };

  const handleIncreaseMouseLeave = (e) => {
    e.preventDefault();
    e.target.style.color = "white";
    handleIncreaseMouseUp(e);
  };

  const handleDecreaseMouseEnter = (e) => {
    e.preventDefault();
    e.target.style.color = "rgb(0,0,255)";
  };

  const handleDecreaseMouseLeave = (e) => {
    e.preventDefault();
    e.target.style.color = "white";
    handleDecreaseMouseUp(e);
  };

  const handleIncreaseMouseDown = (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    setFontSize((fontSize) => Math.min(100, fontSize + 4));
    if (!timerId) {
      const curTimer = setTimeout(() => {
        if (!intervalId) {
          const curInterval = setInterval(() => {
            setFontSize((fontSize) => Math.min(100, fontSize + 4));
          }, holdInterval);
          setIntervalId(() => curInterval);
        }
      }, holdTimeout);
      setTimerId(() => curTimer);
    }
  };

  const handleIncreaseMouseUp = (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    clearTimeout(timerId);
    setTimerId(() => 0);
    clearInterval(intervalId);
    setIntervalId(() => 0);
  };

  const handleDecreaseMouseDown = (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    setFontSize((fontSize) => Math.max(12, fontSize - 4));
    const curTimer = setTimeout(() => {
      if (!intervalId) {
        const curInterval = setInterval(() => {
          setFontSize((fontSize) => Math.max(12, fontSize - 4));
        }, holdInterval);
        setIntervalId(() => curInterval);
      }
    }, holdTimeout);
    setTimerId(() => curTimer);
  };

  const handleDecreaseMouseUp = (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    clearTimeout(timerId);
    setTimerId(() => 0);
    clearInterval(intervalId);
    setIntervalId(() => 0);
  };

  const fontSizeAdjusterProps = {
    handleIncreaseMouseEnter,
    handleIncreaseMouseLeave,
    handleIncreaseMouseDown,
    handleIncreaseMouseUp,
    handleDecreaseMouseEnter,
    handleDecreaseMouseLeave,
    handleDecreaseMouseDown,
    handleDecreaseMouseUp,
  };

  return (
    <>
      <Grid item display={"inline-flex"} xs justifyContent={"end"}>
        <Typography variant="h4" style={{ userSelect: "none" }} color={"white"}>
          Font size: {fontSize}
        </Typography>
      </Grid>
      <FontSizeAdjuster {...fontSizeAdjusterProps} />
      <Grid item display={"inline-flex"}>
        <Typography variant="h4" style={{ userSelect: "none" }} color={"white"}>
          px
          <Tooltip
            title={
              <Grid
                container
                fontSize={14}
                style={{ userSelect: "none" }}
                height={"auto"}
                sx={{ wordWrap: "break-word" }}
                textAlign={"justify"}
              >
                <Typography variant={"body2"}>
                  Increase/decrease the font size by 4 by clicking the arrows.
                  Pressing and holding the arrows will keep the font size
                  increasing / decreasing.
                </Typography>
                <br />
                <Typography variant={"body2"}>
                  You can also use <code>Ctrl</code> + <BsMouse fontSize={16} />
                  <CgArrowsVAlt fontSize={16} />
                  inside the editor to adjust the font size.
                </Typography>
              </Grid>
            }
            placement={"top"}
            TransitionComponent={Zoom}
            componentsProps={{
              tooltip: {
                sx: {
                  marginBottom: "0px !important",
                },
              },
            }}
            arrow
          >
            <sup>
              <BsFillQuestionCircleFill fontSize={15} color={"lightgray"} />
            </sup>
          </Tooltip>
        </Typography>
      </Grid>
    </>
  );
}

export default FontSizeDisplay;
