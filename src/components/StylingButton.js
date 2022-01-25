import Button from "@mui/material/Button";

function StylingButton({ children }) {
  return (
    <Button
      sx={{
        padding: "6px",
        margin: 0,
        minWidth: "auto",
        color: "#fff",
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        borderBottom: 0,
      }}
      variant="outlined"
      color="inherit"
      fullWidth
    >
      {children}
    </Button>
  );
}

export default StylingButton;
