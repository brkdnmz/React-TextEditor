import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import Grid from "@mui/material/Grid";
import Editor from "./components/Editor";

function App() {
  return (
    <Grid
      container
      minHeight={"100vh"}
      justifyContent={"center"}
      // bgcolor={"rgb(227,227,227)"}
      sx={{
        background:
          "linear-gradient(45deg, rgba(90,186,252,1) 0%, rgba(255,106,214,1) 100%)",
      }}
    >
      <Grid
        container
        item
        flexDirection={"column"}
        xs
        md={6}
        marginTop={"12%"}
        padding={1}
      >
        <Editor />
      </Grid>
    </Grid>
  );
}

export default App;
