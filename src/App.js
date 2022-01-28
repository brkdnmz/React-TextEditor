import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import Grid from "@mui/material/Grid";
import Editor from "./components/Editor";
import styles from "./App.module.css";

function App() {
  return (
    <Grid container className={styles.App}>
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
        <Grid item xs /> {/*To prevent focusing editor when clicked below*/}
      </Grid>
    </Grid>
  );
}

export default App;
